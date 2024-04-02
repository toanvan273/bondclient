import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import { genLabelTypeBond, genNTypeBond } from "../../../helpers";

export default class VBondHeader extends Component {
  render() {
    let { lang, typeBond, setTypeBond } = this.props;
    return (
      <tr>
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
        <th>{lang["Ngày đáo hạn"]}</th>
        <th>
          {lang["yieldMaturity"]}&nbsp;
          <span
            data-tip
            data-for="tip-yieldMaturity"
            data-class="bottom-tooltip"
          >
            <i className="fa fa-info-circle cPointer" />
          </span>
          <ReactTooltip id="tip-yieldMaturity" effect="solid" place="bottom">
            <p>
              Lãi suất thực nhận của khách hàng trước thuế, phí nếu mua trái
              phiếu hôm nay và nắm giữ đến khi trái phiếu đáo hạn
            </p>
          </ReactTooltip>
        </th>
        <th>
          {lang["sellPrice"]}&nbsp;
          <span
            data-tip
            data-for="tip-sellPriceVBond"
            data-class="bottom-tooltip"
          >
            <i className="fa fa-info-circle cPointer" />
          </span>
          <ReactTooltip id="tip-sellPriceVBond" effect="solid" place="bottom">
            <p>{lang["sellPriceTooltip"]}</p>
          </ReactTooltip>
        </th>
        <th>
          {lang["buyPrice"]}&nbsp;
          <span
            data-tip
            data-for="tip-buyPriceVBond"
            data-class="bottom-tooltip"
          >
            <i className="fa fa-info-circle cPointer" />
          </span>
          <ReactTooltip id="tip-buyPriceVBond" effect="solid" place="bottom">
            <p>{lang["buyPriceTooltip"]}</p>
          </ReactTooltip>
        </th>
        <th>
          {lang["minBalance"]}&nbsp;
          <span
            data-tip
            data-for="tip-minBalanceVBond"
            data-class="bottom-tooltip"
          >
            <i className="fa fa-info-circle cPointer" />
          </span>
          <ReactTooltip id="tip-minBalanceVBond" effect="solid" place="bottom">
            <p>{lang["minBalanceTooltip"]}</p>
          </ReactTooltip>
        </th>
        <th>{lang["maxBalance"]}</th>
        <th>{lang["remain_limit"]}</th>
        <th style={{minWidth: 230}}>{lang["actions"]}</th>
      </tr>
    );
  }
}
