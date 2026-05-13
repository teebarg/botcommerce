"""
app/observability/evaluators.py

Four async evaluators, each returning a score (0.0–1.0) + a short note.
All evaluators are best-effort: they never raise.
"""
from __future__ import annotations

import logging
import re
import time
from typing import Any

logger = logging.getLogger(__name__)


# ── 1. Response quality (LLM-as-judge) ───────────────────────────────────────
_QUALITY_SYSTEM = (
    "You are an impartial QA evaluator for a customer support chatbot called Seun "
    "for Thriftbyoba, a fashion and clothing store.\n"
    "Given a customer message, the tool results, and the agent's reply, "
    "score the reply on two dimensions:\n"
    "1. Correctness (0-5): Is the reply accurate and appropriate?\n"
    "   - If the store does not carry what the customer asked for and the agent "
    "correctly says so while redirecting to relevant alternatives, score 5.\n"
    "   - If the agent presents unrelated results as if they match the query, score 0.\n"
    "   - If the agent used tool results accurately, score 4-5.\n"
    "2. Tone (0-5): Is the reply warm, professional, and concise?\n\n"
    "Reply in EXACTLY this format:\n"
    "CORRECTNESS: <integer 0-5>\n"
    "TONE: <integer 0-5>\n"
    "NOTES: <one sentence>"
)


async def evaluate_response_quality(
    user_message: str,
    agent_reply: str,
    llm: Any,
    tools_called: list[dict] = [],
) -> tuple[float, str]:
    """
    Use the LLM to judge response quality.
    Returns (score 0-1, short note).
    """
    from langchain_core.messages import HumanMessage, SystemMessage

    tools_summary = (
        ", ".join(t["name"] for t in tools_called)
        if tools_called else "none"
    )
    tool_results_detail = (
        "\n".join(
            f"- {t['name']}: {t['result_preview'][:150]}"
            for t in tools_called
        )
        if tools_called else "none"
    )

    prompt = (
        f"Customer asked: {user_message}\n\n"
        f"Tools called: {tools_summary}\n"
        f"Tool results:\n{tool_results_detail}\n\n"
        f"Agent reply: {agent_reply}"
    )
    try:
        resp = await llm.ainvoke([
            SystemMessage(content=_QUALITY_SYSTEM),
            HumanMessage(content=prompt),
        ])
        text: str = resp.content.strip()

        corr_match = re.search(r"CORRECTNESS:\s*(\d)", text)
        tone_match = re.search(r"TONE:\s*(\d)", text)
        note_match = re.search(r"NOTES:\s*(.+)", text)

        correctness = int(corr_match.group(1)) if corr_match else 3
        tone = int(tone_match.group(1)) if tone_match else 3
        note = note_match.group(1).strip() if note_match else "No note"

        # Average, normalized to 0-1
        score = round(((correctness + tone) / 10.0), 2)
        return score, note
    except Exception as exc:
        logger.error(f"[Eval] response_quality error: {exc}")
        return 0.5, "Eval failed"


# ── 2. Tool call accuracy (rule-based) ───────────────────────────────────────

# Maps intent keywords → expected tools
_TOOL_EXPECTATIONS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"do you have|looking for|show me|find me|search for|got any|any.*clothes|any.*tops|any.*shoes", re.I), "search_products"),
    (re.compile(r"order|track|status|delivery", re.I),   "check_order_status"),
    (re.compile(r"refund|return|exchange",       re.I),   "request_refund"),
    (re.compile(r"in stock|available|stock",     re.I),   "check_stock"),
    (re.compile(r"policy|return policy|shipping policy", re.I), "search_policies"),
    (re.compile(r"how do I|faq|help with",       re.I),   "search_faqs"),
]

_FORBIDDEN_ESCALATION_PATTERNS = re.compile(
    r"not found|no results|couldn't find|don't carry|unavailable|out of stock",
    re.I,
)


async def evaluate_tool_accuracy(
    user_message: str,
    tools_called: list[dict],
    agent_reply: str,
    tool_expectations: list[tuple] | None = None,
) -> tuple[float, str]:
    """
    Heuristic check: did the agent call the right tool(s) for this message?
    Returns (score 0-1, note).
    """
    expectations = tool_expectations or _TOOL_EXPECTATIONS
    tool_names = {t["name"] for t in tools_called}

    # Check for expected tool
    for pattern, expected_tool in expectations:
        if pattern.search(user_message):
            if expected_tool in tool_names:
                return 1.0, f"Correctly called {expected_tool}"
            else:
                # Might have answered from cache/memory — partial credit
                return 0.5, f"Expected {expected_tool} but not called"

    # Check escalation wasn't triggered for trivial reasons
    if "escalate_to_human" in tool_names:
        if _FORBIDDEN_ESCALATION_PATTERNS.search(agent_reply):
            return 0.0, "Escalated for a non-critical reason (item not found)"
        return 1.0, "Escalation tool called for a plausible reason"

    # No expectation matched — neutral
    return 0.8, "No specific tool expectation for this message"


# ── 3. Escalation decision accuracy ──────────────────────────────────────────
_HIGH_RISK_PATTERNS = re.compile(
    r"fraud|lawsuit|legal action|chargeback|threatening|report you|solicitor",
    re.I,
)
_ROUTINE_PATTERNS = re.compile(
    r"not found|no results|unavailable|don't have|what products|do you sell"
    r"|do you have|looking for|show me|find me|any.*clothes|any.*tops",
    re.I,
)


async def evaluate_escalation_accuracy(
    user_message: str,
    agent_reply: str,
    escalated: bool,
    tools_called: list[dict],
    routine_patterns: str = "",
    high_risk_patterns: str = "",
) -> tuple[float, str]:
    """
    Was the escalation decision correct?
    High-risk message + escalated   → 1.0
    High-risk message + not escalated → 0.2
    Routine message + escalated     → 0.0
    Routine message + not escalated → 1.0
    Ambiguous                        → 0.7
    """
    high_risk_re = re.compile(high_risk_patterns, re.I) if high_risk_patterns else _HIGH_RISK_PATTERNS
    routine_re   = re.compile(routine_patterns,   re.I) if routine_patterns   else _ROUTINE_PATTERNS

    is_high_risk = bool(high_risk_re.search(user_message))
    is_routine   = bool(routine_re.search(user_message))

    if is_high_risk and escalated:
        return 1.0, "Correct: high-risk message escalated"
    if is_high_risk and not escalated:
        return 0.2, "Missed escalation on high-risk message"
    if is_routine and escalated:
        return 0.0, "Incorrect: routine message escalated"
    if is_routine and not escalated:
        return 1.0, "Correct: routine message not escalated"

    # Ambiguous — check whether escalate_to_human was called
    if "escalate_to_human" in {t["name"] for t in tools_called}:
        return 0.8, "Escalation tool called — plausible but not confirmed high-risk"
    return 0.7, "Escalation decision ambiguous"


# ── 4. Latency score ──────────────────────────────────────────────────────────

# Thresholds (ms)
_LATENCY_EXCELLENT = 1_500   # ≤ 1.5s → 1.0
_LATENCY_GOOD      = 3_000   # ≤ 3s   → 0.75
_LATENCY_FAIR      = 6_000   # ≤ 6s   → 0.5
_LATENCY_POOR      = 10_000  # ≤ 10s  → 0.25
                              # > 10s  → 0.0


def evaluate_latency(latency_ms: float) -> tuple[float, str]:
    if latency_ms <= _LATENCY_EXCELLENT:
        return 1.0, f"Excellent latency: {latency_ms:.0f}ms"
    elif latency_ms <= _LATENCY_GOOD:
        return 0.75, f"Good latency: {latency_ms:.0f}ms"
    elif latency_ms <= _LATENCY_FAIR:
        return 0.5, f"Fair latency: {latency_ms:.0f}ms"
    elif latency_ms <= _LATENCY_POOR:
        return 0.25, f"Poor latency: {latency_ms:.0f}ms"
    else:
        return 0.0, f"Unacceptable latency: {latency_ms:.0f}ms"

_GROUNDEDNESS_SYSTEM = (
    "You are evaluating whether a customer support agent's reply is grounded in the "
    "tool results provided, or whether it contains hallucinated details.\n"
    "Given the tool results and the agent reply, score Groundedness (0-5):\n"
    "5 = reply only uses information from tool results\n"
    "3 = reply mostly grounded but adds minor assumptions\n"
    "0 = reply contains product names, prices, or facts not in tool results\n\n"
    "Reply in EXACTLY this format:\n"
    "GROUNDEDNESS: <integer 0-5>\n"
    "NOTES: <one sentence>"
)

async def evaluate_groundedness(
    agent_reply: str,
    tools_called: list[dict],
    llm: Any,
) -> tuple[float, str]:
    """Groundedness (did the reply stay grounded in tool results?)"""
    return 0.0, "[Eval] groundedness: Awaiting Implementation"
    from langchain_core.messages import HumanMessage, SystemMessage

    if not tools_called:
        # No tools called — if reply mentions specific items it's hallucination
        has_price = bool(re.search(r"₦[\d,]+", agent_reply))
        has_sku   = bool(re.search(r"SKU|PRD-|TBH", agent_reply, re.I))
        if has_price or has_sku:
            return 0.0, "Specific product details in reply but no tools were called"
        return 1.0, "No tools called and no fabricated details detected"

    tool_results = "\n\n".join(
        f"Tool: {t['name']}\nResult: {t['result_preview']}"
        for t in tools_called
    )
    prompt = f"Tool results:\n{tool_results}\n\nAgent reply: {agent_reply}"
    try:
        resp = await llm.ainvoke([
            SystemMessage(content=_GROUNDEDNESS_SYSTEM),
            HumanMessage(content=prompt),
        ])
        text = resp.content.strip()
        g_match   = re.search(r"GROUNDEDNESS:\s*(\d)", text)
        note_match = re.search(r"NOTES:\s*(.+)", text)
        score = int(g_match.group(1)) / 5.0 if g_match else 0.5
        note  = note_match.group(1).strip() if note_match else "No note"
        return round(score, 2), note
    except Exception as exc:
        logger.error(f"[Eval] groundedness error: {exc}")
        return 0.5, "Eval failed"


async def evaluate_context_relevance(
    user_message: str,
    tools_called: list[dict],
    llm: Any,
) -> tuple[float, str]:
    """Context relevance (did retrieval return relevant results?)"""
    return 0.0, "[Eval] context_relevance: Awaiting Implementation"
    from langchain_core.messages import HumanMessage, SystemMessage

    # Only meaningful when a search tool was called
    search_tools = [t for t in tools_called if t["name"] in (
        "search_products", "search_faqs", "search_policies"
    )]
    if not search_tools:
        return 1.0, "No retrieval tools called — not applicable"

    system = (
        "You are evaluating whether a retrieval tool returned results relevant "
        "to the customer's query.\n"
        "Score Context Relevance (0-5):\n"
        "5 = results are directly relevant to the query\n"
        "3 = results are partially relevant\n"
        "0 = results are completely unrelated to the query\n\n"
        "Reply in EXACTLY this format:\n"
        "RELEVANCE: <integer 0-5>\n"
        "NOTES: <one sentence>"
    )
    results_text = "\n\n".join(
        f"Query context: {user_message}\nRetrieved: {t['result_preview']}"
        for t in search_tools
    )
    try:
        resp = await llm.ainvoke([
            SystemMessage(content=system),
            HumanMessage(content=results_text),
        ])
        text = resp.content.strip()
        r_match    = re.search(r"RELEVANCE:\s*(\d)", text)
        note_match = re.search(r"NOTES:\s*(.+)", text)
        score = int(r_match.group(1)) / 5.0 if r_match else 0.5
        note  = note_match.group(1).strip() if note_match else "No note"
        return round(score, 2), note
    except Exception as exc:
        logger.error(f"[Eval] context_relevance error: {exc}")
        return 0.5, "Eval failed"