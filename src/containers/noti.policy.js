import React, { useState } from "react";
import { getProductPolicy } from "../clients/bond.api.client";
import { displayNoti } from "../helpers";
import { browserHistory } from "react-router";

const queryString = require("query-string");

function NoticePolicy() {
  const [pending,setPending] = useState(false)
  const [confirm, setConfirm] = useState(false);
  const [err, setErr] = useState(false)
  const parsed = queryString.parse(window.location.search);
  const handleConfirm = () => {
    if (!confirm) {
      setErr(true)
      return
    }
    setPending(true)
    getProductPolicy().then(res => {
      if (res) {
        setTimeout(() => {
          const page = parsed.redirect ? '/' + parsed.redirect : '/bang-gia'
          browserHistory.push(page)
          setPending(false)
        },4000)
      }
    }).catch(err => {
      if (err.response) {
        const { error, status } = err.response.data;
        displayNoti(`Lỗi hệ thống. ${error} (${status}) `, "error");
        setPending(false)
      }
    })
  }

  return (
    <div>
      <div className="product-policy">
        <div className="header-title">
          <h1 className="txt-upper anoffer tc">
            Chính sách hỗ trợ khách hàng sản phẩm DBOND
          </h1>
        </div>
        <div className="content-policy">
          <div className="policy">
            <p>
              Căn cứ vào hợp đồng mua bán trái phiếu theo sản phẩm DBOND (“Hợp
              Đồng DBOND”) mà Quý Khách Hàng đã ký với VNDIRECT và kế hoạch đăng
              ký, lưu ký và giao dịch trái phiếu tập trung của các tổ chức phát
              hành trái phiếu nhằm đáp ứng các quy định pháp luật mới ban hành.
              Trong thời gian tổ chức phát hành thực hiện các thủ tục nói trên,
              trái phiếu{" "}
              <b style={{ color: "#ffffff" }}>
                sẽ phải hạn chế giao dịch theo quy định của Tổng Công Ty Lưu Ký
                và Bù Trừ Chứng Khoán Việt Nam
              </b>
              . Vì vậy, VNDIRECT xin thông báo như sau:
            </p>
            <p>
              1. Ngày Trả Lại trái phiếu theo Hợp Đồng DBOND của Quý Khách Hàng
              có thể nằm trong thời gian hạn chế chuyển nhượng trái phiếu do Tổ
              Chức Phát Hành thông báo. Trong trường hợp này, Ngày Trả Lại trái
              phiếu của Quý Khách sẽ điều chỉnh thành ngày giao dịch đầu tiên
              sau khi Tổ Chức Phát Hành hoàn thành các thủ tục đăng ký lưu ký và
              đăng ký giao dịch phù hợp với quy định của pháp luật và cơ quan
              quản lý. Quý khách hàng sẽ hưởng mức lợi suất như cam kết tại hợp
              đồng DBOND đến Ngày Trả Lại mới.
            </p>
            <p>
              2. Để giảm thiểu ảnh hưởng của các công việc mà Tổ Chức Phát Hành
              phải thực hiện theo quy định, VNDIRECT có chính sách hỗ trợ Quý
              Khách Hàng trong khoảng thời gian nói trên, theo đó Quý Khách Hàng
              có thể trả lại trái phiếu trước Ngày Trả Lại trái phiếu và hưởng
              chính sách tương ứng với trường hợp cụ thể của từng Hợp Đồng DBOND
              đã ký kết như sau:
            </p>
            <div className="policy-table" style={{ padding: "0 10px" }}>
              <table>
                <colgroup>
                  <col></col>
                  <col></col>
                  <col></col>
                </colgroup>
                <tbody>
                  <tr>
                    <td colSpan={2} className="bold tc">
                      Trường hợp
                    </td>
                    <td className="bold tc">
                      Lợi suất đầu tư trái phiếu được áp dụng
                    </td>
                  </tr>
                  <tr>
                    <td rowSpan={2} className="tl">
                      Thời gian đầu tư trái phiếu từ đủ 30 ngày trở lên
                    </td>
                    <td className="tl">
                      Thời gian đầu tư trái phiếu ≥ 90% thời gian đầu tư tối đa
                      theo Phụ Lục Hợp Đồng DBOND
                    </td>
                    <td className="text-l">
                      <ul>
                        <li className="tl">
                          Áp dụng lợi suất đầu tư quy định tại Phụ Lục Hợp Đồng
                          DBOND.
                        </li>
                        <li className="tl">
                          Lợi suất đầu tư sẽ tính trên số ngày nắm giữ trái
                          phiếu thực tế.
                        </li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <td className="tl">
                      <span>
                        Thời gian đầu tư trái phiếu &#8249; 90% thời gian đầu tư
                        tối đa theo Phụ Lục Hợp Đồng DBOND
                      </span>
                    </td>
                    <td>
                      <ul>
                        <li className="tl">
                          Áp dụng mức lợi suất đầu tư theo biểu lợi suất DBOND
                          hiện hành mà VNDIRECT công bố.
                        </li>
                        <li className="tl">
                          Lợi suất đầu tư sẽ tính trên số ngày nắm giữ trái
                          phiếu thực tế.
                        </li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="tl">
                      Thời gian đầu tư trái phiếu dưới 30 ngày
                    </td>
                    <td className="tl">
                      Áp dụng mức lợi suất 0,1%/năm tính trên số ngày nắm giữ
                      trái phiếu thực tế của Quý Khách Hàng
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="tl">
                      Quý Khách Hàng đồng ý tiếp tục nắm giữ trái phiếu đến hết
                      thời gian bị hạn chế chuyển nhượng
                    </td>
                    <td className="tl">
                      Áp dụng mức lợi suất theo Hợp Đồng DBOND của Quý Khách
                      Hàng đến ngày giao dịch đầu tiên của trái phiếu tương ứng.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              3. Quý Khách Hàng có nhu cầu trả lại trái phiếu vui lòng gửi đề
              nghị trả lại trái phiếu đến VNDIRECT trước ngày chốt danh sách
              được TCPH thông báo tới Quý Khách hàng. Trường hợp Quý Khách Hàng
              không yêu cầu trả lại trái phiếu trước thời điểm này, Quý Khách
              Hàng đồng ý thay đổi Ngày Trả Lại trái phiếu theo thông tin tại
              mục 1.
            </p>
            <p>
              4. Ngày Trả Lại trái phiếu mới sẽ khác nhau với từng mã trái
              phiếu, phụ thuộc vào tiến độ thực hiện các thủ tục đăng ký lưu ký
              và đăng ký giao dịch của Tổ Chức Phát Hành.
            </p>
            <p>Trân trọng!</p>
            <div
              className="confirm-checkbox  my-checkbox"
              style={{ marginTop: 35 }}
            >
              {/* <div style={{marginBottom:5}}><b>Nội dung xác nhận của khách hàng:</b></div> */}
              <label className="contain">
                <input
                  value={confirm}
                  type="checkbox"
                  style={{
                    height: 13,
                    width: "auto",
                    marginLeft: 0,
                    marginBottom: 1,
                  }}
                  onChange={() => {
                    setConfirm(!confirm);
                    setErr(false);
                  }}
                />
                <span className="checkmark" />
                <label
                  className="bold"
                  style={{ marginLeft: 3, color: "#ffffff" }}
                >
                  Tôi đã đọc, hiểu và đồng ý áp dụng các chính sách do VNDIRECT
                  công bố cho các hợp đồng mua trái phiếu theo sản phẩm DBOND mà
                  tôi đã ký với VNDIRECT.
                </label>
              </label>
            </div>
          </div>
        </div>
        <div className="btn-group">
          <button
            className="btn btn-primary"
            style={{ margin: 0 }}
            onClick={handleConfirm}
          >
            {pending ? (
              <i className="fa fa-spinner fa-spin" />
            ) : (
              <span>Xác nhận</span>
            )}
          </button>
        </div>
        <div>
          {err && !confirm && (
            <p className="txt-red tc">Vui lòng chọn đã hiểu</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoticePolicy;
