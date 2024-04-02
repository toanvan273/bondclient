import { combineReducers } from 'redux';
import bondStore from './bond.reducer';
import customerStore from './customer.reducer';
import popupStore from './popup.reducer';
const rootReducer = combineReducers({
	bondStore,
	customerStore,
	popupStore
});

export default rootReducer;
