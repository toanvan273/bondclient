import React from 'react';
// import Orderbook from '../components/orderbook';
import Orderbook from '../components/orderbook/index';
const OrderBookPage = ({ accounts, activeAccount, setActiveAccount, lang }) => {
	const hasActiveAccount = accounts && activeAccount;
	return (
		<div>
			{hasActiveAccount &&
				<Orderbook
					lang={lang}
					accounts={accounts}
					activeAccount={activeAccount}
					setActiveAccount={setActiveAccount}
				/>
			}
		</div>
	);
};

export default OrderBookPage;
