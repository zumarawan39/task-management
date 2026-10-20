import assert from "node:assert/strict";
import test from "node:test";
import { parseQuickAdd, tokenizeQuickAdd } from "./quickAddParser";

test("parses tags, priority, estimate, and project", () => {
  const parsed = parseQuickAdd("Fix login bug #frontend !high ~45m @mca-crm");
  assert.equal(parsed.title, "Fix login bug");
  assert.deepEqual(parsed.tags, ["frontend"]);
  assert.equal(parsed.priority, "high");
  assert.equal(parsed.estimateMinutes, 45);
  assert.equal(parsed.projectQuery, "mca-crm");
});

test("parses hour estimates and short priorities", () => {
  const parsed = parseQuickAdd("Write notes ~1h30m !u");
  assert.equal(parsed.estimateMinutes, 90);
  assert.equal(parsed.priority, "urgent");
  assert.equal(parsed.title, "Write notes");
});

test("tokenizer keeps every character and classifies tokens", () => {
  const input = "Fix login redirect !h #auth #bug @platform ~45m ~45x";
  const tokens = tokenizeQuickAdd(input);
  assert.equal(tokens.map((token) => token.text).join(""), input);
  const kinds = tokens.filter((token) => token.kind !== "space").map((token) => token.kind);
  assert.deepEqual(kinds, ["text", "text", "text", "priority", "tag", "tag", "project", "estimate", "invalid"]);
  assert.equal(tokenizeQuickAdd("~1h30m")[0]?.kind, "estimate");
});
