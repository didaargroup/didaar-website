/**
 * Detects if text is primarily RTL (Right-to-Left)
 * Uses the Unicode Bidirectional Algorithm
 *
 * @param text - The text to analyze
 * @returns true if text is primarily RTL, false otherwise
 */
export function isTextRTL(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }

  // Remove HTML tags for analysis
  const plainText = text.replace(/<[^>]*>/g, "").trim();

  if (plainText.length === 0) {
    return false;
  }

  // RTL character ranges (Arabic, Hebrew, Persian, Urdu, etc.)
  const rtlRanges = [
    [0x0591, 0x07FF], // Hebrew, Arabic, Syriac
    [0xFB1D, 0xFDFD], // Hebrew and Arabic presentation forms
    [0xFE70, 0xFEFC], // Arabic presentation forms-B
  ];

  // LTR character ranges (Latin, Greek, Cyrillic, etc.)
  const ltrRanges = [
    [0x0000, 0x007F], // Basic Latin
    [0x0080, 0x00FF], // Latin-1 Supplement
    [0x0100, 0x017F], // Latin Extended-A
    [0x0180, 0x024F], // Latin Extended-B
    [0x0370, 0x03FF], // Greek and Coptic
    [0x0400, 0x04FF], // Cyrillic
  ];

  let rtlCount = 0;
  let ltrCount = 0;

  for (let i = 0; i < plainText.length; i++) {
    const code = plainText.charCodeAt(i);

    // Check if character is in RTL range
    const isRTLChar = rtlRanges.some(([start, end]) => code >= start && code <= end);
    if (isRTLChar) {
      rtlCount++;
      continue;
    }

    // Check if character is in LTR range
    const isLTRChar = ltrRanges.some(([start, end]) => code >= start && code <= end);
    if (isLTRChar) {
      ltrCount++;
    }
  }

  // If we have more RTL characters than LTR, it's RTL text
  // Also consider it RTL if we have significant RTL characters (more than 30% of total)
  const totalStrongChars = rtlCount + ltrCount;
  if (totalStrongChars === 0) {
    return false;
  }

  const rtlRatio = rtlCount / totalStrongChars;

  // Consider RTL if more than 30% of characters are RTL
  return rtlRatio > 0.3;
}

/**
 * Detects the direction of text and returns 'rtl' or 'ltr'
 *
 * @param text - The text to analyze
 * @returns 'rtl' or 'ltr'
 */
export function getTextDirection(text: string): "rtl" | "ltr" {
  return isTextRTL(text) ? "rtl" : "ltr";
}
