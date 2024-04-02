import axios from "axios";
import moment from "moment";
import { getUsername, getRawToken, getCustomerId } from "../services/auth.service";

import * as Config from "../constants/config";
import { getDeviceID } from "../modules/device.id";

const channel = "PRT";

const endpoints = {
  deals: Config.Api.TRADE_BOND + "accounts/{accountNumber}/deals",
  transactions: Config.Api.TRADE_BOND + "accounts/{accountNumber}",
  cancelDeal: Config.Api.TRADE_BOND + "accounts/{accountNumber}/deals/{dealID}",
  cancelTransaction:
    Config.Api.TRADE_BOND +
    "accounts/{accountNumber}/leg2_transactions/{transactionID}",

  bonds: Config.Api.BOND + "bonds",
  bondinfo: Config.Api.BOND + "accounts/",
  products: Config.Api.BOND + "products",
  rates: Config.Api.BOND + "table_rates",
  promotions: Config.Api.BOND + "promotions",
  pricing: Config.Api.BOND + "pricing/mix",
  refer: Config.Api.BOND + "deals/refer_code_validator/account_no",
  referName: Config.Api.REGISTRY + "clients/customers/customerId",
  dealPricing: Config.Api.BOND + "pricing/leg2",
  market_maker: Config.Api.BOND + "market_makers",
  customers: Config.Api.BOND + "customers/accounts",
  banks: Config.Api.BOND + "banks",
  customer: Config.Api.BOND + "customers",
  assets: Config.Api.BOND + "assets",
  tax: Config.Api.BOND + "personal_income_taxs/{accountNo}",
  users: Config.Api.BOND + "users/hrCode/{hrCode}",
  promotion:
    Config.Api.BOND +
    "deals/nav_promotion?productType={productType}&accountNo={accountNo}&bondCode={bondCode}&quantity={quantity}&side={side}&codePromotion={codePromotion}&valueDate={valueDate}&carebyCode={carebyCode}",

  leg2TradeDate: Config.Api.BOND + "deals/leg2_trade_date",
  getPriceBOD:
    Config.Api.TRADE_BOND +
    "accounts/{accountNumber}/leg2_at_bod?settlement={date}",

  getSale: Config.Api.IDVND + "authentication/sale?size=999",
  getInvestorInfo: Config.Api.IDVND + "authentication/owner-account?customerId=",
  getCoupon: Config.Api.KONG + "bond-fi-api/v1/valuable-papers",
  dayBackBond: Config.Api.BOND + "deals/leg2_terms?",
  dayBackBondv2: Config.Api.BOND + "deals/leg1_terms?",
  getMembership: Config.Api.IDVND + "authentication/datasheet-by-accountNo?accountNo=",
  time: Config.Api.FINFO + 'v4/time',
};

export const getAvailableWithdraw = accountNumber => {
  return axios({
    method: "get",
    url: `${Config.Api.TRADE_BO}accounts/v3/${accountNumber}/assets`,
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    }
  });
};

export const getPriceBOD = accountNumber => {
  return axios({
    method: "get",
    url: endpoints.getPriceBOD
      .replace("{accountNumber}", accountNumber)
      .replace("{date}", moment().format("YYYY-MM-DD")),
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    }
  });
};

export const getLeg2TradeDate = data => {
  return axios({
    method: "GET",
    url: endpoints.leg2TradeDate,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    },
    params: {
      bondCode: data.bond_code,
      productType: data.product_type,
      valueDate: data.value_date,
      termRateId: data.terms[0] && data.terms[0].termRateId
    }
  });
};

export const getCustId = cust_id => {
  return axios({
    method: "get",
    url: endpoints.customer + "/" + cust_id,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    }
  });
};

export const addDeals = data => {
  return axios({
    method: "post",
    url: `${Config.Api.TRADE_BO}congen/v2/bonds/deal`,
    // url: endpoints.deals.replace('{accountNumber}', data.customer_account_no),
    data: {
      ...data,
      via: channel
    },
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    }
  });
};

export const addDealsV2 = data => {
  return axios({
    method: "post",
    url: `${Config.Api.DSB}dpm-api/api/flow/bond/prt/request`,
    data: {
      ...data,
      channel: channel
    },
    headers: {
      "token-id": getRawToken()
    }
  });
};

export const getBanks = () => {
  return axios({
    method: "get",
    url: endpoints.banks,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    },
    params: {
      page: 0,
      size: 1000
    }
  });
};

export const getCustomer = account_no => {
  return axios({
    method: "get",
    url: endpoints.customers + "/" + account_no,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    }
  });
};

export const getMarketMaker = () => {
  return axios({
    method: "get",
    url: endpoints.market_maker,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    },
    params: {
      page: 0,
      size: 9999
    }
  });
};

export const getBondAll = () => {
  return axios({
    method: "get",
    url: endpoints.bonds,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    },
    params: {
      page: 0,
      size: 9999
    }
  });
};

export const getBondProducts = () => {
  return axios({
    method: "get",
    url: endpoints.products,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    },
    params: {
      page: 0,
      size: 9999
    }
  });
};

export const getBondRates = () => {
  return axios({
    method: "get",
    url: endpoints.rates,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    },
    params: {
      page: 0,
      size: 9999
    }
  });
};

export const getPromotions = () => {
  return axios({
    method: "get",
    url: endpoints.promotions,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    },
  });
};

export const getBondPricing = (bond, side, settlement, promotion) => {
  return axios({
    method: "get",
    url: `${endpoints.pricing}/${bond.bond_code}`,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    },
    params: {
      productType: bond.product_type,
      yield: bond.yield ? (bond.yield / 100).toFixed(11) : null,
      side,
      settlement: settlement || moment().format("YYYY-MM-DD"),
      promotion
    }
  });
};

export const getValidRefer = accountNo => {
  return axios({
    method: "get",
    url: `${endpoints.refer}/${accountNo}`,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    }
  });
};

export const getReferFullName = custID => {
  return axios({
    method: "get",
    url: `${endpoints.referName}/${custID}`
  });
};

export const getDealPricing = (dealID, leg2ValueDate) => {
  return axios({
    method: "get",
    url: `${endpoints.dealPricing}`,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    },
    params: {
      dealID,
      leg2ValueDate: leg2ValueDate || moment().format("YYYY-MM-DD")
    }
  });
};

export const createDeal = deal => {
  return axios({
    method: "post",
    url: endpoints.deals.replace("{accountNumber}", deal.customer_account_no),
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    },
    data: {
      ...deal,
      via: channel
    }
  });
};

export const getBondInfo = (product_type, bond_code) => {
  return axios({
    method: "get",
    url: `${endpoints.products}/${product_type}/${bond_code}`,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    }
  });
};

export const getTableRate = table_rate_id => {
  return axios({
    method: "get",
    url: `${endpoints.rates}/${table_rate_id}`,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    }
  });
};

export const getDeals = request => {
  return axios({
    method: "get",
    url: endpoints.deals.replace("{accountNumber}", request.accountNumber),
    params: {
      page: 0,
      size: 1000,
      startTradeDate: request.fromDate,
      endTradeDate: request.toDate,
      sortBy: "createdDate:DESC"
    },
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    }
  });
};

export const getTransactions = request => {
  return axios({
    method: "get",
    url:
      endpoints.transactions.replace("{accountNumber}", request.accountNumber) +
      "/leg2_transactions",
    params: {
      page: 0,
      size: 1000,
      startTradeDate: request.fromDate,
      endTradeDate: request.toDate,
      sortBy: "createdDate:DESC"
    },
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    }
  });
};

export const getAssets = (request, size = 100) => {
  let params = {
    page: 0,
    size,
    accountNo: request.accountNumber
  };
  if (request.productType) {
    params.productType = request.productType;
  }
  return axios({
    method: "get",
    url: endpoints.assets,
    params,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    }
  });
};

export const updateTransaction = transaction => {
  return axios({
    method: "put",
    url: `${endpoints.transactions.replace(
      "{accountNumber}",
      transaction.customer_account_no
    )}/${transaction.transaction_id}`,
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    },
    data: {
      ...transaction,
      via: channel
    }
  });
};

export const createTransaction = transaction => {
  return axios({
    method: "post",
    url: `${Config.Api.TRADE_BO}congen/v2/bonds/transaction`,
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    },
    data: {
      ...transaction,
      via: channel
    }
  });
};

export const getTax = accountNo => {
  return axios({
    method: "get",
    url: endpoints.tax.replace("{accountNo}", accountNo),
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    }
  });
};

export const getContracts = docId => {
  return axios({
    method: "get",
    url: `${Config.Api.TRADE_BO}congen/bonds/${docId}/contracts?via=PRT`,
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    }
  });
};

export const cancelDeal = deal => {
  return axios({
    method: "DELETE",
    url: `${Config.Api.TRADE_BO}bpm/aniapi/tradeBond/deal/${deal.deal_id}`,
    // url: endpoints.cancelDeal
    // 	.replace('{accountNumber}', deal.customer_account_no)
    // 	.replace(
    // 		'{dealID}',
    // 		deal.deal_id
    // 	),
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    }
  });
};


export const cancelDealDsb = (deal) => {
  // bondId = deal_id
  return axios({
    method: "POST",
    url: `${Config.Api.DSB}dpm-api/api/flow/bond/prt/${deal.customer_account_no}/${deal.deal_id}/cancel`,
    headers: {
      "token-id": getRawToken()
    }
  });
};

export const cancelTransactionDealDsb = (transaction) => {
  // bondId = deal_id
  const { deal, transaction_id } = transaction;
  const account_no = deal&&deal.customer_account_no?deal.customer_account_no:''
  return axios({
    method: "POST",
    url: `${Config.Api.DSB}dpm-api/api/flow/bond/prt/${account_no}/${transaction_id}/cancel`,
    headers: {
      "token-id": getRawToken()
    }
  });
};


export const cancelBuyProBond = deal => {
  return axios({
    method: "DELETE",
    url: `${Config.Api.TRADE_BO}bpm/aniapi/probond/${deal.customer_account_no}/deal/${deal.deal_id}/cancel`,
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    }
  });
};

export const cancelSellProBond = trans => {
  return axios({
    method: "DELETE",
    url: `${Config.Api.TRADE_BO}bpm/aniapi/probond/${trans.deal.customer_account_no}/trans/${trans.transaction_id}/cancel`,
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    }
  });
};

export const cancelTransaction = transaction => {
  return axios({
    method: "DELETE",
    url: `${Config.Api.TRADE_BO}bpm/aniapi/tradeBond/transaction/${transaction.transaction_id}`,
    // url: endpoints.cancelTransaction
    // 	.replace(
    // 		'{accountNumber}',
    // 		transaction.deal.customer_account_no
    // 	)
    // 	.replace(
    // 		'{transactionID}',
    // 		transaction.transaction_id
    // 	),
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    }
  });
};

export const getUserByHrCode = hrCode => {
  return axios({
    method: "get",
    url: endpoints.users.replace("{hrCode}", hrCode),
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    }
  });
};

export const getPromotion = (
  productType,
  accountNo,
  bondCode,
  quantity,
  side,
  codePromotion,
  valueDate,
  carebyCode,
  miYield
) => {
  let myield = miYield ? '&yield=' + miYield : ''
  let myurl = endpoints.promotion
    .replace("{productType}", productType)
    .replace("{accountNo}", accountNo)
    .replace("{bondCode}", bondCode)
    .replace("{quantity}", quantity)
    .replace("{side}", side)
    .replace("{codePromotion}", codePromotion)
    .replace("{valueDate}", valueDate)
    .replace("{carebyCode}", carebyCode)
  return axios({
    method: "get",
    url: myurl + myield,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken()
    }
  });
};

export const downloadContract = (id, contractType) => {
  return axios({
    method: "get",
    url: `${Config.Api.TRADE_REPORT}congen/bonds/${id}/download?contractType=${contractType}&via=${channel}`,
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    }
  });
};

export const confirmContract = (id, confirm) => {
  return axios({
    method: "patch",
    url: `${Config.Api.TRADE_BO}congen/bonds/${id}`,
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    },
    data: {
      confirm
    }
  });
};

export const confirmDeal = (otp, data) => {
  return axios({
    method: "post",
    url: `${Config.Api.TRADE_BO}bpm/aniapi/tradeBond/deals?otp=${otp}`,
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    },
    data
  });
};

export const confirmTransaction = (otp, data) => {
  return axios({
    method: "post",
    url: `${Config.Api.TRADE_BO}bpm/aniapi/tradeBond/transactions?otp=${otp}`,
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    },
    data
  });
};

export const confirmBondContract = (otp, data) => {
  return axios({
    method: "post",
    url: `${Config.Api.DSB}dpm-api/api/flow/bond/prt/${data.accountNo}/contract/${data.procInstId}/confirm`,
    headers: {
      "token-id": getRawToken()
    },
    data: {
      otp
    }
  });
};

export const rejectBondContract = (accountNo, procInstId) => {
  return axios({
    method: "post",
    url: `${Config.Api.DSB}dpm-api/api/flow/bond/prt/${accountNo}/contract/${procInstId}/reject`,
    headers: {
      "token-id": getRawToken()
    }
  });
};

export const confirmProBond = (otp, data) => {
  return axios({
    method: "post",
    // url: `${Config.Api.TRADE_BO}bpm/aniapi/probond/prt?otp=${otp}`,
    url: `${Config.Api.TRADE_BO}bpm/aniapi/probond/${data.customerAccountNo}/prt?otp=${otp}`,
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    },
    data
  });
};

export const confirmOrdernoDocId = (accountNo, procInstId, typeStatus = "CONFIRMED") => {
  return axios({
    method: 'post',
    url: `${Config.Api.DSB}dpm-api/api/flow/bond/prt/${accountNo}/confirm`,
    headers: {
      "token-id": getRawToken()
    },
    data: {
      procInstId,
      status: typeStatus
    }
  })
}

export const confirmDealFromEmail = (otp, requestID, accountNo, status) => {
  return axios({
    method: "post",
    // url: `${Config.Api.TRADE_BO}bpm/aniapi/probond/prt?otp=${otp}`,
    url: `${Config.Api.TRADE_BO}bpm/aniapi/probond/${accountNo}/deal/mail/${requestID}?otp=${otp}`,
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    },
    data: {
      status
    }
  });
};

export const confirmTransFromEmail = (otp, requestID, accountNo, status) => {
  return axios({
    method: "post",
    // url: `${Config.Api.TRADE_BO}bpm/aniapi/probond/prt?otp=${otp}`,
    url: `${Config.Api.TRADE_BO}bpm/aniapi/probond/${accountNo}/trans/mail/${requestID}?otp=${otp}`,
    headers: {
      "X-AUTH-TOKEN": getRawToken()
    },
    data: {
      status
    }
  });
};

export const getSale = () => {
  return axios({
    method: "get",
    url: endpoints.getSale,
    headers: {
      "token-id": getRawToken()
    }
  });
};

export const getSettleDate = (date, bondCode) => {
  return axios({
    method: "get",
    url: `${Config.Api.BOND}deals/settled_date?valueDate=${date}&bondCode=${bondCode}`,
    headers: {
      Authorization: "Bearer " + getRawToken(),
      "x-auth-username": getUsername()
    }
  });
};

export const getLeg2SettleDate = (leg2_tradeDate, bondCode) => {
  return axios({
    method: "get",
    url: `${Config.Api.BOND}deals/settled_date?valueDate=${leg2_tradeDate}&bondCode=${bondCode}`,
    headers: {
      Authorization: "Bearer " + getRawToken(),
      "x-auth-username": getUsername()
    }
  });
};

export const getProInvestor = custID => {
  const cID = custID || getCustomerId();
  return axios({
    method: "get",
    url: endpoints.getInvestorInfo + cID,
    headers: {
      "token-id": getRawToken(),
    },
  });
};

export const getInfoProBond = (value, date, acc) => {
  return axios({
    method: "get",
    url: `${endpoints.products}/probond?value=${value}&value_date=${date}&customer_account_no=${acc}`,
    headers: {
      Authorization: "Bearer " + getRawToken(),
      "x-auth-username": getUsername()
    }
  });
};

export const getCoupon = (bondCode) => {
  return axios({
    method: "get",
    url: `${endpoints.getCoupon}/${bondCode}`,
    headers: {
      // Authorization: "Bearer " + getRawToken(),
      "x-auth-username": getUsername()
    }
  })
}

export const getDayBackBond = (bondCode, productType, let2SettleDate, rate2Volume) => {
  const today = moment().format('YYYY-MM-DD');
  const volume = rate2Volume ? rate2Volume : 0;
  return axios({
    method: "get",
    url: `${endpoints.dayBackBondv2}bondCode=${bondCode}&productType=${productType}&valueDate=${today}&leg2SettledDate=${let2SettleDate}&rate2Volume=${volume}`,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: 'Bearer ' + getRawToken()
    }
  })
}

export const getMembership = (accountNo) => {
  return axios({
    method: "get",
    url: `${endpoints.getMembership}${accountNo}`,
    headers: {
      "token-id": getRawToken()
    }
  })
}

export const getDomainUser = () => {
  return axios({
    method: "get",
    url: `${Config.Api.IDVND}authentication/membership-by-username`,
    headers: {
      "token-id": getRawToken()
    }
  })
}

export const getPendingReq = (accountNo) => {
  return axios({
    method: "get",
    url: `${Config.Api.DSB}dpm-api/api/flow/bond/prt/${accountNo}/pending-requests`,
    headers: {
      "token-id": getRawToken()
    }
  })
}

export const getDetailOrder = (accountNo, procInstId) => {
  return axios({
    method: "get",
    url: `${Config.Api.DSB}dpm-api/api/flow/bond/prt/${accountNo}/pending-requests?procInstId=${procInstId}`,
    headers: {
      "token-id": getRawToken()
    }
  })
}

export const getExplainBond = () => {
  return axios({
    method: "get",
    url: `${Config.Api.FINFO_V4}bonds?size=100`,
    headers: {
      "token-id": getRawToken()
    }
  })
}

export const getItemExplainBond = bondcode => {
  return axios({
    method: "get",
    url: `${Config.Api.FINFO_V4}bonds?q=code:${bondcode}`,
    headers: {
      "token-id": getRawToken()
    }
  })
}

export const logUserbond = () => {
  const deviceId = getDeviceID();
  return axios({
    method: 'get',
    url: `${Config.Api.IDVND}activity?text=${deviceId}`,
    headers: {
      "token-id": getRawToken()
    }
  })
}

export const getResultDeal = (accountNo, procInstId) => {
  return axios({
    method: 'get',
    url: `${Config.Api.DSB}dpm-api/api/flow/bond/prt/${accountNo}/process/${procInstId}/deal`,
    headers: {
      "token-id": getRawToken()
    }
  })
}

export const getBase64Contract = (payload) => {
  return axios({
    method: 'post',
    url: `${Config.Api.DSB}dpm-api/api/flow/bond/prt/gen-contract`,
    data: payload,
    headers: {
      "token-id": getRawToken()
    }
  })
}

export const _time = () => {
  return axios({
    method: 'get',
    url: `${Config.Api.FINFO}v4/time`
  })
}

export const getNavParvalue = (payload) => {
  const {accountNo,bondCode,quantity } = payload;
  return axios({
    method: 'get',
    url: `${Config.Api.BOND}deals/navParvalue?accountNo=${accountNo}&bondCode=${bondCode}&quantity=${quantity}`,
    data: payload,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: 'Bearer ' + getRawToken()
    }
  })
}

export const getPorfolioDbond = (accountNo, p) => {
  const page = p ? p : 1;
  return axios({
    method: 'get',
    url: `${Config.Api.DATA_REPORT}report/portfolio/dbond-account/page?account-no=${accountNo}&page-size=100&page-index=${page}&sort=asc`,
    headers: {
      "token-id": getRawToken()
    }
  })
}

export const getPorfolioDbondbyCustid = () => {
  return axios({
    method: 'get',
    url: `${Config.Api.DATA_REPORT}report/portfolio/dbond-customer/page?cust-id=${getCustomerId()}&page-size=10&page-index=1&sort=asc`,
    headers: {
      "token-id": getRawToken()
    }
  })
}


export const getPorfolioVbond = (accountNo, p) => {
  const page = p ? p : 1;
  return axios({
    method: 'get',
    url: `${Config.Api.DATA_REPORT}report/portfolio/vbond-account/page?account-no=${accountNo}&page-size=100&page-index=${page}&sort=asc`,
    headers: {
      "token-id": getRawToken()
    }
  })
}

export const getPorfolioOtherbond = (accountNo, p) => {
  const page = p ? p : 1;
  return axios({
    method: 'get',
    url: `${Config.Api.DATA_REPORT}report/portfolio/other-bond-account/page?account-no=${accountNo}&page-size=100&page-index=${page}&sort=asc`,
    headers: {
      "token-id": getRawToken()
    }
  })
}

export const getStatusAccountforProInvestor = () => {
  return axios({
    method: 'get',
    url: `${Config.Api.DSB}registry-api/sales-services?category=account`,
    headers: {
      "token-id": getRawToken()
    }
  })
}

export const registerOpenAccountSinglebond = (payload) => {
  return axios({
    method: 'post',
    url: `${Config.Api.DSB}vnd-product-register-api/channels/customer-client/product-registration:openAccount`,
    headers: {
      "token-id": getRawToken()
    },
    data: payload
  })
}

export const getAccountInfo = () => {
  return axios({
    method: 'get',
    url: `${Config.Api.REGISTRY}customers/basic-info`,
    headers: {
      'token-id': getRawToken(),
    },
  });
};

export const getIdentityStatus = () => {
  return axios({
    method: 'GET',
    url: `${Config.Api.DATA_REPORT}report/identity-status`,
    headers: {
      'token-id': getRawToken(),
    },
  });
};

export const checkRequestOpenAccSinglebond = () => {
  return axios({
    method: 'GET',
    url: `${Config.Api.DSB}package-product-register-api/package-products/requests?productCode=03003001`,
    headers: {
      'token-id': getRawToken(),
    },
  })
}
export const cancelRequestOpenAccSingleBond = id => {
  return axios({
    method: 'PUT',
    url: `${Config.Api.DSB}package-product-register-api/customers/packages/${id}:cancel`,
    headers: {
      'token-id': getRawToken(),
    },
    data: {
      description: 'Tôi muốn huỷ yêu cầu'
    }
  })
}

export const getTemporaryFee = bondCode => {
  return axios({
    method: 'get',
    url: `${Config.Api.BOND}temporary-fee-rate?bondCode=${bondCode}`,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: 'Bearer ' + getRawToken()
    }
  })
}

export const getProductPolicy = () => {
  return axios({
    method: 'get',
    url: `${Config.Api.IDVND}activity?text=${getUsername()}&type=AGREEMENT_BOND_TERMS&code=ACTIVITY`,
    headers: {
      "token-id": getRawToken()
    }
  })
}

export const getCustIdAgreementTerms = () => {
  return axios({
    method: 'get',
    url: `${Config.Api.DATA_REPORT}report/custid-bond-agreement-terms?cust-id=${getCustomerId()}`,
    headers: {
      "token-id": getRawToken()
    }
  })
}

export const getScheduleRestricted = () => {
  return axios({
    method: 'get',
    url: `${Config.Api.BOND}schedule_restricted?pageIndex=1&pageSize=200`,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: 'Bearer ' + getRawToken()
    }
  })
}

export const getInfoSingleAccount = (custodyId) => {
  const date = new Date();
  return axios({
    method: "get",
    url: `${Config.Api.DGATE_PAYMENT}paygate/bonds/customer?custodyId=${custodyId}`,
    headers: {
      Authorization: getRawToken(),
      channel: "MOBILE",
      "X-Request-ID": date.getTime(),
    },
  });
};

export const getSystemProperties = () => {
  return axios({
    method: "get",
    url: `${Config.Api.BOND}system_properties?page=0&size=20`,
    headers: {
      "x-auth-username": getUsername(),
      Authorization: "Bearer " + getRawToken(),
    },
  });
};