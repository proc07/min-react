export function getCurrentTime() {
  return performance.now()
}

export function isArrary(obj: any) {
  return Array.isArray(obj)
}

export function isNum(obj: any) {
  return typeof obj === 'number'
}

export function isObject(obj: any) {
  return obj !== null && typeof obj === 'object'
}

export function isFn(obj: Function | null | undefined) {
  return typeof obj === 'function'
}

export function isString(obj: any) {
  return typeof obj === 'string'
}