import { Tabs } from "antd";
import React, { useEffect, useState } from "react";
import "./tabs.css";

const GlobalTabs = ({ items = [], tabBarExtraContent }) => {
  const storageKey = "globalTabsActiveKey";

  const [activeKey, setActiveKey] = useState();

  // set initial tab when items load
  useEffect(() => {
    if (items.length > 0) {
      const savedKey = localStorage.getItem(storageKey);

      const validKey = items.find((tab) => tab.key === savedKey)
        ? savedKey
        : items[0].key;

      setActiveKey(validKey);
    }
  }, [items]);

  const handleChange = (key) => {
    setActiveKey(key);
    localStorage.setItem(storageKey, key);
  };

  return (
    <Tabs
      type="card"
      prefixCls="tabsContent"
      centered
      items={items}
      tabBarExtraContent={tabBarExtraContent}
      destroyOnHidden
      activeKey={activeKey}
      onChange={handleChange}
    />
  );
};

export default GlobalTabs;
