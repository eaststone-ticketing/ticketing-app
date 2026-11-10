/** Convert stored mm → display cm */
export function mmToCm(mm) {
  return mm / 10
}

/** Convert input cm → stored mm */
export function cmToMm(cm) {
  return Math.round(Number(cm) * 10)
}
