import { useState } from "react";

function IntroduceVbond(props) {
  const [showInfo, setShowInfo] = useState(
    localStorage.getItem("showInfo")
      ? localStorage.getItem("showInfo") === "true"
      : true
  );
  const { lang } = props;
  const toggleInfo = () => {
    localStorage.setItem("showInfo", !showInfo);
    setShowInfo(!showInfo);
  };

  return (
    <div id="bondinfo">
      <div
        className="heading"
        style={{ cursor: "pointer" }}
        onClick={() => toggleInfo()}
      >
        <i className="fa fa-info" /> {lang["productInfo"]}{" "}
        {showInfo ? (
          <i className="fa fa-chevron-up" />
        ) : (
          <i className="fa fa-chevron-down" />
        )}
      </div>
      {showInfo && (
        <p>
          <b>VBond</b> {lang["vbondInfo"]}{" "}
          <a
            href="https://dautu.vndirect.com.vn/trai-phieu-v-bond/"
            target="_blank"
          >
            {lang["here"]}
          </a>
        </p>
      )}
    </div>
  );
}

export default IntroduceVbond;
