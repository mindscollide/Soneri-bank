import { Table } from "antd";
import React from "react";
import "./GlobalTable.css";

const GlobalTable = ({
  columns,
  prefixCls,
  dataSource,
  bordered,
  pagination,
  footer,
  style,
  locale,
  rowClassName,
  dropdownPrefixCls,
  expandable,
  onChange,
  className,
  onHeaderRow,
  scroll,
  onScroll,
  rowHoverBg,
  components,
  sticky,
  rowKey,
  onRow, // Add this line to accept the onRow prop
  loading,
  ref,
}) => {
  return (
    <Table
      rowHoverable={false}
      columns={columns}
      prefixCls={prefixCls}
      dataSource={dataSource}
      bordered={bordered}
      pagination={pagination}
      footer={footer}
      size="small"
      style={style}
      rowClassName={rowClassName}
      dropdownPrefixCls={dropdownPrefixCls}
      expandable={expandable}
      onChange={onChange}
      onHeaderRow={onHeaderRow}
      className={className}
      locale={locale}
      scroll={scroll}
      onScroll={onScroll}
      tableLayout="auto"
      rowHoverBg={rowHoverBg}
      components={components} // Pass the components prop to Table
      onRow={onRow} // Pass the onRow prop to Table
      sticky={sticky}
      rowKey={rowKey}
      loading={loading}
      ref={ref}
    />
  );
};

export default GlobalTable;
