/**
 * Authorization helpers — implement when Feature auth is specified.
 * See .cursor/rules/auth-patterns.mdc and security.mdc.
 */

export function authenticate() {
  throw new Error("authenticate() not implemented — add per feature auth spec");
}

export function authenticateAdmin() {
  throw new Error("authenticateAdmin() not implemented — add per feature auth spec");
}
