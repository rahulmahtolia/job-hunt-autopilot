# 🎯 Job Hunt Autopilot

> **Track every application. Catch every fake offer.**  
> An intelligent, single-pipeline assistant designed for post-layoff high-volume job hunts. Automatically classifies inbox emails into tracking stages, catches fraudulent fee/phishing offers in red with explicit reasoning, and automates 7-day follow-up reminders with zero backend.

🌐 **Live Demo:** [https://job-hunt-autopilot-f7a67.web.app](https://job-hunt-autopilot-f7a67.web.app)  
📁 **Repository:** [https://github.com/rahulmahtolia/job-hunt-autopilot](https://github.com/rahulmahtolia/job-hunt-autopilot)

---

## 1. Challenge Vertical & Persona
- **Chosen Vertical:** `02 · AUTOMATION` — *Job Hunt Autopilot*
- **Target Persona:** High-volume job seekers after a layoff applying to 100+ roles who lose track of application stages, miss critical interview invites, forget follow-ups, and face dangerous employment scams asking for registration fees, laptop deposits, or identity documents.

---

## 2. Approach & Architecture

### Single-Pipeline Design
Rather than chaining multiple slow and costly LLM calls, **Job Hunt Autopilot** uses a single-pass Gemini inference pipeline. In one round-trip API call, Gemini:
1. Extracts company and job role.
2. Classifies status into `applied`, `interview`, `offer`, `rejected`, or `scam`.
3. Detects red-flag signals (scam indicators derived from Kaggle & Hugging Face datasets) and produces explicit warning reasons.
4. Generates a 1-sentence concise summary.
5. Computes follow-up necessity based on the 7-day silence rule.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SINGLE PIPELINE ARCHITECTURE                          │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │
                  ┌────────────────────▼────────────────────┐
                  │   Inbox Intake (Sample / JSON / .mbox)  │
                  └────────────────────┬────────────────────┘
                                       │
                  ┌────────────────────▼────────────────────┐
                  │     Gemini 3.8 Flash (Structured JSON)  │
                  └────────────────────┬────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌──────────────────┐         ┌───────────────────┐         ┌────────────────────┐
│ Status Tracking  │         │ 🚨 Red Scam Panel │         │ ⏰ 7-Day Follow-Up │
│ Applied/Interview│         │ & Fraud Warnings  │         │ Badges & Reminders │
│ /Offer/Rejected  │         │  (With Reasons)   │         │                    │
└──────────────────┘         └───────────────────┘         └────────────────────┘
```

---

## 3. How the Solution Works

1. **Intake & Ingestion:**
   - Pre-loaded with **20 realistic sample emails** covering all 5 categories.
   - Built-in client-side **JSON & `.mbox` parser** (`handleFileUpload`, `parseMbox`) allowing users to drag and drop custom exports without third-party servers.
2. **AI Classification:**
   - Batches email metadata into a single prompt sent to `gemini-3.8-flash` with `responseMimeType: 'application/json'` and `temperature: 0.1` for deterministic, RFC-compliant JSON.
3. **Scam Detection Heuristics:**
   - **Financial Red Flags:** Demands for registration fees, laptop/ID security deposits, or background check charges.
   - **Identity Phishing:** Requests for Aadhaar, PAN card, or bank account IFSC numbers.
   - **Domain Spoofing:** Free webmail providers (`@gmail.com`, `@outlook.com`, `@wipro-global-jobs.net`) pretending to represent enterprises.
   - **Hinglish / Spam:** Unrealistic salary promises ("₹50,000/day, no experience") with high-pressure UPI payment deadlines.
4. **Follow-Up Automation:**
   - Applications marked `applied` with silence > 7 days relative to the dataset reference date receive a prominent **⏰ Follow up now** badge and dedicated filter tab.
5. **Interactive Dashboard:**
   - Top metric stat cards, scam alert summary panel, category filter tabs, real-time keyword search, and responsive data table.

---

## 4. Key Assumptions Made

1. **Zero-Backend Privacy Model:** Job seekers' emails contain sensitive personal information. All processing is kept client-side with zero persistence or telemetry to guarantee 100% privacy.
2. **7-Day Follow-Up Rule:** Industry benchmark where job applications in `applied` status without recruiter response after 7 days warrant a polite follow-up.
3. **Dynamic Reference Date:** For custom uploaded files, the reference date dynamically infers the latest email timestamp (+1 day) to accurately calculate 7-day follow-ups across any historical dataset.

---

## 5. Evaluation Focus Areas Alignment

### 🛡️ Security & Responsible AI
- **XSS Sanitization:** All LLM outputs and user strings pass through `esc()` HTML entity escaping before injection into the DOM.
- **Credential Safety:** API keys are held purely in transient browser memory, never saved to `localStorage`, `cookies`, or external servers.
- **Scam Protection:** Proactively protects vulnerable candidates from financial and identity fraud with explicit `DO NOT RESPOND` warnings.

### ⚡ Code Quality & Maintainability
- Clean, vanilla ES6+ JavaScript with zero build steps or external dependencies.
- Modular architecture with dedicated parsers, state managers, and renderers.
- Self-healing JSON parser (`parseGeminiJson`) with regex fallback to handle network edge cases.

### 🚀 Efficiency & Resource Optimization
- Single-batch prompt reduces LLM API calls by **~95%** compared to per-email processing.
- Repository footprint is **< 150 KB** (strict compliance with the < 10 MB limit).
- Instant DOM re-rendering with zero lag even with filtering and live search.

### 🧪 Testing & Validation
- **5 Category Test Matrix:** Built-in test suite containing real tech companies (Flipkart, Swiggy, Amazon, PhonePe, CRED, Nykaa, TCS, Zepto) and 4 diverse scam patterns.
- **Format Testing:** Validated with standard JSON schemas and RFC-822 `.mbox` raw email formats.

### ♿ Accessibility & Usability (WCAG)
- Keyboard navigable controls and filter tabs with proper ARIA attributes (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-label`).
- High-contrast, dark-mode color scheme meeting WCAG AA standards.
- Real-time live search to find applications by company, role, or keywords instantly.

---

## 6. How to Run & Deploy

### Run Locally
```bash
# Just open index.html in any modern browser
open index.html
```

### Deploy to Firebase Hosting
```bash
firebase deploy
```

---

## 7. Submission Checklist
- [x] Public GitHub repository with single `main` branch.
- [x] Repository size < 10 MB (current size: ~150 KB).
- [x] Clear layoff problem alignment with single-pass pipeline.
- [x] Fully functioning self-updating tracker, scam detection in red, and 7-day follow-up reminders.
- [x] Live Firebase Hosting URL deployed and active.
