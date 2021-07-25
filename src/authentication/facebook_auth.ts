import { facebookAccessTokenUrl } from "../config";
import axios from "axios";

interface Result {
  data?: any;
  error?: any;
}

export default async function verifyFacebookUser(token: string) {
  let response: Result = {};
  try {
    const _response = await axios.get(facebookAccessTokenUrl + "=" + token);
    response.data = _response.data;
    return response;
  } catch (err) {
    response.error = err;
    return response;
  }
}
