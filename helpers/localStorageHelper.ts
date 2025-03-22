/**
 * The function checks if localStorage is available.
 *
 * @returns boolean
 */
export const isLocalStorageAvailable = (): boolean => {
  if (typeof window !== 'undefined') {
    if (window.localStorage) {
      try {
        const testKey = 'testKey'
        const testValue = 'testValue'
        window.localStorage.setItem(testKey, testValue)
        const result = window.localStorage.getItem(testKey)
        if (result === testValue) {
          window.localStorage.removeItem(testKey)
          return true
        }
      } catch (e) {
        return false
      }
    }
    return false
  }
  return false
}

/**
 * The function get properties from localStorage.
 *
 * @param key: string // property name
 * @returns property
 */
export const getFromLocalStorage = (key: string) => {
  if (isLocalStorageAvailable()) {
    const localObject = JSON.parse(localStorage.getItem(key) || '{}')
    return localObject
  }
}
