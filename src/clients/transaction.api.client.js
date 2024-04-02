import { getRawToken } from '../services/auth.service';
import * as Config from '../constants/config';
import axios from 'axios';

const endpoints = {
	bankReceiveAccounts: Config.Api.TRANSACTION + 'accounts/{accountNumber}/bankReceiveAccounts',
}


export const _getBankReceiveAccounts = accountNo => {
    return axios({
		method: 'get',
		url: endpoints.bankReceiveAccounts.replace(
			'{accountNumber}',
			accountNo
		),
		headers: { Authorization: 'Bearer ' + getRawToken() }
	});
};