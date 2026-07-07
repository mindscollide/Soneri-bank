import { Tabs } from "antd";
import React, { useEffect, useState } from "react";
import "./tabs.css";

const GlobalTabs = ({ items = [], tabBarExtraContent, onChange }) => {
  // ✅ accept onChange prop
  const storageKey = "globalTabsActiveKey";

  const [activeKey, setActiveKey] = useState(0);

  // Set initial tab when items load
  useEffect(() => {
    if (items.length > 0) {
      const savedKey = localStorage.getItem(storageKey);

      const validKey = items.find((tab) => tab.key === savedKey)
        ? savedKey
        : items[0].key;

      setActiveKey(validKey);
      onChange?.(validKey); // ✅ sync parent on initial load too
    }
  }, [items]);

  const handleChange = (key) => {
    setActiveKey(key);
    localStorage.setItem(storageKey, key);
    onChange?.(key); // ✅ bubble up to parent (Treasury, Dealer, etc.)
  };

  return (
    <Tabs
      type="card"
      prefixCls="tabsContent"
      centered
      items={items}
      tabBarExtraContent={tabBarExtraContent}
      destroyOnHidden={false}
      activeKey={activeKey}
      onChange={handleChange} // ✅ always use internal handler
    />
  );
};

export default GlobalTabs;
