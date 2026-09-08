// Report fields are plain text, so angle-bracket markup is rejected.
export function containsUnsafeMarkup(value) {
  return /[<>]/.test(value)
}