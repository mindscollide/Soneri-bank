import { Tabs } from "antd";
import React, { useEffect, useState } from "react";
import "./tabs.css";

const GlobalTabs = ({ items = [], tabBarExtraContent, onChange }) => {
  // ✅ accept onChange prop
  const storageKey = "globalTabsActiveKey";

  const readSaved = () => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };

  // Restore the saved tab immediately (refresh keeps the user on the same tab)
  const [activeKey, setActiveKey] = useState(() => {
    const savedKey = readSaved();
    return items.find((tab) => tab.key === savedKey) ? savedKey : items[0]?.key ?? 0;
  });

  // Only re-validate when the set of tabs changes, not on every render
  const itemKeys = items.map((tab) => tab.key).join(",");

  // Set initial tab when items load
  useEffect(() => {
    if (items.length > 0) {
      const savedKey = readSaved();

      const validKey = items.find((tab) => tab.key === savedKey)
        ? savedKey
        : items[0].key;

      setActiveKey(validKey);
      onChange?.(validKey); // ✅ sync parent on initial load too
    }
  }, [itemKeys]);

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

      activeKey={activeKey}
      onChange={handleChange} // ✅ always use internal handler
    />
  );
};

export default GlobalTabs;
