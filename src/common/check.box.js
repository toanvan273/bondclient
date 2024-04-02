import React from 'react';

const CheckBox = props => {
  const { value, label, styleLabel, getValue, checked } = props
  return (
    <label className="contain-checkbox">
      <input checked={checked} onChange={()=>{}} type="checkbox" onClick={() => { getValue && getValue(value) }} id={`${value}`} />
      <span className="checkmark"></span>
      <span htmlFor={`${value}`} className='label-box' style={{ ...styleLabel }} >{label}</span>
    </label>
  )
}

export default CheckBox