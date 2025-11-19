
# VistaIFS Website Upgrade – Onboarding + Leads + Chatbot

This package includes:
- Updated `/onboarding/index.html` with Bronze/Silver/Gold, QuickBooks plan selector, payroll add-on, and estimator.
- Lead-capture modal on home and onboarding.
- Chatbot (Tidio) embed slot.
- Config file at `assets/js/vista-config.js` to safely set keys without editing HTML.

## Configure before deploy
1. Open `assets/js/vista-config.js` and replace:
   - `window.VISTA_LEADS_WEBHOOK` with your Zapier Catch Hook or Amplify API endpoint.
   - `window.TIDIO_PUBLIC_KEY` with your Tidio public key.
   (Alternatively, you can set these as globals in Amplify’s build settings.)

2. Deploy with Amplify Hosting as usual.

