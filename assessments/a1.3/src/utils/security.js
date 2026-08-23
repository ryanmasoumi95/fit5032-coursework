export function containsUnsafeMarkup(value) {
  return /[<>]/.test(String(value))
}

export function cleanPlainText(value, maxLength = 500) {
  return String(value)
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength)
}