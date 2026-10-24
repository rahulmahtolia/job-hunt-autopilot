# 🎯 Job Hunt Autopilot

> **Track every application. Catch every fake offer.**
> Built for post-layoff job hunts: classifies inboxes into tracking stages, catches fraudulent fee/phishing offers in red, and automates 7-day follow-up reminders.

🌐 **Live Demo:** [https://job-hunt-autopilot-f7a67.web.app](https://job-hunt-autopilot-f7a67.web.app)

---

## ⚡ Key Highlights
- **Single-Pipeline Classification:** One-shot Gemini prompt categorizes applications (`applied`, `interview`, `offer`, `rejected`) and detects scams in one pass.
- **🚨 Red Scam Banners with Reasons:** Catches training fee requests, fake Google/Wipro job offers, and Aadhaar/PAN phishing with explicit red-flag reasoning.
- **⏰ 7-Day Follow-Up Reminders:** Automatically tags applications with silence >7 days with `⏰ Follow up now`.
- **Zero Backend / Complete Privacy:** Client-side only with no Gmail OAuth permissions needed. Upload `.json` or `.mbox` files directly.

---

## 🛠️ Stack
- **Gemini 3.8 Flash** (`gemini-3.8-flash`) via Google AI Studio API (browser-direct, no backend)
- **Firebase Hosting** for global CDN edge deployment
- Pure HTML/CSS/JS — zero npm, zero build step

---

## 🚀 Run Locally
Just open `index.html` in any browser. No server needed.

## ☁️ Deploy to Firebase Hosting
```bash
firebase deploy
```

## How it works
1. User enters Google AI Studio API key (or loads custom JSON / `.mbox` file).
2. Emails are sent to Gemini in a single classification pipeline prompt.
3. Gemini returns structured JSON: status (`applied`, `interview`, `rejected`, `offer`, `scam`) + scam red-flag reasons + follow-up triggers.
4. Dashboard renders: real-time stat cards, dedicated Scam Alert panel, and filterable table.

## Email statuses
| Status | Meaning |
|--------|---------|
| 📨 Applied | Acknowledgement received |
| 📅 Interview | Interview invited or scheduled |
| 🎉 Offer | Formal offer extended |
| ✖ Rejected | Rejection received |
| 🚨 Scam | Fee request / fake offer detected |

## Follow-up logic
Emails marked `applied` with no update after **7 days** get a ⏰ **Follow up now** badge.

## Scam detection signals Gemini looks for
- Requests for registration fee / security deposit / processing fee
- Asks for Aadhaar, PAN, or bank account details
- Gmail / Outlook sender impersonating a known company
- Unrealistic salary ("₹50,000/day, no experience")
- Urgency + payment deadline combo

## Sample inbox & Custom Input
- **Default Sample:** 20 pre-loaded realistic emails covering all 5 categories including 4 scams.
- **Custom Input:** Directly upload any `.json` or `.mbox` file via the UI without backend or Gmail login.
