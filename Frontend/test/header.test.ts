import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Header } from "../src/components/Header.tsx";

for (const isDarkMode of [false, true]) {
  test(`signed-out visitors can choose system, light or dark in ${isDarkMode ? "dark" : "light"} mode`, () => {
    const html = renderToStaticMarkup(React.createElement(Header, {
      activeTab: "explore",
      setActiveTab: () => {},
      isDarkMode,
      themePreference: "system",
      setThemePreference: () => {},
      isOffline: false,
      setIsOffline: () => {},
      searchQuery: "",
      setSearchQuery: () => {},
      unreadMessagesCount: 0,
      currentUser: null,
      onOpenAuth: () => {},
      onLogout: () => {},
    }));
    assert.match(html, /<button[^>]*aria-label="Appearance"/);
    assert.match(html, /<input(?=[^>]*type="radio")(?=[^>]*value="system")(?=[^>]*checked="")[^>]*>/);
    assert.match(html, /type="radio"[^>]*value="light"/);
    assert.match(html, /type="radio"[^>]*value="dark"/);
    assert.doesNotMatch(html, /<select/);
    assert.match(html, /Sign In/);
  });
}
