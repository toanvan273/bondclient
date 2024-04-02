import React, { useEffect, useState } from 'react';
import OrderTableContent from './content';
import { getPendingReq } from '../../clients/bond.api.client';
import { genLabelTypeBond, genNTypeBond } from "../../helpers";

function OrderComfirmTable(props) {
  const [deals, setDeals] = useState(null);
  const [typeBond, setTypeBond] = useState(1);

  useEffect(() => {
    if (props.activeAccount) {
      _getPendingReq(props.activeAccount);
    }
  }, [props.activeAccount]);

  const _getPendingReq = (account) => {
    getPendingReq(account.accountNumber)
      .then((res) => {
        if (res.data) {
          setDeals(res.data);
        }
      })
      .catch((err) => {
        setDeals([]);
      });
  };

  const { lang } = props;
  return (
    <div id="order-table">
      <div className="assets-tab page-tab">
        <ul>
          <li className="active">
            <a className="txt-upper">{lang["orderConfirm"]}</a>
          </li>
        </ul>
      </div>
      <div>
        <table id="order-table">
          <colgroup></colgroup>
          <thead>
            <tr>
              <th>{lang["Mã giao dịch"]}</th>
              <th>{lang["TradeDate"]}</th>
              <th>{lang["ValueDate"]}</th>
              <th>{lang["Loại lệnh"]}</th>
              <th>{lang["CustomerAccountNo"]}</th>
              <th>{lang["bondType"]}</th>
              <th>
                <i
                  className="fa fa-caret-left pointer"
                  style={{ marginRight: "4px" }}
                  onClick={() => setTypeBond(genNTypeBond(typeBond - 1))}
                />
                <div style={{ display: "inline-block", minWidth: 84 }}>
                  {genLabelTypeBond(typeBond, lang)}
                </div>
                <i
                  className="fa fa-caret-right pointer"
                  style={{ marginLeft: "4px" }}
                  onClick={() => setTypeBond(genNTypeBond(typeBond + 1))}
                />
              </th>
              <th>{lang["Quantity"]}</th>
              <th>
                {lang["Giá thực hiện"]} ({lang["currency"]})
              </th>
              <th>{lang["Thao tác"]}</th>
            </tr>
          </thead>
          <OrderTableContent deals={deals} {...props} typeBond={typeBond} />
        </table>
      </div>
    </div>
  );
}

export default OrderComfirmTable