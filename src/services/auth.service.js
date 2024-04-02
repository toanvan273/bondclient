import JwtDecode from "jwt-decode";

import Util from "../modules/util";
import { emitter } from "../clients/emitter";
import * as Config from "../constants/config";
import moment from "moment";

const tokenName = "accessToken";
const rememberName = "remember";
const cookieExpiresFormat = "ddd, DD MMM YYYY HH:mm:ss [GMT]";

const domain = ".vndirect.com.vn";

export const getRawToken = () => {
  //return "eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJpc3N1ZXIiLCJzdWIiOiJzdWJqZWN0IiwiYXVkIjoiYXVkaWVuY2UiLCJleHAiOjE2NzM3Nzc0MDQsIm5iZiI6MTY2NjE2MzM0NCwiaWF0IjoxNjY2MTYzNDA0LCJyb2xlcyI6IltdIiwiYWNjb3VudFR5cGUiOiJVbmtub3duIiwidl91c2VySWQiOiIyMjI2MjA5MjAxNTAwMTI0IiwidXNlcklkIjoibnVsbCIsInZlcnNpb24iOiJWMiIsImN1c3RvbWVyTmFtZSI6InBydDAwMSIsInRyYWRpbmdFeHAiOjE2NjYxOTIyMDQsImlkZ0lkIjpudWxsLCJwaG9uZSI6IjAzNzAwMDEwMDEiLCJjdXN0b21lcklkIjoiMDAwMTU1MzQwNiIsInJldGlyZWRBY2NvdW50cyI6W10sImVtYWlsIjoibWluaGhvMDAwMDAxQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoicHJ0MDAxIiwic3RhdHVzIjoiQUNUSVZBVEVEIn0.O-z9fS0DXFjd8-k2Huly102wGptB31c9RbA6YTdED0Ni2Z6flxkqVWCH2XUODNeeVEaYdMjIpD_y8L_k87igMFezbKoFkAbCe5cYr_hAi6YBZkqfRYKNvfpNMz0e84yEqxVFRye-_feG6Sitfaa9mf1Z4-pvbNV-qcpd-0syDIML-234wTPuFyZRiEBVkzBkJjglJZMUAbQ24N4ORj89KfPDPa2lfByfBOGUzyIizlmKuw_z-ZBwxqtzmbuWron91eTZqKmS7LitD3gVIH7khyieWmIrvmgcFe7qiXpcMdCS_qsqCs4ddULzYyTuXnaYC5bY6j43bXIkK8FrXs7szQ";
  return Util.getCookie(tokenName);
};

export const getParsedToken = () => {
  let token = getRawToken();

  if (token && token.length > 0 && token !== '""') {
    return new JwtDecode(token);
  }

  return null;
};

export const parseToken = (rawToken) => {
  return new JwtDecode(rawToken);
};

export const setToken = (token, options = {}) => {
  const cookieOptions = {
    name: tokenName,
    value: token,
    path: "/",
    secure: true,
    domain,
  };

  if (options.rememberMe) {
    let expiredTime = new Date(Date.now() + 31536000000);
    Util.setCookie({
      name: rememberName,
      value: "true",
      path: "/",
      secure: true,
      expires: expiredTime,
      domain,
    });

    cookieOptions["expires"] = expiredTime;
  }

  Util.setCookie(cookieOptions);
};

export const isStep2Authenticated = (obj) => {
  let tokenObj = obj || getParsedToken();
  if (tokenObj && tokenObj.version && tokenObj.version.toLowerCase() !== "v2") {
    return tokenObj.secondFa === "true";
  }
  if (
    tokenObj &&
    tokenObj.version &&
    tokenObj.version.toLowerCase() === "v2" &&
    tokenObj.tradingExp &&
    tokenObj.tradingExp > 0
  ) {
    return new Date().getTime() < tokenObj.tradingExp * 1000;
  }
  return false;
};

export const isLoggedIn = () => {
  let tokenObj = getParsedToken();
  return !!tokenObj;
};

export const isPartner = () => {
  let tokenObj = getParsedToken();
  return tokenObj && tokenObj.accountType && tokenObj.accountType === "Partner";
};
// eslint-disable-next-line
export const STAFF_PREFIX = /ipa[\/\\]/;

export const isBackOfficer = () => {
  let tokenObj = getParsedToken();
  return (
    tokenObj &&
    tokenObj.roles.indexOf("Brokers") >= 0 &&
    tokenObj.roles.indexOf("BackOfficer") >= 0
  );
};

export const isOSOUser = () => {
  return true;
};

export const getUserType = (username) => {
  // return 1 of 2 possible values: 'customer' or 'staff'
  let staffRegexPattern = new RegExp(STAFF_PREFIX);
  if (username.match(staffRegexPattern)) {
    return "staff";
  }
  return "customer";
};

export const getCustomerId = () => {
  let tokenObj = getParsedToken();
  return tokenObj ? tokenObj.customerId : null;
};

export const getUsername = () => {
  let tokenObj = getParsedToken();
  return tokenObj ? tokenObj.username : null;
};

export const checkAccessTokenExpiry = () => {
  const tokenObj = getParsedToken();

  if (tokenObj) {
    let currentTime = new Date().getTime();
    let expTime = tokenObj.exp * 1000;
    let tradingExpTime = tokenObj.tradingExp * 1000;
    if (expTime <= currentTime) {
      // token expired
      setToken("");
      emitter.emit(Config.Event.LOGGED_OUT);
      window.location.replace(window.location.origin);
    } else if (tradingExpTime !== 0 && tradingExpTime < currentTime) {
      // tradingExp expired!
      setTimeout(() => {
        emitter.emit(Config.Event.TOKEN_TRADING_TIME_EXPIRED);
      }, 10);
    }
  }
};

export const isRemembered = () => {
  return !!Util.getCookie(rememberName);
};

export const unsetRemembered = () => {
  Util.setCookie({
    name: rememberName,
    value: "",
    path: "/",
    secure: true,
    expires: moment(0).format(cookieExpiresFormat),
    domain,
  });
};
