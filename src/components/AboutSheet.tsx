/**
 * AboutSheet — three distinct footer pages selected by `focus`:
 *   about   → what Drift is
 *   legal   → wellness disclaimer + privacy
 *   sources → texts, citations, typography, audio
 * Each renders its own title and content (not one shared page scrolled).
 */

import { Sheet } from './Sheet'
import { APP_VERSION } from '../version'

export type AboutFocus = 'about' | 'legal' | 'sources'

const TITLES: Record<AboutFocus, string> = {
  about: 'About Drift',
  legal: 'Legal',
  sources: 'Sources & Credits',
}

export function AboutSheet({ open, onClose, focus = 'about' }: { open: boolean; onClose: () => void; focus?: AboutFocus }) {
  return (
    <Sheet open={open} onClose={onClose} title={TITLES[focus]}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
        {focus === 'about' && (
          <>
            <Block title="What Drift is">
              Drift exists for one moment — when you put your phone down, close your eyes, and let go.
              No streaks, no noise, no engagement loops. It is made to be used, then forgotten.
            </Block>
            <Block title="How it works">
              Generative gradients and layered, calming audio are created live in your browser and
              ease you toward sleep. A sleep timer fades everything to silence on its own.
            </Block>
            <Block title="Notice">
              Drift is an independent web prototype built from the Drift product specification, crafted
              by Wizard Communications, Kolkata. All marks belong to their respective owners.
            </Block>
          </>
        )}

        {focus === 'legal' && (
          <>
            <Block title="Wellness disclaimer">
              Drift is a relaxation aid, not a medical device. It is not intended to diagnose, treat,
              cure, or prevent any condition, and is not a substitute for professional care for sleep
              disorders, anxiety, or any health concern. If sleep problems persist, please consult a
              qualified clinician. Do not use while driving or operating machinery.
            </Block>
            <Block title="Privacy">
              Your name, preferences, and theme requests are stored locally on this device. Submitting
              a theme request sends its contents to the developer by email (via FormSubmit). Nothing
              else is collected or shared.
            </Block>
          </>
        )}

        {focus === 'sources' && (
          <>
            <Block title="Texts &amp; citations">
              Chant subtitles are traditional, public-domain passages, reproduced with their sources:
              <ul style={list}>
                <li>Dhammapada, vv. 1, 5, 277 — Pāli Canon (public domain).</li>
                <li>Prajñāpāramitāhṛdaya (Heart Sūtra) mantra — traditional.</li>
                <li>Bṛhadāraṇyaka Upaniṣad 1.3.28 &amp; 1.4.10 — public domain.</li>
                <li>Chāndogya Upaniṣad 3.14.1 &amp; 6.8.7 — public domain.</li>
                <li>Oṃ &amp; Oṃ Śāntiḥ — traditional Vedic invocations.</li>
              </ul>
              Transliterations are standard IAST. Any error is unintentional — corrections welcome.
            </Block>
            <Block title="Audio">
              All audio is generated live in your browser (synthesized tones, ambient textures, and
              chant voices). No copyrighted recordings or third-party samples are used.
            </Block>
            <Block title="Typography">
              DM Serif Display and Inter, served via Google Fonts under the SIL Open Font License 1.1.
            </Block>
          </>
        )}

        <div style={{ fontSize: 11, color: 'var(--text-ghost)', textAlign: 'center', paddingTop: 4 }}>
          Drift {APP_VERSION} · © {new Date().getFullYear()} Wizard Communications
        </div>
      </div>
    </Sheet>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 6, color: 'var(--text-primary)' }}>
        {title}
      </div>
      <div>{children}</div>
    </div>
  )
}

const list: React.CSSProperties = { margin: '8px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }
