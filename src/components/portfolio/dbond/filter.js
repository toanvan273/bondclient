import React, { useState } from 'react';
import fil from '../../../resource/images/filter.svg'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CheckBox from '../../../common/check.box';

function FilterDbond(props) {
  const [showFilter, setShowFilter] = useState(false)
  const { filter, lang } = props;

  const handleSetFilter = (key, value) => {
    let { filter, setFilter } = props
    setFilter({ ...filter, [key]: value })
  }


  return (
    <div className="advanced-filter">
      <div className="div-search" onClick={() => { setShowFilter(!showFilter) }}>
          <img src={fil} />
          <span>{lang['advancedFilter']}</span>
          {showFilter ? (
            <i className="fa fa-angle-up" />
          ) : (
            <i className="fa fa-angle-down" />
          )}
      </div>
      {showFilter &&
        <div className="div-advanced">
          <div className="trade-date">
            <DatePicker
              maxDate={new Date()}
              dateFormat="dd/MM/yyyy"
              tabIndex="5"
              className="picker-date"
              placeholderText={lang['TradeDate']}
              selected={filter.trade_date ? filter.trade_date : null}
              onChange={d => { handleSetFilter('trade_date', d) }}
            />
          </div>
          <div className="maturity-date">
            <DatePicker
              dateFormat="dd/MM/yyyy"
              tabIndex="5"
              className="picker-date"
              placeholderText={lang['MaturityDate']}
              selected={filter.maturity_date ? filter.maturity_date : null}
              onChange={d => { handleSetFilter('maturity_date', d) }}
            />
          </div>
          <div className="incompleted">
            <CheckBox
              checked={filter.status_file}
              value={"incomplete"}
              getValue={() => { handleSetFilter('status_file', !filter.status_file) }}
              label={lang['profileIncomplete']}
            />
          </div>
          <div className="received">
            <CheckBox
              checked={filter.received_coupon}
              value="received"
              getValue={() => { handleSetFilter('received_coupon', !filter.received_coupon) }}
              label={lang['couponReceived']}
            />
          </div>
        </div>}
    </div>
  )
}

export default FilterDbond