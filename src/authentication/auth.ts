import verifyFacebookUser from "./facebook_auth";
import verifyGoogleUser from "./google_auth";

import Admin from "../models/admin";

function extractToken(req: {
  headers: { authorization?: string; provider?: string };
  error?: string;
}): { token?: string; provider?: string } {
  let extractionResult = { token: "", provider: "" };
  const { authorization, provider } = req.headers;
  if (!authorization) {
    req.error = "missing authorization header";
  } else {
    const token = authorization.split(" ")[1];
    if (!token) {
      req.error = "no token found";
    } else if (!provider) {
      req.error = "specify auth provider";
    } else {
      extractionResult.provider = provider;
    }
    extractionResult.token = token;
  }
  return extractionResult;
}

async function authorizeUser(req: any, res: any, next: () => void) {
  const { token, provider } = extractToken(req);
  if (provider === "facebook") {
    const { error, data } = await verifyFacebookUser(token!);
    const { id } = data;
    req.params.error = error;
    req.params.userId = id;
    next();
  } else if (provider === "google") {
    const { error, data } = await verifyGoogleUser(token!);
    req.params.error = error;
    if (data) req.params.userId = data.sub;
    next();
  } else if (provider === "guest") {
    req.params.userId = token;
    next();
  } else {
    req.params.error = "unknown provider";
    next();
  }
}
async function authorizeAdmin(req: any, res: any, next: () => void) {
  const { userId } = req.params;
  const isAdmin = await Admin.exists({ id: userId });
  req.params.isAdmin = isAdmin;
  next();
}

export { authorizeUser, authorizeAdmin };
