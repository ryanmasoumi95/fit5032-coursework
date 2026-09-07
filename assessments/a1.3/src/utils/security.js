export function containsUnsafeMarkup(value) {
  return /[<>]/.test(value)
}