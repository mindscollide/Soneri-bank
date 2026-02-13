import React, { useState } from "react";
import styles from "./button.module.css";
import { Button } from "antd";
const CustomButton = ({
  icon,
  type = "primary",
  shape,
  iconPosition,
  value,
  onClick,
  rootClassName = null,
  classNames = null,
  size,
  prefixCls,
  applyClass,
  className,
  disabled,
  loading = false,
}) => {
  return (
    <>
      <Button
        type={type}
        icon={icon}
        shape={shape}
        disabled={disabled}
        rootClassName={"rootClassName"}
        className={`${styles[applyClass]} ${className}`}
        classNames={classNames}
        prefixCls={prefixCls}
        size={size}
        onClick={onClick}
        iconPosition={iconPosition}
        loading={loading}
      >
        {value}
      </Button>
    </>
  );
};
export default CustomButton;
