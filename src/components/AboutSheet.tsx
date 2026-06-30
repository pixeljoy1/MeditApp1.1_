/**
 * AboutSheet — discreet footer panel: legal disclaimers, sources of truth, and
 * citations for the material used. Intentionally low-key (reached via a faint
 * footer link), but complete.
 */

import { useEffect } from 'react'
import { Sheet } from './Sheet'
import { APP_VERSION } from '../version'

export type AboutFocus = 'about' | 'legal' | 'sources'

export function AboutSheet({ open, onClose, focus }: { open: boolean; onClose: () => void; focus?: AboutFocus }) {
  // scroll to the requested section once the sheet has opened
  useEffect(() => {
    if (!open || !focus) return
    const id = focus === 'legal' ? 'about-legal' : focus === 'sources' ? 'about-sources' : 'about-top'
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 420)
    return () => clearTimeout(t)
  }, [open, focus])

  return (
    <Sheet open={open} onClose={onClose} title="About & Legal">
      <div id="about-top" style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 13, lineHeight: 1.55, color: 'var(--text-secondary)' }}>
        <Block id="about-legal" title="Wellness disclaimer">
          Drift is a relaxation aid, not a medical device. It is not intended to diagnose, treat,
          cure, or prevent any condition, and is not a substitute for professional care for sleep
          disorders, anxiety, or any health concern. If sleep problems persist, please consult a
          qualified clinician. Do not use while driving or operating machinery.
        </Block>

        <Block title="Audio">
          All audio is generated live in your browser (synthesized tones, ambient textures, and
          chant voices). No copyrighted recordings or third-party samples are used.
        </Block>

        <Block id="about-sources" title="Texts &amp; citations">
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

        <Block title="Typography">
          DM Serif Display and Inter, served via Google Fonts under the SIL Open Font License 1.1.
        </Block>

        <Block title="Privacy">
          Your name, preferences, and theme requests are stored locally on this device. Submitting a
          theme request sends its contents to the developer by email (via FormSubmit). Nothing else
          is collected or shared.
        </Block>

        <Block title="Notice">
          Drift is an independent web prototype built from the Drift product specification. All
          marks belong to their respective owners.
        </Block>

        <div style={{ fontSize: 11, color: 'var(--text-ghost)', textAlign: 'center', paddingTop: 4 }}>
          Drift {APP_VERSION} · © {new Date().getFullYear()}
        </div>
      </div>
    </Sheet>
  )
}

function Block({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ scrollMarginTop: 8 }}>
      <div className="label" style={{ marginBottom: 6, color: 'var(--text-primary)' }}>
        {title}
      </div>
      <div>{children}</div>
    </div>
  )
}

const list: React.CSSProperties = { margin: '8px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }
