import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor wraps the built web app (dist/) in an Android WebView so it can be
 * packaged as an installable .apk. The android/ project is generated in CI.
 */
const config: CapacitorConfig = {
  appId: 'net.wizardcomm.drift',
  appName: 'Drift',
  webDir: 'dist',
  backgroundColor: '#080810',
}

export default config
