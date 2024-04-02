import React from "react";
import icon from '../../resource/images/notiset.svg'
class BeforeLimit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            coupon: null
        }
    }

    handleBack = () => {
        document.getElementById("before-limit").style.top = '-999px';
    }
    handleSubmit = () => {
        const { handleGo } = this.props;
        handleGo && handleGo(true);
        document.getElementById("before-limit").style.top = '-999px';
    }
    
    render() {
        const { lang } = this.props;


        return (
            <div className="before-limit" id="before-limit">
                <div className="header">
                    <img src={icon} />
                </div>
                <div className="content">
                    <b>{lang['note']}:</b>
                    <p>{lang['noteExpire1']}</p>
                    <p>{lang['noteExpire2']}</p>
                </div>
                <div className="group-btn">
                    <button className="btn-back btn" onClick={this.handleBack}>{lang['Back']}</button>
                    <button className="btn-submit btn" onClick={this.handleSubmit}>{lang['agree']}</button>
                </div>
            </div>
        );
    }
}
export default BeforeLimit;
