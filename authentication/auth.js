const verifyFacebookUser = require("./facebook_auth");
const verifyGoogleUser = require("./google_auth");

const Admin = require("../models/admin");

function extractToken(req) {
  const { authorization, provider } = req.headers;
  // if (provider === "guest") return { provider, token: "guestToken" };
  if (!authorization) return (req.error = "missing authorization header");
  const token = authorization.split(" ")[1];
  if (!token) return (req.error = "no token found");
  if (!provider) return (req.error = "specify auth provider");
  return { token, provider };
}

async function authorizeUser(req, res, next) {
  const { token, provider } = extractToken(req);
  if (provider === "facebook") {
    const { error, data } = await verifyFacebookUser(token);
    const { id } = data;
    req.params.error = error;
    req.params.userId = id;
    next();
  } else if (provider === "google") {
    const { error, data } = await verifyGoogleUser(token);
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
async function authorizeAdmin(req, res, next) {
  const { userId } = req.params;
  const isAdmin = await Admin.exists({ id: userId });
  req.params.isAdmin = isAdmin;
  next();
}

module.exports = { authorizeUser, authorizeAdmin };
