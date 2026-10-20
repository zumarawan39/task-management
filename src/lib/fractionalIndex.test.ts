import assert from "node:assert/strict";
import test from "node:test";
import { initialOrder, needsRebalance, orderBetween } from "./fractionalIndex";

test("places a task between neighbors", () => {
  assert.equal(orderBetween(1024, 2048), 1536);
  assert.equal(orderBetween(null, null), 1024);
  assert.equal(orderBetween(2048, null), 3072);
});

test("asks for a rebalance when the gap collapses", () => {
  assert.equal(needsRebalance(1, 1 + 1e-8), true);
  assert.equal(needsRebalance(1, 2), false);
  assert.equal(initialOrder(0), 1024);
});
