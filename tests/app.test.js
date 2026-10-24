import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { esc, daysDiff, parseMbox, parseGeminiJson, badgeHtml } from '../src/helpers.js';

describe('1. Security & Sanitization (XSS Prevention)', () => {
  it('should escape HTML tags and dangerous characters', () => {
    const malicious = '<script>alert("XSS")</script>';
    const sanitized = esc(malicious);
    assert.strictEqual(sanitized, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    assert.ok(!sanitized.includes('<script>'));
  });

  it('should safely handle single quotes, ampersands, and null/undefined values', () => {
    assert.strictEqual(esc("Tom's & Jerry's"), "Tom&#39;s &amp; Jerry&#39;s");
    assert.strictEqual(esc(null), '');
    assert.strictEqual(esc(undefined), '');
    assert.strictEqual(esc(123), '123');
  });
});

describe('2. Date Difference & 7-Day Follow-Up Automation', () => {
  const refDate = new Date('2024-06-11T00:00:00Z');

  it('should calculate 0 days for current or future dates', () => {
    assert.strictEqual(daysDiff('2024-06-11', refDate), 0);
    assert.strictEqual(daysDiff('2024-06-15', refDate), 0);
  });

  it('should correctly calculate exact elapsed days', () => {
    assert.strictEqual(daysDiff('2024-06-04', refDate), 7);
    assert.strictEqual(daysDiff('2024-05-28', refDate), 14);
    assert.strictEqual(daysDiff('2024-06-01', refDate), 10);
  });

  it('should correctly evaluate 7-day follow-up threshold', () => {
    const isFollowupNeeded = (dateStr) => daysDiff(dateStr, refDate) > 7;
    assert.strictEqual(isFollowupNeeded('2024-06-05'), false); // 6 days ago -> no follow-up
    assert.strictEqual(isFollowupNeeded('2024-06-01'), true);  // 10 days ago -> follow-up required!
    assert.strictEqual(isFollowupNeeded('2024-05-28'), true);  // 14 days ago -> follow-up required!
  });

  it('should gracefully handle invalid date strings', () => {
    assert.strictEqual(daysDiff('invalid-date', refDate), 0);
    assert.strictEqual(daysDiff('', refDate), 0);
  });
});

describe('3. .mbox Email Archive Parser', () => {
  it('should parse standard RFC-822 .mbox chunks into structured objects', () => {
    const rawMbox = `From recruiter@company.com Mon Jun 03 10:00:00 2024
From: recruiter@company.com
Subject: Interview Invitation - Frontend Engineer
Date: 2024-06-03

Hi Rahul, we are excited to invite you for Round 1 technical interview.

From fake.recruiter@gmail.com Wed Jun 05 11:30:00 2024
From: fake.recruiter@gmail.com
Subject: Job Offer - Deposit Fee Required
Date: 2024-06-05

Please deposit Rs 3,000 for ID verification.`;

    const parsed = parseMbox(rawMbox);
    assert.strictEqual(parsed.length, 2);
    assert.strictEqual(parsed[0].id, 1);
    assert.strictEqual(parsed[0].from, 'recruiter@company.com');
    assert.strictEqual(parsed[0].subject, 'Interview Invitation - Frontend Engineer');
    assert.strictEqual(parsed[0].date, '2024-06-03');
    assert.ok(parsed[0].body.includes('invite you for Round 1'));

    assert.strictEqual(parsed[1].id, 2);
    assert.strictEqual(parsed[1].from, 'fake.recruiter@gmail.com');
    assert.ok(parsed[1].body.includes('Rs 3,000'));
  });

  it('should handle empty or malformed .mbox input gracefully', () => {
    assert.deepStrictEqual(parseMbox(''), []);
    assert.deepStrictEqual(parseMbox(null), []);
  });
});

describe('4. LLM JSON Resilience & Error Recovery', () => {
  it('should parse clean JSON array output from Gemini', () => {
    const cleanJson = JSON.stringify([
      { id: 1, company: 'Flipkart', status: 'applied', scam: false, needs_followup: true }
    ]);
    const parsed = parseGeminiJson(cleanJson);
    assert.strictEqual(parsed.length, 1);
    assert.strictEqual(parsed[0].company, 'Flipkart');
  });

  it('should strip markdown code fences (` ```json `)', () => {
    const rawMarkdown = `\`\`\`json
[
  { "id": 1, "company": "Amazon", "status": "interview", "scam": false }
]
\`\`\``;
    const parsed = parseGeminiJson(rawMarkdown);
    assert.strictEqual(parsed.length, 1);
    assert.strictEqual(parsed[0].company, 'Amazon');
  });

  it('should recover individual JSON objects if outer array is corrupt or truncated', () => {
    const messyOutput = `Here is the classified response:
    [
      { "id": 1, "company": "Swiggy", "status": "offer", "scam": false },
      { "id": 2, "company": "Fake Wipro", "status": "scam", "scam_reasons": "Laptop deposit fee required" }
    ]
    Hope this helps!`;

    const parsed = parseGeminiJson(messyOutput);
    assert.strictEqual(parsed.length, 2);
    assert.strictEqual(parsed[0].company, 'Swiggy');
    assert.strictEqual(parsed[1].scam_reasons, 'Laptop deposit fee required');
  });

  it('should throw clear error on empty or unparseable input', () => {
    assert.throws(() => parseGeminiJson(''), /Received empty response/);
    assert.throws(() => parseGeminiJson('Random non-json text without braces'), /Failed to parse/);
  });
});

describe('5. UI Badge & Accessibility Verification', () => {
  it('should produce correct badge markup for all 5 lifecycle statuses', () => {
    assert.ok(badgeHtml('applied').includes('badge-applied'));
    assert.ok(badgeHtml('interview').includes('badge-interview'));
    assert.ok(badgeHtml('offer').includes('badge-offer'));
    assert.ok(badgeHtml('rejected').includes('badge-rejected'));
    assert.ok(badgeHtml('scam').includes('badge-scam'));
  });

  it('should fallback gracefully for unexpected status strings', () => {
    const fallback = badgeHtml('pending_review');
    assert.ok(fallback.includes('badge-applied'));
    assert.ok(fallback.includes('pending_review'));
  });
});

describe('6. Heuristic Scam Pattern Verification', () => {
  const scamDetector = (body, from) => {
    const redFlags = [];
    const text = (body + ' ' + from).toLowerCase();

    if (text.includes('registration fee') || text.includes('security deposit') || text.includes('processing fee') || text.includes('training fee')) {
      redFlags.push('Fee demand detected');
    }
    if (text.includes('aadhaar') || text.includes('pan card') || text.includes('bank details') || text.includes('ifsc')) {
      redFlags.push('Sensitive identity document phishing');
    }
    if ((from.includes('@gmail.com') || from.includes('@outlook.com')) && (text.includes('wipro') || text.includes('accenture') || text.includes('google'))) {
      redFlags.push('Enterprise domain impersonation');
    }
    if (text.includes('50,000/day') || text.includes('no experience') && text.includes('upi')) {
      redFlags.push('Unrealistic salary lure paired with urgent payment');
    }

    return {
      isScam: redFlags.length > 0,
      reasons: redFlags.join('; ')
    };
  };

  it('should detect fee demand scams', () => {
    const res = scamDetector('Deposit Rs 3,000 security deposit for laptop', 'hr@wipro-jobs.net');
    assert.strictEqual(res.isScam, true);
    assert.ok(res.reasons.includes('Fee demand'));
  });

  it('should detect Aadhaar/PAN phishing scams', () => {
    const res = scamDetector('Reply with your Aadhaar number and bank details to confirm seat', 'recruiter@gmail.com');
    assert.strictEqual(res.isScam, true);
    assert.ok(res.reasons.includes('Sensitive identity document phishing'));
  });

  it('should NOT flag legitimate recruitment emails', () => {
    const res = scamDetector('Thank you for applying to Flipkart for SDE-2. Your application ID is FK-123.', 'careers@flipkart.com');
    assert.strictEqual(res.isScam, false);
    assert.strictEqual(res.reasons, '');
  });
});
