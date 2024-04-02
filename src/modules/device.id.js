import FingerprintJS from 'fingerprintjs2';
import { getUsername } from '../services/auth.service';

const FINGERPRINT_KEY = 'BOND_FINGERPRINT';

export const initFingerprint = () => {
	FingerprintJS.get(
		{
			excludes: {
				// ignore tracking the userAgent to prevent changing DeviceID when browser automatically updated
				userAgent: true,
				// read library's source code for more detail: https://github.com/Valve/fingerprintjs2/blob/master/fingerprint2.js => Line 256
				doNotTrack: true,
				enumerateDevices: true,
				pixelRatio: true,
				fontsFlash: true
			}
		},
		components => {
			let values = components.map(component => component.value);
			let fingerprint = FingerprintJS.x64hash128(values.join('|'), 31);

			window[FINGERPRINT_KEY] = fingerprint;
			window[FINGERPRINT_KEY + '_COMPONENTS'] = components;
		}
	);
};

export const getDeviceID = () => {
	if (!window[FINGERPRINT_KEY]) {
		throw 'Fingerprint not initialized';
	}
	if (!getUsername()) {
		throw 'Not logged in';
	}
	return window[FINGERPRINT_KEY] + '_v2_' + getUsername();
};
