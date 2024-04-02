import * as types from '../constants/action.types';

export const getBondAll = payload => ({
	type: types.GET_BOND_ALL,
	payload
});

export const getBondProducts = payload => ({
	type: types.GET_BOND_PRODUCTS,
	payload
});

export const getBondRates = payload => ({
	type: types.GET_BOND_RATES,
	payload
});

export const createDeal = payload => ({
	type: types.CREATE_DEAL,
	payload
});

export const loadOrderBook = payload => ({
	type: types.LOAD_ORDERBOOK,
	payload
});
export const loadTransactionList = payload => ({
	type: types.LOAD_TRANSACTION_LIST,
	payload
});

export const loadPortfolio = payload => ({
	type: types.LOAD_PORTFOLIO,
	payload
});

export const updateTransaction = payload => ({
	type: types.UPDATE_TRANSACTION,
	payload
});

export const loadScheduleRestricted = () => ({
	type: types.LOAD_SCHEDULE_RESTRICHTED
})