import React from 'react';
import { connect } from 'react-redux';
import AccountBox from '../common/account.box';
import {
    loadOrderBook,
    loadTransactionList,
} from '../actions/bond.actions';
import { emitter } from '../clients/emitter';
import { Event } from '../constants/config';
import { format, addDays, subDays } from 'date-fns'
import OrderbookMain from './orderbook/orderbook.main';

class OrderBook extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fromDate: subDays(new Date(), 90),
      toDate: new Date(),
    };
    this.loadOrderBook = this.loadOrderBook.bind(this);
    this.loadOrderBookByDate = this.loadOrderBookByDate.bind(this);
    this.loadTransactionList = this.loadTransactionList.bind(this);
    this.reload = this.reload.bind(this);
    this.listenTheEmitter();
  }

  listenTheEmitter() {
    emitter.on(Event.RELOAD_DEALS, () => {
      this.loadOrderBook(this.props.activeAccount);
    });
    emitter.on(Event.RELOAD_TRANSACTIONS, () => {
      this.loadTransactionList(this.props.activeAccount);
    });
  }

  componentDidMount() {
    setTimeout(() => {
      window.resize();
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.activeAccount &&
      nextProps.activeAccount !== this.props.activeAccount
    ) {
      this.loadOrderBook(nextProps.activeAccount);
      this.loadTransactionList(nextProps.activeAccount);
    }
  }

  loadOrderBook(account) {
    const { fromDate, toDate } = this.state;
    this.props.dispatch(
      loadOrderBook({
        accountNumber: account.accountNumber,
        fromDate: format(fromDate, "yyyy-MM-dd"),
        toDate: format(addDays(toDate, 1), "yyyy-MM-dd"),
      })
    );
  }

  loadTransactionList(account) {
    const { fromDate, toDate } = this.state;
    this.props.dispatch(
      loadTransactionList({
        accountNumber: account.accountNumber,
        fromDate: format(fromDate, "yyyy-MM-dd"),
        toDate: format(addDays(toDate, 1), "yyyy-MM-dd"),
      })
    );
  }

  reload() {
    if (this.props.activeAccount) {
      this.loadTransactionList(this.props.activeAccount);
      this.loadOrderBook(this.props.activeAccount);
      emitter.emit(Event.RELOAD_ORDER_BOOK);
    }
  }

  loadOrderBookByDate(fromDate, toDate) {
    this.setState(
      {
        fromDate,
        toDate,
      },
      () => {
        this.loadTransactionList(this.props.activeAccount);
        this.loadOrderBook(this.props.activeAccount);
      }
    );
  }

  render() {
    const { fromDate, toDate } = this.state;
    let { accounts, activeAccount, setActiveAccount } = this.props;

    activeAccount = accounts
      ? accounts.find(
          (acc) => acc.accountNumber === activeAccount.accountNumber
        )
      : null;
    return (
      <div id="orderbook" style={{ minHeight: 400 }}>
        <AccountBox
          lang={this.props.lang}
          accounts={accounts}
          activeAccount={activeAccount}
          setActiveAccount={setActiveAccount}
          reload={this.reload}
        />
        <OrderbookMain
          activeAccount={activeAccount}
          lang={this.props.lang}
          loadByDate={this.loadOrderBookByDate}
          fromDate={fromDate}
          toDate={toDate}
        />
      </div>
    );
  }
}

export default connect()(OrderBook);
