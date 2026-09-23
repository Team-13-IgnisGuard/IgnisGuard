// Loads Razorpay's real checkout.js script once, then opens the real payment
// widget for a given order. This replaces the previous custom-built Card/UPI/
// Netbanking/Wallet tabs — Razorpay's own widget already provides all of
// these methods natively, styled and validated by Razorpay itself.

let scriptLoadingPromise = null;

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load the Razorpay checkout script. Check your internet connection.'));
    document.body.appendChild(script);
  });
  return scriptLoadingPromise;
}

/**
 * Opens Razorpay's real checkout widget for an already-created order.
 *
 * @param {Object} params
 * @param {string} params.keyId - Razorpay public Key ID (safe to expose to the browser)
 * @param {string} params.orderId - Real Razorpay order ID (from the backend)
 * @param {number} params.amountInPaise - Amount in paise (e.g. ₹950 = 95000)
 * @param {string} params.name - Merchant/brand name shown in the widget
 * @param {string} params.description - Shown in the widget (e.g. "Booking #12")
 * @param {Object} [params.prefill] - { name, email, contact } to prefill the form
 * @param {(response: {razorpay_payment_id, razorpay_order_id, razorpay_signature}) => void} params.onSuccess
 * @param {(reason: string) => void} params.onError - Called if the widget can't open at all
 * @param {() => void} [params.onDismiss] - Called if the user closes the widget without paying
 */
export async function openRazorpayCheckout({
  keyId, orderId, amountInPaise, name, description, prefill, onSuccess, onError, onDismiss,
}) {
  try {
    await loadRazorpayScript();
  } catch (err) {
    onError(err.message);
    return;
  }

  const razorpay = new window.Razorpay({
    key: keyId,
    amount: amountInPaise,
    currency: 'INR',
    order_id: orderId,
    name: name || 'LPG Cylinder Booking',
    description: description || '',
    prefill: prefill || {},
    theme: { color: '#ff5e36' },
    handler: (response) => onSuccess(response),
    modal: {
      ondismiss: () => {
        if (onDismiss) onDismiss();
      },
    },
  });

  razorpay.on('payment.failed', (response) => {
    onError(response?.error?.description || 'Payment failed. Please try again.');
  });

  razorpay.open();
}
