# 🎯 Job Hunt Autopilot

> **Track every application. Catch every fake offer.**
> Built for post-layoff job hunts: classifies inboxes into tracking stages, catches fraudulent fee/phishing offers in red, and automates 7-day follow-up reminders.

## Stack
- **Gemini 3.8 Flash** (`gemini-3.8-flash`) via Google AI Studio API (browser-direct, no backend)
- **Firebase Hosting** (optional, one command deploy)
- Pure HTML/CSS/JS — zero npm, zero build step

## Run locally
Just open `index.html` in any browser. No server needed.

## Deploy to Firebase Hosting (60 seconds)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # public dir = . (current dir), single-page = no
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
