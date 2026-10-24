/**
 * Job Hunt Autopilot - Core Utilities & Parsers
 * Pure vanilla ES module with zero external dependencies
 */

/**
 * Escapes unsafe HTML characters to prevent XSS attacks.
 * @param {string|any} s - Input string
 * @returns {string} Sanitized string
 */
export function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Calculates days elapsed between an email date and a reference date.
 * @param {string} dateStr - Email ISO date (YYYY-MM-DD)
 * @param {Date} [referenceDate] - Reference date (defaults to 2024-06-11)
 * @returns {number} Days elapsed (>= 0)
 */
export function daysDiff(dateStr, referenceDate = new Date('2024-06-11')) {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return 0;
  const diff = Math.floor((referenceDate - target) / 86400000);
  return diff >= 0 ? diff : 0;
}

/**
 * Parses raw .mbox file text into an array of structured email objects.
 * @param {string} rawText - Raw .mbox contents
 * @returns {Array<{id: number, from: string, subject: string, date: string, body: string}>}
 */
export function parseMbox(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];
  const rawEmails = rawText.split(/(?:^|\n)(?=From [^\r\n]+)/);
  const emails = [];

  rawEmails.forEach((chunk, index) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;

    const lines = trimmed.split(/\r?\n/);
    let from = 'unknown@domain.com';
    let subject = 'No Subject';
    let date = '';
    let bodyLines = [];
    let inHeaders = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (inHeaders && line.trim() === '') {
        inHeaders = false;
        continue;
      }
      if (inHeaders) {
        if (/^From:/i.test(line)) from = line.replace(/^From:\s*/i, '').trim();
        else if (/^Subject:/i.test(line)) subject = line.replace(/^Subject:\s*/i, '').trim();
        else if (/^Date:/i.test(line)) {
          const rawDate = line.replace(/^Date:\s*/i, '').trim();
          const parsedD = new Date(rawDate);
          date = !isNaN(parsedD.getTime()) ? parsedD.toISOString().slice(0, 10) : rawDate.slice(0, 10);
        }
      } else {
        bodyLines.push(line);
      }
    }

    emails.push({
      id: index + 1,
      from,
      subject,
      date: date || new Date().toISOString().slice(0, 10),
      body: bodyLines.join('\n').trim()
    });
  });

  return emails;
}

/**
 * Resilient JSON parser for LLM responses with markdown stripping & bracket extraction.
 * @param {string} raw - Raw LLM response string
 * @returns {Array<object>} Array of parsed objects
 */
export function parseGeminiJson(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Received empty response from Gemini.');
  }

  // 1. Strip markdown code fences
  let cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  // 2. Extract content between first '[' and last ']'
  const startIdx = cleaned.indexOf('[');
  const endIdx = cleaned.lastIndexOf(']');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  // 3. Standard JSON parse
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') return [parsed];
  } catch (e1) {
    // 4. Fallback: Extract individual {...} JSON objects using regex
    const objectRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
    const matches = cleaned.match(objectRegex);
    if (matches && matches.length > 0) {
      const recovered = [];
      for (const m of matches) {
        try {
          recovered.push(JSON.parse(m));
        } catch (_) {}
      }
      if (recovered.length > 0) return recovered;
    }
    throw new Error('Failed to parse Gemini response as JSON: ' + e1.message);
  }

  return [];
}

/**
 * Generates badge HTML markup for a given status.
 * @param {string} status
 * @returns {string} HTML markup
 */
export function badgeHtml(status) {
  const map = {
    applied:   ['badge-applied',   '📨 Applied'],
    interview: ['badge-interview', '📅 Interview'],
    offer:     ['badge-offer',     '🎉 Offer'],
    rejected:  ['badge-rejected',  '✖ Rejected'],
    scam:      ['badge-scam',      '🚨 Scam'],
  };
  const [cls, label] = map[status] || ['badge-applied', status || 'Unknown'];
  return `<span class="badge ${cls}">${label}</span>`;
}
