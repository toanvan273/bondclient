import axios from 'axios';
import * as Config from '../constants/config';

const endpoints = {
	getLanguageData: Config.Api.I18N + '/language'
};

export const getLanguageDataByLang = lang => {
	return axios({
		method: 'get',
		url: endpoints.getLanguageData,
		params: {
			filter: {
				where: { space: 'BondClient' },
				fields: {
					key: true,
					resource: true,
					[lang]: true,
					// en: true
				}
			}
		}
	});
};