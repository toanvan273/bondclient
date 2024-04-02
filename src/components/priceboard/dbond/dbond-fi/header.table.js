import React from "react";
import ReactTooltip from "react-tooltip";
import { genLabelTypeBond, genNTypeBond } from "../../../../helpers";

function FiHeader(props) {
  const { lang, typeBond, setTypeBond } = props;
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
      <th>{lang["actions"]}</th>
    </tr>
  );
}

export default FiHeader;
