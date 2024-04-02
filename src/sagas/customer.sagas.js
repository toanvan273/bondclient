import { put, call } from 'redux-saga/effects';
import {
	_allAccounts,
} from '../clients/trade.api.client';

import { emitter } from '../clients/emitter';

import * as types from '../constants/action.types';
import * as Tracker from '../modules/tracker';

export function* loadAllAccounts({ payload }) {
	try {
		let response;
		Tracker.startTiming(
			'Hệ thống',
			'Tải đầy dủ thông tin tài khoản người dùng'
		);
		response = yield call(_allAccounts);
		emitter.emit('GET_ACCOUNTS_SUCCESS');
		yield [
			put({
				type: types.LOAD_ALL_ACCOUNTS_SUCCESS,
				accounts: response.data.accounts.map(acc => {
					return {
						...acc
					};
				})
			})
		];
	} catch (error) {
		Tracker.clearTiming(
			'Hệ thống',
			'Tải đầy dủ thông tin tài khoản người dùng'
		);
	}
}
