import ReactDOM from 'react-dom';
import React from 'react';
import { Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
// import * as OfflinePluginRuntime from 'offline-plugin/runtime';
import { initFingerprint } from './modules/device.id';
import configureStore from './stores/configureStores';
import routes from './routes';

const store = configureStore();
initFingerprint();
browserHistory.listen(location => {
	if (typeof window.scrollToTop === "function") {
		window.scrollToTop();
	}
});

ReactDOM.render(
	<Provider store={store}>
		<Router history={browserHistory} routes={routes} />
	</Provider>,
	document.getElementById('root')
);
