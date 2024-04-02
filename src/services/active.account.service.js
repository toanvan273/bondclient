import { getUsername } from './auth.service';

const ACTIVE_ACCOUNT_KEY = 'activeAccount/{username}';

const getStorageKey = () => {
	let username = getUsername();
	return ACTIVE_ACCOUNT_KEY.replace('{username}', username ? username : 'guest');
};

export const getLastActiveAccount = () => {
	return JSON.parse(localStorage.getItem(getStorageKey())) || null;
};

export const storeActiveAccount = account => {
	if (account) {
		localStorage.setItem(getStorageKey(), JSON.stringify(account));
	}
};