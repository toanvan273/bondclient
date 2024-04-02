import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import AccountBox from '../../common/account.box';
import {
    loadOrderBook,
    loadTransactionList,
} from '../../actions/bond.actions';
import { emitter } from '../../clients/emitter';
import { Event } from '../../constants/config';
import { format, addDays, subDays } from 'date-fns'
import OrderbookMain from './main';

function Orderbook(props) {
  const [fromDate, setFromDate] = useState(subDays(new Date(), 90))
  const [toDate, setToDate] = useState(new Date())

  useEffect(() => {
    listenTheEmitter()
  }, [])
  
  useEffect(() => {
    if (props.activeAccount) {
      getTransactionList(props.activeAccount);
      getOrderBook(props.activeAccount);
    }
  },[props.activeAccount])

  const listenTheEmitter = () => {
		emitter.on(Event.RELOAD_DEALS, () => {
		  getOrderBook(props.activeAccount);
    });
    emitter.on(Event.RELOAD_TRANSACTIONS, () => {
      getTransactionList(props.activeAccount);
    });
  }

  const getOrderBook = (account) => {
    props.dispatch(
      loadOrderBook({
        accountNumber: account.accountNumber,
        fromDate: format(fromDate,'yyyy-MM-dd'),
        toDate:  format(addDays(toDate,1),'yyyy-MM-dd')
      })
    );
  }

  const getTransactionList = (account) => {
    props.dispatch(
      loadTransactionList({
        accountNumber: account.accountNumber,
        fromDate: format(fromDate,'yyyy-MM-dd'),
        toDate:  format(addDays(toDate,1),'yyyy-MM-dd')
      })
    );
  }

  const reload = () => {
    if (props.activeAccount) {
      getTransactionList(props.activeAccount);
      getOrderBook(props.activeAccount);
    }
  }

  const loadOrderBookByDate = (fromDate, toDate) => {
    setFromDate(fromDate)
    setToDate(toDate)
    getTransactionList(props.activeAccount);
    getOrderBook(props.activeAccount);
  }

  let {accounts,activeAccount,setActiveAccount} = props;
  activeAccount = accounts ? accounts.find(acc => acc.accountNumber === activeAccount.accountNumber) : null;

  return (
    <div id="orderbook" style={{minHeight: 400}}>
      <AccountBox
        lang={props.lang}
        accounts={accounts}
        activeAccount={activeAccount}
        setActiveAccount={setActiveAccount}
        reload={reload}
      />
      <OrderbookMain
        activeAccount={activeAccount}
        lang={props.lang}
        loadByDate={loadOrderBookByDate}
        fromDate={fromDate}
        toDate={toDate}
      />
    </div>
  )
}

export default connect()(Orderbook)