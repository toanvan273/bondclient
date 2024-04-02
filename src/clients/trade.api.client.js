import axios from 'axios';
import { getRawToken } from '../services/auth.service';
import * as Config from '../constants/config';

const endpoints = {
	accounts_v3: Config.Api.TRADE + 'v3/accounts',
};


export const _allAccounts = () => {
	let fields = [
		'accountNumber',
		'asciiName',
		'fullName',
		'tradeCode',
		'isDerivative',
		'type',
		'custodyID',
		'customerType',
		'subName'
	];
	return axios({
		method: 'get',
		params: {
			t: new Date().getTime()
		},
		url: `${endpoints.accounts_v3}/?fields=${fields.join(',')}`,
		headers: { 'X-AUTH-TOKEN': getRawToken() }
	});
};