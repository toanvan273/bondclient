import * as types from '../constants/action.types';

const initialState = {
	bonds: null,
	products: null,
	mapProducts: null,
	rates: null,
	scheduleRestrictedList: null
};

export default function (state = initialState, action) {
	switch (action.type) {
		case types.GET_BOND_ALL_SUCCESS:
			return { ...state, bonds: action.bonds };
		case types.GET_BOND_PRODUCTS_SUCCESS:
			return { ...state, products: action.products, mapProducts: action.mapProducts, fullProducts: action.fullProducts };
		case types.GET_BOND_RATES_SUCCESS:
			return { ...state, rates: action.rates };
		case types.LOAD_ORDERBOOK_SUCCESS:
			return { ...state, deals: action.deals };
		case types.LOAD_ORDERBOOK:
			return { ...state, deals: null };
		case types.LOAD_PORTFOLIO_SUCCESS:
			return { ...state, portfolio: action.portfolio };
		case types.LOAD_PORTFOLIO:
			return { ...state, portfolio: null };
		case types.LOAD_TRANSACTION_LIST_SUCCESS:
			return { ...state, transactionList: action.transactionList };
		case types.LOAD_TRANSACTION_LIST:
			return { ...state, transactionList: null };
		case types.LOAD_SCHEDULE_RESTRICHTED_SUCCESS:
			return {
				...state,
				scheduleRestrictedList: action.scheduleRestrictedList,
			}
		default:
			return state;
	}
}
