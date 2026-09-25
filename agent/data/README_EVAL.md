# Offline Evaluation for Customer Support Agent

## Files

- `golden_set.json` — 42 realistic test cases covering:
  - Product search (including Nigerian fashion terms)
  - Order tracking (with & without order number, multi-turn)
  - Policies & FAQs
  - “We don’t sell X” (electronics, food, etc.)
  - Escalation triggers (human request, fraud, legal, chargeback)
  - Complaints
  - Edge cases (greetings, off-topic, identity questions)
  - Multi-turn conversations

- `../scripts/run_offline_eval.py` — Runner that:
  - Executes each case through the real `run_agent`
  - Scores with your existing evaluators + stricter expected-tool / expected-escalation checks
  - Produces a timestamped JSON report
  - Prints a summary and highlights mismatches
  - Can compare against a previous report for regressions

## How to run

From the **project root** (with Redis up and `.env` configured):

```bash
# Full run
python -m scripts.run_offline_eval

# Smoke test (first 10 cases)
python -m scripts.run_offline_eval --limit 10

# Only escalation cases
python -m scripts.run_offline_eval --category escalation

# Custom paths + baseline comparison
python -m scripts.run_offline_eval \
  --golden-set data/golden_set.json \
  --output results/eval_latest.json \
  --baseline results/eval_previous.json
```

Reports are written to `results/eval_YYYYMMDD_HHMMSS.json` by default.

## Interpreting scores

| Metric              | What it measures                                      | Target |
|---------------------|-------------------------------------------------------|--------|
| tool_match          | Did we call (one of) the expected tool(s)?            | ≥ 0.85 |
| tool_accuracy       | Heuristic from `evaluate_tool_accuracy`               | ≥ 0.80 |
| escalation_match    | Did escalation decision match the golden label?       | ≥ 0.90 |
| escalation_accuracy | Heuristic from `evaluate_escalation_accuracy`         | ≥ 0.85 |
| response_quality    | LLM-as-judge (correctness + tone)                     | ≥ 0.75 |
| context_relevance   | Were retrieved docs relevant? (when search used)      | ≥ 0.70 |
| latency             | Score based on total time for the case                | ≥ 0.70 |

## Adding new cases

Append objects to `golden_set.json` with this shape:

```json
{
  "id": "unique_id",
  "category": "product_search | order_tracking | policies | faqs | we_dont_sell | escalation | complaint | edge_case | multi_turn | stock",
  "messages": ["first user message", "optional second turn", "..."],
  "expected_tools": ["search_products"],   // empty list = expect no retrieval/order/escalation tools
  "expected_escalation": false,
  "notes": "Short description of the intent"
}
```

For multi-turn cases the runner sends the messages sequentially in the same session.

## Notes

- Each case gets a fresh Redis session that is cleared afterwards.
- The runner respects rate limits with a small sleep between cases.
- `context_relevance` and `groundedness` still need full implementation in `evaluators.py` for the strongest scores (the runner will still run).
- Because the agent uses live LLM + Qdrant + shop API, results can vary slightly between runs. Track trends rather than single-run noise.
