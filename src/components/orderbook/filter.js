import React, { useState } from 'react';
import CheckBox from '../../common/check.box';

function OrderbookFilter(props) {
  const [filter, setFilter] = useState({...props.filter})
  
	const handleFilterSide = (side) => {
		if (filter.side.has(side)) {
			filter.side.delete(side);
		} else {
			filter.side.add(side);
		}
		setFilter(filter);
		props.doFilter(filter);
	}

	const handleSymbolChange = (e) => {
    let value = e.target.value;
    const symbolFilter = {...filter, symbol: value}
    setFilter({...symbolFilter})
    if (value === '' || value.length >= 3) {
      props.doFilter(symbolFilter);
    }
	}

	const handleFilterStatus = (status) => {
		if (filter.status.has(status)) {
			filter.status.delete(status);
		} else {
			filter.status.add(status);
    }
    setFilter(filter);
		props.doFilter(filter);
	}

  const	handleFilterProduct = p => {
		if (filter.product.has(p)) {
			filter.product.delete(p);
		} else {
			filter.product.add(p);
		}
		setFilter(filter);
		props.doFilter(filter);
	}

  return (
    <div className="order-filter">
		<div className="filter-col" style={{ width: '8%' }}>
			<div className="filter-header">
				{props.lang['Lệnh']}
			</div>
			<div className="filter-content">
				<ul>
					<li>
						<CheckBox
							value="NB"
							label={props.lang['Mua']}
							checked={filter.side.has('NB')}
							getValue={e => handleFilterSide(e)}
							styleLabel={{
								color: '#2FF973'
							}}
						/>
					</li>
					<li>
						<CheckBox
							value="NS"
							label={props.lang['Bán']}
							checked={filter.side.has('NS')}
							getValue={e => handleFilterSide(e)}
							styleLabel={{
								color: '#F93131'
							}}
						/>
					</li>
				</ul>
			</div>
		</div>
		<div className="filter-col" style={{ width: '10%' }}>
			<div className="filter-header" style={{ paddingRight: 0 }}>
				{props.lang['productType']}
			</div>
			<div className="filter-content">
				<ul>
					<li>
						<CheckBox
							value="d-bond"
							label="DBOND"
							checked={filter.product.has('d-bond')}
							getValue={e => handleFilterProduct(e)}
						/>
					</li>
					<li>
						<CheckBox
							value="v-bond"
							label="VBOND"
							checked={filter.product.has('v-bond')}
							getValue={e => handleFilterProduct(e)}
						/>
					</li>
				</ul>
			</div>
		</div>
		<div className="filter-col symbol" style={{ width: '12%' }}>
			<div className="filter-header">
				{props.lang['Mã trái phiếu']}
			</div>
			<div className="filter-content">
				<input className="input-sybol"
					value={filter.symbol}
					onChange={handleSymbolChange}
				/>
			</div>
		</div> 
		<div className="filter-col status" style={{ width: '70%' }}>
			<div className="filter-header">
				{props.lang['Trạng thái']}
			</div>
			<div className="filter-content">
				<ul>
					<li>
						{/* // Chờ duyệt lệnh */}
						<CheckBox
							value="pending"
							label={props.lang['PENDING']}
							checked={filter.status.has(
								'pending'
							)}
							getValue={e => handleFilterStatus(e)}

						/>
					</li>
					<li>
						{/* Chờ xác nhận */}
						<CheckBox
							value="approved"
							label={props.lang['APPROVED']}
							checked={filter.status.has(
								'approved'
							)}
							getValue={e => handleFilterStatus(e)}
						/>
					</li>
					<li>
						{/* "Chờ khớp lệnh" */}
						<CheckBox
							value="confirmed"
							label={props.lang['CONFIRMED']}
							checked={filter.status.has(
								'confirmed'
							)}
							getValue={e => handleFilterStatus(e)}
						/>
					</li>
				</ul>

				<ul>
					<li>
						{/* "Chờ hạch toán" */}
						<CheckBox
							value="matched"
							label={props.lang['MATCHED']}
							checked={filter.status.has(
								'matched'
							)}
							getValue={e => handleFilterStatus(e)}
						/>
					</li>
					<li>
						{/* "Chờ hoàn thiện hồ sơ" */}
						<CheckBox
							value="settled"
							label={props.lang['SETTLED']}
							checked={filter.status.has(
								'settled'
							)}
							getValue={e => handleFilterStatus(e)}
						/>
					</li>
				</ul>

				<ul>
					<li>
						{/* "Hoàn tất leg1" */}
						<CheckBox
							value="completed_leg1"
							label={props.lang['COMPLETED_LEG1']}
							checked={filter.status.has(
								'completed_leg1'
							)}
							getValue={e => handleFilterStatus(e)}
						/>
					</li>
					<li>
						{/* "Hoàn tất" */}
						<CheckBox
							value="completed"
							label={props.lang['COMPLETED']}
							checked={filter.status.has(
								'completed'
							)}
							getValue={e => handleFilterStatus(e)}
						/>
					</li>
				</ul>

				<ul>
					<li>
						{/* "Hủy thành công" */}
						<CheckBox
							value="canceled"
							label={props.lang['CANCELED']}
							checked={filter.status.has(
								'canceled'
							)}
							getValue={e => handleFilterStatus(e)}
						/>
					</li>
					<li>
						{/* "Từ chối" */}
						<CheckBox
							value="rejected"
							label={props.lang['REJECTED']}
							checked={filter.status.has(
								'rejected'
							)}
							getValue={e => handleFilterStatus(e)}
						/>
					</li>
				</ul>
			</div>
		</div>
	</div>
  )
}

export default OrderbookFilter;