/**
 * @param {number} value - temperature in celsius
 * @param {'C'|'F'} unit
 * @returns {string}
 */
export const formatTemperature = (value, unit = 'C') => {
  if (unit === 'F') {
    const f = (value * 9) / 5 + 32
    return `${Math.round(f)} °F`
  }
  return `${Math.round(value)} °C`
}

/**
 * @param {number} speed - wind speed in m/s
 * @returns {string}
 */
export const formatWindSpeed = (speed) => `${speed.toFixed(1)} m/s`

/**
 * @param {number} degrees - wind direction in degrees
 * @returns {string}
 */
export const formatWindDirection = (degrees) => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(degrees / 45) % 8]
}

/**
 * @param {string} isoDate
 * @returns {string}
 */
export const formatTime = (isoDate) =>
  new Date(isoDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
