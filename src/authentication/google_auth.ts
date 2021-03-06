import { OAuth2Client } from "google-auth-library";
import { googleClientId } from "../config";

interface Result {
  data?: any;
  error?: any;
}
//todo google client id;
const oAuth2Client = new OAuth2Client(googleClientId);
//todo get info about user google access token;

export default async function verifyGoogleUser(token: string) {
  let response: Result = {};
  try {
    const tokenInfo = await oAuth2Client.getTokenInfo(token);
    response.data = tokenInfo;
    return response;
  } catch (err) {
    response.error = err;
    return response;
  }
}

/* 
{
  expiry_date: 1619841422390,
  scopes: [ 'https://www.googleapis.com/auth/userinfo.email', 'openid' ],
  azp: '407408718192.apps.googleusercontent.com',
  aud: '407408718192.apps.googleusercontent.com',
  sub: '100453386296507714129',
  exp: '1619841423',
  email: 'ansmg5555@gmail.com',
  email_verified: 'true',
  access_type: 'offline'
}
*/
