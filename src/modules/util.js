export default class Util {
	static formatTime(date) {
		var hours = date.getHours();
		if (hours < 10) {
			hours = '0' + hours;
		}

		var minutes = date.getMinutes();
		if (minutes < 10) {
			minutes = '0' + minutes;
		}
		return hours + ':' + minutes;
	}

	static formatDate(dateObject) {
		var d = new Date(dateObject);
		var day = d.getDate();
		var month = d.getMonth() + 1;
		var year = d.getFullYear();
		if (day < 10) {
			day = '0' + day;
		}
		if (month < 10) {
			month = '0' + month;
		}
		var date = day + '/' + month + '/' + year;

		return date;
	}

	static setCookie(options) {
		var cookie_string = options.name + '=' + options.value;
		if (options.path) {
			cookie_string += '; path=' + escape(options.path);
		}

		if (options.domain) {
			cookie_string += '; domain=' + escape(options.domain);
		}

		if (options.secure) {
			cookie_string += '; secure';
		}

		if (options.expires) {
			cookie_string += '; expires=' + options.expires;
		}

		document.cookie = cookie_string;
	}

	static getCookie(name) {
		var i,
			x,
			y,
			ARRcookies = document.cookie.split(';');
		for (i = 0; i < ARRcookies.length; i++) {
			x = ARRcookies[i].substr(0, ARRcookies[i].indexOf('='));
			y = ARRcookies[i].substr(ARRcookies[i].indexOf('=') + 1);
			x = x.replace(/^\s+|\s+$/g, '');
			if (x === name) {
				return unescape(y);
			}
		}
	}
}