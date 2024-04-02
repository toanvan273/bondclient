import React from 'react';
import DealRow from './deal.row';


export default function OrderTableContent(props) {
    const { deals } = props
    
    if (!deals) {
        return (
            <tbody>
                <tr>
                    <td colSpan="10">
                        <div className="loading">
                            <i className="fa fa-refresh fa-spin fa-3x fa-fw" />
                        </div>
                    </td>
                </tr>
            </tbody>
        );
    }

    if (deals.length === 0) {
        return (
            <tbody>
                <tr>
                    <td colSpan="10" className="no-order">
                        {props.lang['Không có lệnh']}
                    </td>
                </tr>
            </tbody>
        );
    }
    let rows = [];
    // sort deals
    deals.sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime());
    deals.map(order => {
        return rows.push(
            <DealRow
                key={order.docId}
                order={order}
                {...props}
            />
        );
    });

    return <tbody>{rows}</tbody>
}