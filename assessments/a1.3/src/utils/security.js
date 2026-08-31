// Detect HTML-style markup in fields that should contain plain text only.
export function containsUnsafeMarkup(value) {
  return /[<>]/.test(String(value))
}

// Remove control characters, trim whitespace and enforce a maximum input length.
export function cleanPlainText(value, maxLength = 500) {
  return String(value)
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength)
}