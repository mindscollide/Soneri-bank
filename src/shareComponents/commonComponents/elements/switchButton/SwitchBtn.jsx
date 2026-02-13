import React from "react";
import { Switch } from "antd";
import "./SwitchBtn.css";
const SwitchButton = ({
  checked,
  onChange,
  size,
  onClick,
  disabled,
  rootClassName,
  checkedChildren,
  unCheckedChildren,
  value,
  labelValue,
}) => (
  <>
    <span className="d-flex gap-1 align-items-center">
      <Switch
        size={size}
        className={"switchBtn"}
        rootClassName={rootClassName}
        onClick={onClick}
        disabled={disabled}
        checked={checked}
        value={value}
        onChange={onChange}
        checkedChildren={checkedChildren}
        unCheckedChildren={unCheckedChildren}
      />
      <label className="switchBtn_TextValue roboto">{labelValue}</label>
    </span>
  </>
);
export default SwitchButton;
