import packageJson from "../../package.json";
export const BondClientVersion = packageJson.version;
export const usingUATApi = true;
export const outOfStock = 3; // billions
export const usingStagingApi = false;

export const Api = {
  FINFO: usingUATApi
    ? "https://finfov4-api-staging.vndirect.com.vn/"
    : "https://api-finfo.vndirect.com.vn/",
  AUTH: usingUATApi
    ? "https://auth-api-suat.vndirect.com.vn"
    : "https://auth-api.vndirect.com.vn",
  TRADE: usingUATApi
    ? "https://trade-api-suat.vndirect.com.vn/"
    : "https://trade-api.vndirect.com.vn/",
  TRADE_BOND: usingUATApi
    ? "https://trade-bo-api-suat.vndirect.com.vn/bondapi/"
    : "https://trade-bo-api.vndirect.com.vn/bondapi/", // 'https://trade-bo-api-stag.vndirect.com.vn/bondapi/', can x-auth-token
  BOND: usingUATApi
    ? "https://bond-api-suat.vndirect.com.vn/bond-api/v1/" // 'https://api.vndirect.com.vn/bond-api/v1/'
    : "https://gw.vndirect.com.vn/bond-api/v1/", //can header x-auth-username
  TRANSACTION: usingUATApi
    ? "https://api-suat.vndirect.com.vn/transaction/"
    : "https://api.vndirect.com.vn/transaction/",
  TRADE_REPORT: usingUATApi
    ? "https://trade-report-api-suat.vndirect.com.vn/"
    : "https://trade-report-api.vndirect.com.vn/",
  TRADE_BO: usingUATApi
    ? "https://trade-bo-api-suat.vndirect.com.vn/"
    : "https://trade-bo-api.vndirect.com.vn/",
  I18N: usingUATApi
    ? "https://i18n-api.vndirect.com.vn/api"
    : "https://i18n-api.vndirect.com.vn/api",
  REGISTRY: usingUATApi
    ? "https://registry-api-uat.vndirect.com.vn/"
    : "https://registry-api.vndirect.com.vn/",
  IDVND: usingUATApi
    ? "https://id-uat.vndirect.com.vn/"
    : "https://id.vndirect.com.vn/",
  KONG: usingUATApi
    ? "https://dgate-uat.vndirect.com.vn/"
    : "https://dgate.vndirect.com.vn/",
  ACCOUNTS: usingUATApi
    ? "https://accounts-uat.vndirect.com.vn/"
    : "https://vndid-int-api.vndirect.com.vn/",
  DSB: usingUATApi
    ? "https://dsb-gateway-fo-uat.vndirect.com.vn/"
    : "https://dsb-gateway-fo.vndirect.com.vn/",
  FINFO_V4: usingUATApi
    ? "https://finfov4-api-uat.vndirect.com.vn/v4/"
    : "https://finfo-api.vndirect.com.vn/v4/",
  DATA_REPORT: usingUATApi
    ? "https://data-report-api-uat.vndirect.com.vn/"
    : // : usingStagingApi ? "https://data-api-stagging.vndirect.com.vn/"
      "https://data-api.vndirect.com.vn/",
  DGATE_PAYMENT: usingUATApi
    ? "https://dgate-payment-uat.vndirect.com.vn/"
    : "https://dgate.vndirect.com.vn/",
  DBOARD: usingUATApi
    ? "https://dboard-uat3.vndirect.com.vn/"
    : "https://trade.vndirect.com.vn/",
};

export const stookBookUrl = usingUATApi ? 'https://sb-uat.stockbook.vn/' : 'https://stockbook.vn/';

export const Event = {
  FIRE_NOTIFICATION: "FIRE_NOTIFICATION",
  CHANGE_LANGUAGE: "CHANGE_LANGUAGE",
  RELOAD_DEALS: "RELOAD_DEALS",
  RELOAD_TRANSACTIONS: "RELOAD_TRANSACTIONS",
  RELOAD_ORDER_BOOK: "RELOAD_ORDER_BOOK",
};

export const popupDefault = {
  // status: true,
  status: false,
  type: null,
  data: null,
  funCallBack: null,
};
