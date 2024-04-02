import React from 'react';
import AccountBox from '../common/account.box';
import OrderComfirmTable from '../components/ordercomfirm/table';

function OrderComfirmPage(props) {
    let { accounts, activeAccount, setActiveAccount } = props;
    activeAccount = accounts ? accounts.find(acc => acc.accountNumber === activeAccount.accountNumber) : null;
    return (
        <div className="order-comfirm-page">
            <AccountBox
                {...props}
                accounts={accounts}
                activeAccount={activeAccount}
                setActiveAccount={setActiveAccount}
            />
            <OrderComfirmTable
                activeAccount={activeAccount}
                {...props}
            />
        </div>
    )
}

export default OrderComfirmPage