import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Header } from "../src/components/Header.tsx";

for (const isDarkMode of [false, true]) {
  test(`signed-out visitors can access the theme button in ${isDarkMode ? "dark" : "light"} mode`, () => {
    const html = renderToStaticMarkup(React.createElement(Header, {
      activeTab: "explore",
      setActiveTab: () => {},
      isDarkMode,
      setIsDarkMode: () => {},
      isOffline: false,
      setIsOffline: () => {},
      searchQuery: "",
      setSearchQuery: () => {},
      unreadMessagesCount: 0,
      currentUser: null,
      onOpenAuth: () => {},
      onLogout: () => {},
    }));
    assert.match(html, /<button[^>]*aria-label="Toggle dark mode"/);
    assert.match(html, new RegExp(`aria-pressed="${isDarkMode}"`));
    assert.match(html, /Sign In/);
  });
}
