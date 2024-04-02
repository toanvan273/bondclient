import axios from 'axios';
import * as Config from '../constants/config';
import { getRawToken } from '../services/auth.service';

const endpoints = {
	getOtp: Config.Api.AUTH + '/otp',
	reportSendOtpSms: Config.Api.AUTH + '/otp/fail?type=sms',
};

export const getOtp = (channel = 'sms', language) => {
	return axios({
		method: 'get',
		params: {
			t: new Date().getTime()
		},
		url: `${endpoints.getOtp}?lang=${language}&type=${channel}`,
		headers: {
			'X-AUTH-TOKEN': getRawToken()
		}
	});
};

export const reportSendOtpSmsError = () => {
	return axios({
		method: 'post',
		params: {
			t: new Date().getTime()
		},
		url: endpoints.reportSendOtpSms,
		headers: {
			'X-AUTH-TOKEN': getRawToken()
		}
	});
};