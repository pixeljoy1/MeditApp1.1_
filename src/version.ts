/** App build version. `build` increments on every local build (see scripts/bump-version.mjs). */
import buildInfo from './buildInfo.json'

export const BUILD = buildInfo.build
/** Display string: v1.00, v1.01, … */
export const APP_VERSION = `v1.${String(BUILD).padStart(2, '0')}`
