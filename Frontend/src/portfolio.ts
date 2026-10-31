/** Default-on prototype. Disabling this is not publication/legal clearance. */
export const PORTFOLIO_MODE = import.meta.env.VITE_PORTFOLIO_MODE !== "false";
export const portfolioStorageKey = PORTFOLIO_MODE
  ? "tara_sibale_portfolio_state"
  : "tara_sibale_guest_state";
