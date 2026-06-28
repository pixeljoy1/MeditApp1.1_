/**
 * Build-version bumper. Increments src/buildInfo.json on every local build so the
 * in-app version pill ticks up: v1.00, v1.01, v1.02, …
 *
 * Skipped on CI (process.env.CI) so continuous deploys publish exactly the
 * committed build number — the dev's local `npm run build` is the source of the
 * increment, then the bumped file is committed and pushed.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const file = join(here, '..', 'src', 'buildInfo.json')

if (process.env.CI) {
  const { build } = JSON.parse(readFileSync(file, 'utf8'))
  console.log(`[version] CI build — using committed build ${build} (no bump)`)
  process.exit(0)
}

const data = JSON.parse(readFileSync(file, 'utf8'))
data.build = (data.build ?? 0) + 1
writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
const minor = String(data.build).padStart(2, '0')
console.log(`[version] bumped to v1.${minor} (build ${data.build})`)
