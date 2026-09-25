import assert from "node:assert/strict";
import test from "node:test";
import { safeAuthReturnPath } from "../src/lib/auth-return-path.ts";

test("auth callbacks retain local confirmation and recovery destinations", () => {
  assert.equal(safeAuthReturnPath("/?confirmed=1"), "/?confirmed=1");
  assert.equal(
    safeAuthReturnPath("/reset-password?recovery=1"),
    "/reset-password?recovery=1",
  );
  assert.equal(safeAuthReturnPath(null), "/");
});

test("auth callbacks cannot send recovery tokens to another origin", () => {
  for (const target of [
    "https://other.invalid",
    "//other.invalid",
    "/\\other.invalid",
    "/\n/other.invalid",
    "javascript:alert(1)",
    "reset-password",
  ]) {
    assert.equal(safeAuthReturnPath(target), "/", target);
  }
});
