import { put, call } from 'redux-saga/effects';
import * as types from '../constants/action.types';
import { fromArrayToMap, displayNoti } from '../helpers';
import {
  getBondAll,
  getBondProducts,
  getBondRates,
  getDeals,
  getTransactions,
  getAssets,
  createDeal as createBondDeal,
  getScheduleRestricted,
  getProInvestor,
  getAccountInfo,
} from "../clients/bond.api.client";
import { parseErrorMessage } from "../modules/error_parser/error.parser.v2";

export function* loadBondAll({ payload }) {
  try {
    const response = yield call(getBondAll, payload);
    const bonds = fromArrayToMap(response.data.content, "bond_code");
    yield [
      put({
        type: types.GET_BOND_ALL_SUCCESS,
        bonds,
      }),
    ];
  } catch (error) {
    if (error && error.response && error.response.data)
      displayNoti(parseErrorMessage(error.response.data), "error");
  }
}

export function* loadBondProducts({ payload }) {
  try {
    const response = yield call(getBondProducts, payload);
    const mapProducts = fromArrayToMap(response.data.content, "product_id");
    // filter by display_protrade
    let products = response.data.content.filter(
      (product) => product.display_protrade
    );
    products.sort((a, b) => {
      return a.product_id > b.product_id ? 1 : -1;
    });
    yield [
      put({
        type: types.GET_BOND_PRODUCTS_SUCCESS,
        products,
        mapProducts,
        fullProducts: response.data.content,
      }),
    ];
  } catch (error) {
    if (error && error.response && error.response.data)
      displayNoti(parseErrorMessage(error.response.data), "error");
  }
}

export function* loadBondRates({ payload }) {
  try {
    const response = yield call(getBondRates, payload);
    yield [
      put({
        type: types.GET_BOND_RATES_SUCCESS,
        rates: response.data.content,
      }),
    ];
  } catch (error) {
    if (error && error.response && error.response.data)
      displayNoti(parseErrorMessage(error.response.data), "error");
  }
}

export function* createDeal({ payload }) {
  try {
    const response = yield call(createBondDeal, payload);
    yield [
      put({
        type: types.CREATE_DEAL_SUCCESS,
        rates: response.data.content,
      }),
    ];
  } catch (error) {
    if (error && error.response && error.response.data)
      displayNoti(parseErrorMessage(error.response.data), "error");
  }
}

export function* getDealsData({ payload }) {
  try {
    const response = yield call(getDeals, payload);
    if (response.status === 200) {
      yield [
        put({
          type: types.LOAD_ORDERBOOK_SUCCESS,
          deals: response.data.content,
        }),
      ];
    }
  } catch (error) {
    if (error && error.response && error.response.data)
      displayNoti(parseErrorMessage(error.response.data), "error");
  }
}
export function* getTransactionList({ payload }) {
  try {
    const response = yield call(getTransactions, payload);
    if (response.status === 200) {
      yield [
        put({
          type: types.LOAD_TRANSACTION_LIST_SUCCESS,
          transactionList: response.data.content,
        }),
      ];
    }
  } catch (error) {
    if (error && error.response && error.response.data)
      displayNoti(parseErrorMessage(error.response.data), "error");
  }
}

export function* getAssetsData({ payload }) {
  try {
    const response = yield call(getAssets, payload);
    if (response.status === 200) {
      yield [
        put({
          type: types.LOAD_PORTFOLIO_SUCCESS,
          portfolio: response.data.content,
        }),
      ];
    }
  } catch (error) {
    if (error && error.response && error.response.data)
      displayNoti(parseErrorMessage(error.response.data), "error");
  }
}

export function* fetchScheduleRestricted() {
  try {
    const response = yield call(getScheduleRestricted);
    if (response.status === 200) {
      yield [
        put({
          type: types.LOAD_SCHEDULE_RESTRICHTED_SUCCESS,
          scheduleRestrictedList: response.data.pageable.data,
        }),
      ];
    }
  } catch (error) {
    if (error && error.response && error.response.data)
      displayNoti(parseErrorMessage(error.response.data), "error");
  }
}

export function* fetchOwnerAccount() {
  try {
    const response = yield call(getProInvestor);
    if (response.status === 200) {
      yield [
        put({
          type: types.LOAD_OWNER_ACCOUNT_SUCCESS,
          ownerAccount: response.data,
        }),
      ];
    }
  } catch (error) {
    if (error && error.response && error.response.data)
      displayNoti(parseErrorMessage(error.response.data), "error");
  }
}

export function* fetchAccountInfo() {
  try {
    const response = yield call(getAccountInfo);
    if (response.status === 200) {
      yield [
        put({
          type: types.LOAD_ACCOUNT_INFO_SUCCESS,
          accountInfo: response.data,
        }),
      ];
    }
  } catch (error) {
    if (error && error.response && error.response.data)
      displayNoti(parseErrorMessage(error.response.data), "error");
  }
}