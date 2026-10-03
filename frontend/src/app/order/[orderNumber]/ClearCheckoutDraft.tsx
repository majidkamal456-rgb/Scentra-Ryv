"use client";

import { useEffect } from "react";

/** Clear the saved checkout draft after a successful order (mirrors order_confirmation.html). */
export function ClearCheckoutDraft() {
  useEffect(() => {
    try {
      localStorage.removeItem("scentra_checkout_draft");
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
