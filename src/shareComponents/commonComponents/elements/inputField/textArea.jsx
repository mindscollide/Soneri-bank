import React from "react";
import styles from "./input.module.css";

const TextArea = ({
  type,
  value,
  onChange,
  pattern,
  placeholder,
  applyClass,
  checked,
  disabled,
  maxLength,
  minLength,
  name,
  required,
  onFocus,
  max,
  min,
  className,
  defaultValue,
  accept,
}) => (
  <textarea
    value={value}
    type={type}
    onChange={onChange}
    defaultValue={defaultValue}
    pattern={`${pattern}`}
    placeholder={placeholder}
    className={`${styles[applyClass]} ${className}`}
    checked={checked}
    disabled={disabled}
    maxLength={maxLength}
    minLength={minLength}
    max={max}
    min={min}
    name={name}
    required={required}
    onFocus={onFocus}
    accept={accept}
  />
);
export default TextArea;
