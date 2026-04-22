// ─── useRazorpay Hook ─────────────────────────────────────────────────────────
// Dynamically loads the Razorpay checkout.js script on demand.
// Returns an `openRazorpay(options)` function that opens the branded modal.
//
// ── UPI App Buttons (Google Pay, PhonePe etc.) ────────────────────────────────
// These only appear on Android mobile browsers — Razorpay needs UPI intent
// support which desktop browsers (Windows/macOS/Linux) don't have.
// On desktop, Razorpay correctly falls back to showing the UPI QR code.
// Your dashboard preview shows the mobile layout — this is expected behaviour.

import { useCallback } from 'react';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

// Theme colour — matches Razorpay dashboard Checkout Styling #DD5625
const BRAND_COLOR = '#DD5625';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script  = document.createElement('script');
    script.src    = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const useRazorpay = () => {
  const openRazorpay = useCallback(async ({
    keyId,
    razorpayOrderId,
    amountPaise,
    currency    = 'INR',
    userName,
    userEmail,
    userPhone,
    description,
    onSuccess,
    onFailure,
  }) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      onFailure?.(new Error('Razorpay SDK failed to load. Check your internet connection.'));
      return;
    }

    const options = {
      // ── Credentials ──────────────────────────────────────────────────────
      key:      keyId,
      amount:   amountPaise,
      currency,
      order_id: razorpayOrderId,

      // ── Branding ─────────────────────────────────────────────────────────
      // Do NOT set `image` to a local path — Razorpay's iframe cannot load
      // localhost files. Leave it undefined and Razorpay will use the logo
      // you configured in Dashboard → Account & Settings → Checkout Styling.
      name:        'Narmavya',
      description: description || 'Authentic MP Products',

      // ── Theme — must match Dashboard Checkout Styling background colour ───
      theme: {
        color:          BRAND_COLOR,   // #DD5625 — Narmavya orange
        backdrop_color: 'rgba(0,0,0,0.65)',
      },

      // ── Pre-fill ─────────────────────────────────────────────────────────
      prefill: {
        name:    userName  || '',
        email:   userEmail || '',
        contact: userPhone || '',   // E.164 format, e.g. "9876543210"
      },

      // ── Notes (visible in Razorpay dashboard) ────────────────────────────
      notes: { platform: 'Narmavya — Authentic MP Products' },

      // ── Modal ────────────────────────────────────────────────────────────
      modal: {
        ondismiss:     () => onFailure?.(new Error('Payment cancelled by user')),
        animation:     true,
        confirm_close: false,
        escape:        true,
      },

      // ── Success handler ───────────────────────────────────────────────────
      handler: (response) => {
        onSuccess?.({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId:   response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        });
      },

      // ── NO custom config block ────────────────────────────────────────────
      // Razorpay automatically shows all payment methods (UPI, Cards, EMI,
      // Netbanking, Wallets, Pay Later) using the dashboard configuration.
      // Adding a custom config.display block here duplicates the sections.
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', (response) => {
      onFailure?.(new Error(response.error?.description || 'Payment failed'));
    });

    rzp.open();
  }, []);

  return openRazorpay;
};

export default useRazorpay;
