import * as types from '../constants/action.types';

export const loadCustomerInfo = payload => ({
	type: types.LOAD_CUSTOMER_INFO,
	payload
});

export const loadCustomerServices = payload => ({
	type: types.LOAD_CUSTOMER_SERVICES,
	payload
});

export const loadAllAccounts = payload => ({
	type: types.LOAD_ALL_ACCOUNTS,
	payload
});

export const loadAccountInfo = payload => ({
	type: types.LOAD_ACCOUNT_INFO,
	payload
});

export const openPopup = payload => ({
	type: types.OPEN_POPUP,
	payload
});

export const loadOwnerAccount = (payload) => ({
  type: types.LOAD_OWNER_ACCOUNT,
  payload,
});