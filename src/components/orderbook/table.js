import React from 'react';
import OrderRow from './order.row';
import TransactionRow from './transaction.row';

function OrderbookContentTable(props) {
  
  const { activeAccount, typeBond } = props;
  if (!props.deals || !props.transactionList) {
    return (
      <tbody>
        <tr>
          <td colSpan="16">
            <div className="loading">
              <i className="fa fa-refresh fa-spin fa-3x fa-fw" />
            </div>
          </td>
        </tr>
      </tbody>
    );
  }
  if (props.deals.length === 0 && props.transactionList.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan="16" className="no-order">
            {props.lang["Không có lệnh"]}
          </td>
        </tr>
      </tbody>
    );
  }

  let rows = [];
  // sort deals
  props.deals.sort(
    (a, b) =>
      new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime()
  );

  props.deals.map((order) => {
    return rows.push(
      <OrderRow
        activeAccount={activeAccount}
        lang={props.lang}
        key={order.deal_id}
        order={order}
        typeBond={typeBond}
      />
    );
  });

  // sort transaction
  props.transactionList.sort(
    (a, b) =>
      new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime()
  );

  props.transactionList.map((transaction) => {
    if (transaction.product_type !== "OUTRIGHT" && transaction.side === "NS") {
      return rows.push(
        <TransactionRow
          activeAccount={activeAccount}
          lang={props.lang}
          key={transaction.transaction_id}
          order={transaction}
          typeBond={typeBond}
        />
      );
    }
  });
  return <tbody>{rows}</tbody>;
}

export default OrderbookContentTable