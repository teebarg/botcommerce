#!/usr/bin/env python3
"""
Offline evaluation runner for the Thriftbyoba customer support agent.

Usage:
    # From the project root (with Redis running and env vars set)
    python -m scripts.run_offline_eval

    # Or with options:
    python -m scripts.run_offline_eval --golden-set data/golden_set.json --limit 20 --output results/eval_run.json

What it does:
1. Loads the golden set of realistic queries.
2. Runs each case through the real agent (run_agent).
3. Scores every turn with the existing evaluators:
   - tool_accuracy
   - escalation_accuracy
   - response_quality (LLM-as-judge)
   - context_relevance (when retrieval tools were used)
   - latency
4. Aggregates scores by category and overall.
5. Saves a timestamped JSON report so you can track regressions over time.

Requirements:
- Redis must be running (same as production).
- Environment variables / .env must be configured (LLM keys, Qdrant, etc.).
- The agent code must be importable (run from project root).
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# Allow running both as module and as script
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

try:
    import redis.asyncio as redis

    from app.agent.agent_graph import run_agent
    from app.agent.eval_config import SUPPORT_EVAL_CONFIG
    from app.agent.memory import clear_session
    from app.config import get_llm, get_model_name, settings
    from app.observability.evaluators import (
        evaluate_context_relevance,
        evaluate_escalation_accuracy,
        evaluate_latency,
        evaluate_response_quality,
        evaluate_tool_accuracy,
    )
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you run this from the project root and dependencies are installed.")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_golden_set(path: Path) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("Golden set must be a JSON list of cases")
    return data


def extract_tools_called(result: dict) -> list[dict]:
    """Normalize the tools_called format from run_agent."""
    tools = result.get("_tools_called") or []
    # Ensure each item has at least 'name'
    normalized = []
    for t in tools:
        if isinstance(t, dict):
            normalized.append({
                "name": t.get("name", "unknown"),
                "result_preview": t.get("result_preview", "")[:200],
            })
        else:
            normalized.append({"name": str(t), "result_preview": ""})
    return normalized


async def run_single_case(
    redis_client: redis.Redis,
    case: dict,
    llm: Any,
) -> dict:
    """
    Run one golden-set case (possibly multi-turn) and collect scores.
    """
    case_id = case["id"]
    messages = case.get("messages") or []
    if isinstance(messages, str):
        messages = [messages]

    session_id = f"eval-{case_id}-{uuid.uuid4().hex[:8]}"
    expected_tools = set(case.get("expected_tools") or [])
    expected_escalation = bool(case.get("expected_escalation", False))

    turn_results = []
    final_reply = ""
    final_tools: list[dict] = []
    final_escalated = False
    total_latency_ms = 0.0
    total_prompt_tokens = 0
    total_completion_tokens = 0

    for i, user_msg in enumerate(messages):
        user_msg = (user_msg or "").strip()
        if not user_msg and i == 0:
            # Allow empty message test
            user_msg = ""

        t0 = time.monotonic()
        try:
            result = await run_agent(
                redis=redis_client,
                message=user_msg,
                session_id=session_id,
                customer_id=None,
            )
            latency_ms = (time.monotonic() - t0) * 1000
        except Exception as exc:
            latency_ms = (time.monotonic() - t0) * 1000
            result = {
                "reply": f"[ERROR] {exc}",
                "escalated": False,
                "_tools_called": [],
                "_prompt_tokens": 0,
                "_completion_tokens": 0,
            }
            print(f"  ⚠️  Case {case_id} turn {i+1} raised: {exc}")

        tools_called = extract_tools_called(result)
        reply = result.get("reply", "")
        escalated = bool(result.get("escalated", False)) or bool(result.get("form") in ("escalation_details",))
        # Also treat complaint form as a soft escalation path for scoring
        if result.get("form") == "complaint":
            escalated = True  # for the purpose of "did we leave normal agent flow"

        prompt_tokens = result.get("_prompt_tokens", 0) or 0
        completion_tokens = result.get("_completion_tokens", 0) or 0

        total_latency_ms += latency_ms
        total_prompt_tokens += prompt_tokens
        total_completion_tokens += completion_tokens
        final_reply = reply
        final_tools = tools_called
        final_escalated = escalated

        turn_results.append({
            "turn": i + 1,
            "user_message": user_msg,
            "reply": reply,
            "tools_called": [t["name"] for t in tools_called],
            "escalated": escalated,
            "form": result.get("form"),
            "latency_ms": round(latency_ms, 1),
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
        })

    # ---- Score the final state of the case ----
    tools_called = final_tools
    user_message_for_eval = " | ".join(messages)  # join multi-turn for evaluators

    # 1. Tool accuracy
    ta_score, ta_note = await evaluate_tool_accuracy(
        user_message=user_message_for_eval,
        tools_called=tools_called,
        agent_reply=final_reply,
        tool_expectations=SUPPORT_EVAL_CONFIG.tool_expectations,
    )

    # Simple expected-tools check (stricter than the heuristic)
    actual_tool_names = {t["name"] for t in tools_called}
    if expected_tools:
        # At least one of the expected tools should have been called
        # (or for "no tools" cases, none of the search/order tools)
        if expected_tools == set():
            # We expected no retrieval / order tools
            bad_tools = actual_tool_names & {
                "search_products", "search_faqs", "search_policies",
                "check_order_status", "check_stock", "escalate_to_human"
            }
            tool_match_score = 0.0 if bad_tools else 1.0
            tool_match_note = f"Expected no tools, got {bad_tools or 'none'}"
        else:
            overlap = actual_tool_names & expected_tools
            tool_match_score = 1.0 if overlap else 0.0
            tool_match_note = f"Expected one of {expected_tools}, got {actual_tool_names or 'none'}"
    else:
        tool_match_score = 1.0
        tool_match_note = "No specific tool expectation"

    # 2. Escalation accuracy
    ea_score, ea_note = await evaluate_escalation_accuracy(
        user_message=user_message_for_eval,
        agent_reply=final_reply,
        escalated=final_escalated,
        tools_called=tools_called,
        routine_patterns=SUPPORT_EVAL_CONFIG.routine_patterns,
        high_risk_patterns=SUPPORT_EVAL_CONFIG.high_risk_patterns,
    )

    # Explicit expected escalation check
    if expected_escalation == final_escalated:
        esc_match_score = 1.0
        esc_match_note = "Escalation decision matched expectation"
    else:
        esc_match_score = 0.0
        esc_match_note = f"Expected escalated={expected_escalation}, got {final_escalated}"

    # 3. Response quality (LLM judge)
    rq_score, rq_note = await evaluate_response_quality(
        user_message=user_message_for_eval,
        agent_reply=final_reply,
        llm=llm,
        tools_called=tools_called,
    )

    # 4. Context relevance (only meaningful if retrieval happened)
    cr_score, cr_note = await evaluate_context_relevance(
        user_message=user_message_for_eval,
        tools_called=tools_called,
        llm=llm,
    )

    # 5. Latency
    lat_score, lat_note = evaluate_latency(total_latency_ms)

    # Composite
    scores = {
        "tool_accuracy": round(ta_score, 3),
        "tool_match": round(tool_match_score, 3),
        "escalation_accuracy": round(ea_score, 3),
        "escalation_match": round(esc_match_score, 3),
        "response_quality": round(rq_score, 3),
        "context_relevance": round(cr_score, 3),
        "latency": round(lat_score, 3),
    }

    notes = {
        "tool_accuracy": ta_note,
        "tool_match": tool_match_note,
        "escalation_accuracy": ea_note,
        "escalation_match": esc_match_note,
        "response_quality": rq_note,
        "context_relevance": cr_note,
        "latency": lat_note,
    }

    # Clean up Redis session
    try:
        await clear_session(redis_client, session_id)
    except Exception:
        pass

    return {
        "id": case_id,
        "category": case.get("category", "unknown"),
        "notes": case.get("notes", ""),
        "messages": messages,
        "expected_tools": list(expected_tools),
        "expected_escalation": expected_escalation,
        "turns": turn_results,
        "final_reply": final_reply,
        "final_tools": [t["name"] for t in final_tools],
        "final_escalated": final_escalated,
        "scores": scores,
        "eval_notes": notes,
        "total_latency_ms": round(total_latency_ms, 1),
        "total_prompt_tokens": total_prompt_tokens,
        "total_completion_tokens": total_completion_tokens,
    }


def aggregate(results: list[dict]) -> dict:
    """Compute overall and per-category averages."""
    if not results:
        return {}

    def avg(key: str) -> float:
        vals = [r["scores"][key] for r in results if r["scores"].get(key) is not None]
        return round(sum(vals) / len(vals), 3) if vals else 0.0

    overall = {
        "tool_accuracy": avg("tool_accuracy"),
        "tool_match": avg("tool_match"),
        "escalation_accuracy": avg("escalation_accuracy"),
        "escalation_match": avg("escalation_match"),
        "response_quality": avg("response_quality"),
        "context_relevance": avg("context_relevance"),
        "latency": avg("latency"),
        "num_cases": len(results),
        "avg_latency_ms": round(
            sum(r["total_latency_ms"] for r in results) / len(results), 1
        ),
        "total_tokens": sum(
            r["total_prompt_tokens"] + r["total_completion_tokens"] for r in results
        ),
    }

    # Per category
    categories: dict[str, list] = {}
    for r in results:
        cat = r["category"]
        categories.setdefault(cat, []).append(r)

    by_category = {}
    for cat, items in categories.items():
        by_category[cat] = {
            "num_cases": len(items),
            "tool_match": round(
                sum(i["scores"]["tool_match"] for i in items) / len(items), 3
            ),
            "escalation_match": round(
                sum(i["scores"]["escalation_match"] for i in items) / len(items), 3
            ),
            "response_quality": round(
                sum(i["scores"]["response_quality"] for i in items) / len(items), 3
            ),
            "avg_latency_ms": round(
                sum(i["total_latency_ms"] for i in items) / len(items), 1
            ),
        }

    return {"overall": overall, "by_category": by_category}


def print_summary(report: dict) -> None:
    overall = report["summary"]["overall"]
    print("\n" + "=" * 60)
    print("OFFLINE EVAL SUMMARY")
    print("=" * 60)
    print(f"Cases run          : {overall['num_cases']}")
    print(f"Model              : {report.get('model_name', '?')}")
    print(f"Avg latency        : {overall['avg_latency_ms']:.0f} ms")
    print(f"Total tokens       : {overall['total_tokens']}")
    print("-" * 60)
    print(f"Tool match         : {overall['tool_match']:.2%}")
    print(f"Tool accuracy      : {overall['tool_accuracy']:.2%}")
    print(f"Escalation match   : {overall['escalation_match']:.2%}")
    print(f"Escalation accuracy: {overall['escalation_accuracy']:.2%}")
    print(f"Response quality   : {overall['response_quality']:.2%}")
    print(f"Context relevance  : {overall['context_relevance']:.2%}")
    print(f"Latency score      : {overall['latency']:.2%}")
    print("-" * 60)
    print("By category:")
    for cat, stats in report["summary"]["by_category"].items():
        print(
            f"  {cat:20s}  n={stats['num_cases']:2d}  "
            f"tool={stats['tool_match']:.2f}  esc={stats['escalation_match']:.2f}  "
            f"quality={stats['response_quality']:.2f}  lat={stats['avg_latency_ms']:.0f}ms"
        )
    print("=" * 60)

    # Highlight failures
    failures = [
        r for r in report["results"]
        if r["scores"]["tool_match"] < 0.5 or r["scores"]["escalation_match"] < 0.5
    ]
    if failures:
        print("\n⚠️  Cases with tool or escalation mismatches:")
        for r in failures:
            print(
                f"  - {r['id']} ({r['category']}): "
                f"tools={r['final_tools']} esc={r['final_escalated']} "
                f"| expected_tools={r['expected_tools']} expected_esc={r['expected_escalation']}"
            )
    print()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def main(args: argparse.Namespace) -> None:
    golden_path = Path(args.golden_set)
    if not golden_path.exists():
        print(f"❌ Golden set not found: {golden_path}")
        sys.exit(1)

    cases = load_golden_set(golden_path)
    if args.category:
        cases = [c for c in cases if c.get("category") == args.category]
    if args.limit:
        cases = cases[: args.limit]

    print(f"Loaded {len(cases)} cases from {golden_path}")
    print(f"Model provider: {settings.LLM_PROVIDER}")

    redis_client = redis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        max_connections=5,
    )
    llm = get_llm()
    model_name = get_model_name()

    results = []
    for i, case in enumerate(cases, 1):
        print(f"[{i}/{len(cases)}] Running {case['id']} ({case.get('category')}) ...")
        result = await run_single_case(redis_client, case, llm)
        results.append(result)
        # Small delay to be kind to rate limits
        await asyncio.sleep(0.3)

    await redis_client.aclose()

    summary = aggregate(results)
    report = {
        "run_id": datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "model_name": model_name,
        "llm_provider": settings.LLM_PROVIDER,
        "golden_set": str(golden_path),
        "num_cases": len(results),
        "summary": summary,
        "results": results,
    }

    # Save report
    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Report saved to {out_path}")

    print_summary(report)

    # Optional: simple regression check against a previous report
    if args.baseline:
        baseline_path = Path(args.baseline)
        if baseline_path.exists():
            with open(baseline_path, encoding="utf-8") as f:
                baseline = json.load(f)
            prev = baseline.get("summary", {}).get("overall", {})
            curr = summary["overall"]
            print("Regression check vs baseline:")
            for key in ["tool_match", "escalation_match", "response_quality"]:
                p = prev.get(key, 0)
                c = curr.get(key, 0)
                delta = c - p
                flag = "🔴" if delta < -0.05 else ("🟢" if delta > 0.02 else "⚪")
                print(f"  {flag} {key}: {p:.3f} → {c:.3f} ({delta:+.3f})")
        else:
            print(f"Baseline file not found: {baseline_path}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Offline eval runner for support agent")
    parser.add_argument(
        "--golden-set",
        default="data/golden_set.json",
        help="Path to golden set JSON",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Where to write the JSON report (default: results/eval_YYYYMMDD_HHMMSS.json)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Run only the first N cases (useful for smoke tests)",
    )
    parser.add_argument(
        "--category",
        default=None,
        help="Run only cases from this category (e.g. product_search, escalation)",
    )
    parser.add_argument(
        "--baseline",
        default=None,
        help="Previous report JSON to compare against for regressions",
    )
    args = parser.parse_args()

    if args.output is None:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        args.output = f"results/eval_{ts}.json"
    return args


if __name__ == "__main__":
    args = parse_args()
    asyncio.run(main(args))

# asyncio.run(main(parse_args()))
