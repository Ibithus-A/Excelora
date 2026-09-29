import test from "node:test";
import assert from "node:assert/strict";
import {
  hasPlusAccess,
  hasProAccess,
  normalizeUserPlan,
} from "../src/lib/plans.ts";

test("legacy Premium accounts retain Plus access", () => {
  assert.equal(normalizeUserPlan("premium"), "plus");
  assert.equal(hasPlusAccess("premium"), true);
  assert.equal(hasProAccess("premium"), false);
});

test("the three current plans have ordered feature access", () => {
  assert.equal(hasPlusAccess("basic"), false);
  assert.equal(hasProAccess("basic"), false);
  assert.equal(hasPlusAccess("plus"), true);
  assert.equal(hasProAccess("plus"), false);
  assert.equal(hasPlusAccess("pro"), true);
  assert.equal(hasProAccess("pro"), true);
});
