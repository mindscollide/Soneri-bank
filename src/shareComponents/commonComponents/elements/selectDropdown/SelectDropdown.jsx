import React from "react";
import Select from "react-select";
import "./SelectDropdown.css";

const SelectDropdown = ({
  options = [],
  className,
  classNamePrefix = "TransactionModal",
  components,
  closeMenuOnSelect,
  closeMenuOnScroll,
  maxMenuHeight,
  isDisabled,
  placeholder,
  value,
  isSearchable,
  menuPlacement,
  filterOptions,
  menuIsOpen,
  menuPosition = "fixed",
  onChange,
  isMulti,
  styles,
}) => {
  return (
    <Select
      menuIsOpen={menuIsOpen}
      onChange={onChange}
      options={options}
      className={className}
      classNamePrefix={classNamePrefix}
      components={components}
      closeMenuOnSelect={closeMenuOnSelect}
      closeMenuOnScroll={closeMenuOnScroll}
      maxMenuHeight={maxMenuHeight}
      isDisabled={isDisabled}
      isSearchable={isSearchable || false}
      menuPlacement={menuPlacement || "bottom"}
      placeholder={placeholder}
      value={value}
      pageSize={0}
      menuPosition={menuPosition}
      filterOption={filterOptions}
      isMulti={isMulti}
      styles={styles}
    />
  );
};
// const SelectDropdown = ({
//   options = [],
//   className,
//   classNamePrefix = "RfqSpot",
//   components,
//   closeMenuOnSelect,
//   closeMenuOnScroll,
//   maxMenuHeight, // Set default max height
//   isDisabled,
//   placeholder,
//   value,
//   isSearchable,
//   menuPlacement,
//   filterOptions,
//   menuIsOpen,
//   menuPosition = "fixed", // Changed from 'fixed' to 'absolute' for better positioning
//   onChange,
// }) => {
//   return (
//     <Select
//       menuIsOpen={menuIsOpen}
//       onChange={onChange}
//       options={options}
//       className={className}
//       classNamePrefix={`${classNamePrefix} ${"RfqSpot"}`}
//       components={components}
//       closeMenuOnSelect={closeMenuOnSelect}
//       closeMenuOnScroll={closeMenuOnScroll}
//       maxMenuHeight={maxMenuHeight}
//       isDisabled={isDisabled}
//       isSearchable={isSearchable || false}
//       menuPlacement={menuPlacement}
//       placeholder={placeholder}
//       value={value}
//       pageSize={0}
//       menuPosition={menuPosition}
//       filterOption={filterOptions}
//     />
//   );
// };

export default SelectDropdown;
