import React, { useState } from 'react';
import fil from '../../../resource/images/filter.svg'
import "react-datepicker/dist/react-datepicker.css";

function FilterVbond(props) {
  const [showFilter, setShowFilter] = useState(false)

  const handleSetFilter = (key, value) => {
    let { filter, setFilter } = props
    setFilter({ ...filter, [key]: value })
  }

  let { filter, lang } = props

  return (
    <div className="advanced-filter">
      <div className="div-search" onClick={() => { setShowFilter(!showFilter) }}>
        <img src={fil} />
        <span>{lang['advancedFilter']}</span>
        {showFilter ? <i className="fa fa-angle-up" /> : <i className="fa fa-angle-down" />}
      </div>
      {showFilter &&
        <div className="div-advanced">
          <div className="input-sybol">
            <input placeholder={lang['bondCode']} value={filter.bond_code}
              onChange={e => {handleSetFilter('bond_code', e.target.value)}} />
          </div>
        </div>}
    </div>
  )
}

export default FilterVbond