let timing = {};
let gaReady = false;
let vndaReady = false;

const getTimingKey = (category, variable, label) => {
	var array = [category, variable];
	if (label) {
		array.push(label);
	}
	return array.join(':');
};

export const PROTRADE_TRACKER_NAME = 'BondClient-tracker';

export const setGaReady = () => {
	gaReady = true;
};

export const setVNDAReady = () => {
	vndaReady = true;
};

export const page = (path, title) => {
	if (gaReady && window.ga) {
		window.ga('send', {
			hitType: 'pageview',
			page: path,
			title: title
		});
	}
};

export const track = data => {
	Object.keys(data).forEach(key => {
		const req = data[key];
		if (key === 'ga') {
			trackGa(req.category, req.action, req.label, req.value);
		} else if (key === 'vnda') {
			// Tu 2018, thay the mixpanel sang vnda tracker
			trackVNDA(req.category, req.action, req.props);
		}
	});
};

export const trackGa = (category, action, label, value) => {
	if (gaReady && window.ga) {
		window.ga('send', 'event', category, action, label, value);
	}
};

export const trackVNDA = (category, action, ...rest) => {
	if (vndaReady && window.vnda) {
		setTimeout(() => {
			if (rest.length < 2) {
				window.vnda(
					`${PROTRADE_TRACKER_NAME}.send`,
					'event',
					category,
					action,
					rest[0] // props
				);
			} else {
				window.vnda(
					`${PROTRADE_TRACKER_NAME}.send`,
					'event',
					category,
					action,
					rest[0], // label,
					rest[1] // value
				);
			}
		}, 2e3);
	}
};

export const startTiming = (category, variable, label) => {
	timing[getTimingKey(category, variable, label)] = new Date().getTime();
};

export const haveTiming = (category, variable, label) => {
	return typeof timing[getTimingKey(category, variable, label)] === 'number';
};

export const clearTiming = (category, variable, label) => {
	delete timing[getTimingKey(category, variable, label)];
};

export const stopTiming = (category, variable, label) => {
	let startedAt = timing[getTimingKey(category, variable, label)];
	if (typeof startedAt === 'number') {
		if (gaReady && window.ga) {
			window.ga(
				'send',
				'timing',
				category,
				variable,
				new Date().getTime() - startedAt,
				label
			);
		}
	}
	clearTiming(category, variable, label);
};

export const identify = tokenObj => {
	if (!tokenObj) return;
	if (window.vnda) {
		window.vnda(
			`${PROTRADE_TRACKER_NAME}.set`,
			'userId',
			tokenObj.username
		);
	}
};