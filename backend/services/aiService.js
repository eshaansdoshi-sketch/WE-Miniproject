const axios = require('axios');

const AI_BASE = process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1';
const AI_KEY  = process.env.AI_API_KEY  || '';
const MODEL   = 'arcee-ai/trinity-large-preview:free';

/**
 * Call OpenRouter chat completions.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {number} temperature
 * @param {number} timeoutMs
 * @returns {Promise<string>} raw content string
 */
async function callAI(systemPrompt, userPrompt, temperature = 0.3, timeoutMs = 60000) {
  const response = await axios.post(
    `${AI_BASE}/chat/completions`,
    {
      model: MODEL,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${AI_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: timeoutMs,
    }
  );
  return response.data.choices[0].message.content;
}

/**
 * Parse AI response — strips markdown code fences, returns parsed JSON.
 */
function parseJSON(raw) {
  let s = raw.trim();
  if (s.startsWith('```json')) s = s.slice(7);
  if (s.startsWith('```'))     s = s.slice(3);
  if (s.endsWith('```'))       s = s.slice(0, -3);
  return JSON.parse(s.trim());
}

module.exports = { callAI, parseJSON };
