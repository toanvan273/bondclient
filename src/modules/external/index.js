import React from 'react';
import Script from 'react-load-script';
import * as Tracker from '../tracker';
import { getUsername } from '../../services/auth.service';

export default class ExternalLibs extends React.Component {
	constructor() {
		super();
	}

	componentDidMount() {
		// this.initVNDA();
	}

	initVNDA() {
		window.vnda =
			window.vnda ||
			function() {
				(window.vnda.q = window.vnda.q || []).push(arguments);
			};
		window.vnda.l = +new Date();
	}

	handleGALoaded() {
		(function(i, s, o, g, r, a, m) {
			i['GoogleAnalyticsObject'] = r;
			// eslint-disable-next-line
			(i[r] =
				i[r] ||
				function() {
					(i[r].q = i[r].q || []).push(arguments);
				}),
				(i[r].l = 1 * new Date());
			// eslint-disable-next-line
			(a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
			a.async = 1;
			a.src = g;
			m.parentNode.insertBefore(a, m);
		})(
			window,
			document,
			'script',
			'https://www.google-analytics.com/analytics.js',
			'ga'
		);
		console.log('GA loaded')

		window.ga('create', 'UA-121185054-6', 'auto');
		window.ga('send', 'pageview');
		window.ga('require', 'ec');

		Tracker.setGaReady();
		Tracker.page('/', 'BondClient');
	}

	// Google Tag Manager script
	handleGTMLoaded() {
		(function(w, d, s, l, i) {
			w[l] = w[l] || [];
			w[l].push({
				'gtm.start': new Date().getTime(),
				event: 'gtm.js'
			});
			var f = d.getElementsByTagName(s)[0],
				j = d.createElement(s),
				dl = l != 'dataLayer' ? '&l=' + l : '';
			j.async = true;
			j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
			f.parentNode.insertBefore(j, f);
		})(window, document, 'script', 'dataLayer', 'GTM-PPJPCKF');
	}

	handleVNDALoaded() {
		Tracker.setVNDAReady();
		const username = getUsername();
		if (window.vnda) {
			window.vnda('create', 'Protrade', 'auto', 'Protrade-tracker');
			username &&
				window.vnda(
					'Protrade-tracker.set',
					'userId',
					username
				);
			window.vnda('Protrade-tracker.send', 'pageview');
		}
	}

	render() {
		return (
			<div>
				<Script
					url="https://www.google-analytics.com/analytics.js"
					onLoad={this.handleGALoaded.bind(this)}
				/>
				{/* <Script
					url="https://product.vndirect.com.vn/js/v1/analytic.js"
					onLoad={this.handleVNDALoaded.bind(this)}
				/> */}
			</div>
		);
	}
}
