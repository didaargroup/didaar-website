/**
 * Detects if text contains RTL (right-to-left) characters
 * Supports Persian, Arabic, and Hebrew scripts
 *
 * @param text - The text to check
 * @returns true if the text contains RTL characters
 */
export function isRTLText(text: string): boolean {
  if (!text) return false;
  
  // Unicode ranges for RTL languages:
  // Arabic: \u0600-\u06FF
  // Arabic Supplement: \u0750-\u077F
  // Arabic Extended-A: \u08A0-\u08FF
  // Arabic Presentation Forms: \uFB50-\uFDFF, \uFE70-\uFEFF
  // Hebrew: \u0590-\u05FF
  const rtlPattern = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  
  return rtlPattern.test(text);
}

/**
 * Gets the text direction for a given text
 *
 * @param text - The text to check
 * @returns "rtl" or "ltr"
 */
export function getTextDirection(text: string): "rtl" | "ltr" {
  return isRTLText(text) ? "rtl" : "ltr";
}

/**
 * Gets the text direction for a locale
 *
 * @param locale - The locale code (e.g., "en", "fa")
 * @returns "rtl" or "ltr"
 */
export function getLocaleDirection(locale: string): "rtl" | "ltr" {
  // List of RTL locales
  const rtlLocales = ["fa", "ar", "he", "ur", "ps", "sd", "yi"];
  
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}
