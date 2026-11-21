import React, { useState } from "react";

/** Keep section switches directional without remounting their parent forms/state. */
export function SlidingPanel({ tab, order, children }: {
  tab: string; order: readonly string[]; children: React.ReactNode;
}) {
  const [navigation, setNavigation] = useState({ tab, direction: 0 });
  if (navigation.tab !== tab) {
    const from = order.indexOf(navigation.tab);
    const to = order.indexOf(tab);
    setNavigation({ tab, direction: from < 0 || to < 0 ? 0 : Math.sign(to - from) });
  }
  return <div key={tab} className="tab-content-slide" data-slide-direction={navigation.direction}>{children}</div>;
}
