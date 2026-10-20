import assert from "node:assert/strict";
import test from "node:test";
import { parseEstimate } from "./duration";
import { defaultLinkLabel, linkKind } from "./links";

test("parseEstimate accepts the common shapes", () => {
  assert.equal(parseEstimate("90"), 90);
  assert.equal(parseEstimate("45m"), 45);
  assert.equal(parseEstimate("2h"), 120);
  assert.equal(parseEstimate("1h30m"), 90);
  assert.equal(parseEstimate("1h 30m"), 90);
  assert.equal(parseEstimate("1.5h"), 90);
  assert.equal(parseEstimate("soon"), null);
  assert.equal(parseEstimate("0"), null);
});

test("links get readable labels and kinds", () => {
  assert.equal(defaultLinkLabel("https://github.com/acme/api/pull/482"), "PR #482");
  assert.equal(defaultLinkLabel("https://linear.app/acme/issue/API-214/fix-it"), "API-214");
  assert.equal(linkKind("https://www.notion.so/Webhook-runbook-123"), "doc");
});
