
import { throttle } from 'redux-saga';
import { spawn } from 'redux-saga/effects';
import {
  loadBondAll,
  loadBondProducts,
  loadBondRates,
  createDeal,
  fetchScheduleRestricted,
  fetchOwnerAccount,
  fetchAccountInfo,
} from "./bond.sagas";
import {
	loadAllAccounts,
} from './customer.sagas';
import {
	getDealsData,
	getTransactionList,
	getAssetsData
} from './bond.sagas';

import * as types from '../constants/action.types';

// Using this 'spawnTask' instead of built-in 'takeEvery' from 'redux-saga' to prevent the case when the whole application is broken if only one saga is corrupted
function* spawnTask(pattern, func) {
	function wrapper(pattern, func) {
		return function* task() {
			// Use 'throttle' instead of 'takeEvery' to reduce the number of APIs requests
			yield throttle(100, pattern, func);
		};
	}
	yield spawn(wrapper(pattern, func));
}

export default function* watcher() {
	
	yield [
		spawnTask(types.GET_BOND_ALL, loadBondAll),
		spawnTask(types.GET_BOND_PRODUCTS, loadBondProducts),
		spawnTask(types.GET_BOND_RATES, loadBondRates),
		spawnTask(types.LOAD_ALL_ACCOUNTS, loadAllAccounts),
		spawnTask(types.CREATE_DEAL, createDeal),

		spawnTask(types.LOAD_ORDERBOOK, getDealsData),
		spawnTask(types.LOAD_PORTFOLIO, getAssetsData),
		spawnTask(types.LOAD_TRANSACTION_LIST, getTransactionList),

		spawnTask(types.LOAD_SCHEDULE_RESTRICHTED, fetchScheduleRestricted),
		spawnTask(types.LOAD_OWNER_ACCOUNT, fetchOwnerAccount),
		spawnTask(types.LOAD_ACCOUNT_INFO, fetchAccountInfo),
	];
}
