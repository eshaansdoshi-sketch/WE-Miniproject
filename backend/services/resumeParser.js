const pdfParse = require('pdf-parse');

/**
 * Extract plain text from a PDF buffer.
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text || '';
}

module.exports = { extractTextFromPDF };
