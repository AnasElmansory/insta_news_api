const { facebookAccessTokenUrl } = require("../config");
const axios = require("axios").default;

module.exports = async function verifyFacebookUser(token) {
  const response = {};
  try {
    const _response = await axios.get(facebookAccessTokenUrl + "?=" + token);
    response.data = _response.data;
    return response;
  } catch (err) {
    response.error = err;
    return response;
  }
};
