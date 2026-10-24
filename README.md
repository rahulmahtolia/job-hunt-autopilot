# 🎯 Job Hunt Autopilot

> **Hackathon build — Google AI Stack**  
> Classifies a job-seeker's inbox using Gemini, flags scams in red, and surfaces follow-up reminders.

## Stack
- **Gemini 2.0 Flash** via Google AI Studio API (browser-direct, no backend)
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
1. User enters Google AI Studio API key
2. All 20 emails are sent to Gemini in a single batch prompt
3. Gemini returns structured JSON: status + scam flag + reasons + follow-up flag
4. Dashboard renders: stat cards, scam alert panel, filterable table

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

## Sample inbox
20 pre-loaded realistic emails covering all 5 categories including 4 scams.
Swap out `INBOX` in the JS with a real `.mbox` parser or Firebase Firestore collection to go live.
