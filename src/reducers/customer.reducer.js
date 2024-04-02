import * as types from '../constants/action.types';

const initialState = {
  customer: null,
  accounts: null,
  accountInfo: null,
  customerServices: null,
  ownerAccount: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case types.LOAD_CUSTOMER_INFO_SUCCESS:
      return { ...state, customer: action.customer };

    case types.LOAD_ALL_ACCOUNTS_SUCCESS:
      return { ...state, accounts: action.accounts };

    case types.LOAD_ACCOUNT_INFO:
      return { ...state, accountInfo: null };
    case types.LOAD_ACCOUNT_INFO_SUCCESS:
      return { ...state, accountInfo: action.accountInfo };
    case types.LOAD_OWNER_ACCOUNT_SUCCESS:
      return { ...state, ownerAccount: action.ownerAccount };
    default:
      return state;
  }
}
