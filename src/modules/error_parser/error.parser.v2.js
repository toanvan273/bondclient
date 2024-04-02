import { emitter } from '../../clients/emitter';
import { Event } from '../../constants/config';

import AuthApiErrors from './auth.api.errors';
import BondApiErrors from './bond.api.errors';

let lang = 'vi';

emitter.on(Event.CHANGE_LANGUAGE, language => {
	lang = language;
});

let ERROR_CODES = {
	vi: {
		...AuthApiErrors.vi,
		...BondApiErrors.vi,
	},

	en: {
		...AuthApiErrors.en,
		...BondApiErrors.en,
	}
};

const errorCode = errorData => {
	return ' (' + (errorData.error || errorData.code) + ')';
};

const errorId = errorData => {
	if (errorData.id) {
		return ' (' + errorData.id + ')';
	} else {
		return '';
	}
};

const getAPIErrorMap = lang => {
	return ERROR_CODES[lang] ? ERROR_CODES[lang] : ERROR_CODES['en'];
};

export const parseErrorMessage = (errorData, showErrorId = true) => {
	let error = getAPIErrorMap(lang)[errorData.error || errorData.code];
	if (!error) {
		error = getAPIErrorMap(lang)['DEFAULT'];
	}

	if (showErrorId) {
		return error + errorCode(errorData) + errorId(errorData);
	}

	return error + errorCode(errorData);
};
export const IGNORE_ERROR_CODES_PATTERN = /\(CLIENT-01\)|\(undefined\)|\(DEFAULT\)|\(UNKNOWN\)|\(Not Found\)|\(Internal Server Error\)|\(Method Not Allowed\)|\(Bad Request\)/g;

// eslint-disable-next-line
export const BO_ERROR_CODE_PATTERN = /\(\-\d{6}\)/g;
