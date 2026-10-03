/**
 * Authorization helpers — implement when Feature auth is specified.
 * See .cursor/rules/auth-patterns.mdc and security.mdc.
 */


export async function authenticate(req, res, next) {
  // throw new Error("authenticate() not implemented — add per feature auth spec");
  try {
    req.user = {universityId: 1112233}
    return next()
  }
  catch {
    return res.status(401).send({ message: "heheheha"})
  }
}
export async function authenticateAdmin(req, res, next) {
  // throw new Error("authenticate() not implemented — add per feature auth spec");
  try {
    req.user = {universityId: 1112233}
    return next()
  }
  catch {
    return res.status(401).send({ message: "heheheha"})
  }
}