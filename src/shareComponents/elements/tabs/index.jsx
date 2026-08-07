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
      // Unmount inactive panes instead of leaving them running hidden —
      // each pane (Live Rates, Forwards, Rate Sheet, T24, etc.) holds a
      // live MQTT subscription + real-time update loop, and keeping every
      // previously-visited tab alive in the background compounds CPU/
      // dispatch load the longer a session runs. Every pane already
      // re-fetches its own data on mount, so this is safe.
      destroyOnHidden={true}
      activeKey={activeKey}
      onChange={handleChange} // ✅ always use internal handler
    />
  );
};

export default GlobalTabs;
