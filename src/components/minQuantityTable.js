import React from 'react';
import numeral from 'numeral';

export default class MinQuantityTable extends React.Component {

    renderRows = (lang) => {
        let rows = [];
        for (let i = 0; i < 15; i++) {
            if (lang[`MinQuantityTableLabel_row${i}_col1`]) {
                rows.push(
                    <tr>
                        <td className="tl orange" style={{ paddingLeft: 10 }}>{lang[`MinQuantityTableLabel_row${i}_col1`]}</td>
                        <td>{numeral(lang[`MinQuantityTableLabel_row${i}_col2`]).format('0,0')}</td>
                    </tr>
                );
            }
        }
        return rows
    }

    render() {
        const { lang } = this.props;
        return (
            <div id="priceboard" style={{ marginTop: 20 }}>
                <table>
                    <thead>
                        <tr>
                            <th>{lang['bondCode']}</th>
                            <th>{lang['minQuantity']}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.renderRows(lang)
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}
