import moment from 'moment';

export function setSesstionStorage(key, value) {
	try {
		sessionStorage.setItem(key, JSON.stringify(value));
	} catch (err) {
		console.log('save session storate fail');
	}
}

export function getSessionStorage(key) {
	return JSON.parse(sessionStorage.getItem(key, ''));
}

export function destroySessionStorage(key) {
	sessionStorage.removeItem(key);
}

//precisionNumber
export const numberPrecision = (num) => {
	let string = num + ''
	if (string.indexOf('.') > 0) {
		let n = string.split('.')[1].length
		return (num * (10 ** n)) / (100 * (10 ** n))
	} else {
		return num / 100
	}
}

// Cộng 2 số thập phân
export const addDecimals = (a, b) => {
	const ia = a + ''
	const ib = b + ''
	let m, n, k
	if (ia.indexOf('.') > 0) { m = ia.split('.')[1].length }
	if (ib.indexOf('.') > 0) { n = ib.split('.')[1].length }
	if (m && n) {
		k = Math.max(m, n)
	} else k = m || n
	if (!k) {
		return a + b
	} else {
		return (a * (10 ** k) + b * (10 ** k)) / (10 ** k)
	}
}