import { Tabs } from "antd";
import React from "react";
import "./tabs.css";

const GlobalTabs = ({ items, tabBarExtraContent }) => {
  return (
    <Tabs
      type="card"
      prefixCls="tabsContent"
      centered
      items={items}
      tabBarExtraContent={tabBarExtraContent}
    />
  );
};

export default GlobalTabs;
