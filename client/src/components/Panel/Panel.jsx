import React from "react";

function Panel({ title, info}) {
  return (
    <div className="panel panel-white stats-widget">
      <div className="panel-body">
        <div className="pull-left">
          <span className="stats-number">{title}</span>
          <p className="stats-info">{info}</p>
        </div>
        <div className="pull-right">
          <i className="icon-arrow_upward stats-icon"></i>
        </div>
      </div>
    </div>
  );
}

export default Panel;
