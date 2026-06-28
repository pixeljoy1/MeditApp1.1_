/**
 * App — top-level shell & navigation (spec §7.3 flow).
 * Home → Pre-Play → Active Session → (fade) → Home.
 *
 * The full-screen GradientCanvas is mounted once for both Pre-Play and Session so
 * the gradient *continues* across the transition with no break (§8.2). The active
 * session's per-frame sampler is injected via a ref so the canvas never remounts.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GradientCanvas } from './gradient/GradientCanvas'
import { GradientController } from './gradient/GradientController'
import { Onboarding } from './screens/Onboarding'
import { Home } from './screens/Home'
import { PrePlay } from './screens/PrePlay'
import { ActiveSession } from './screens/ActiveSession'
import { Settings } from './screens/Settings'
import { Paywall } from './screens/Paywall'
import { Banner } from './components/Banner'
import { useStore } from './state/store'
import { useSession, SessionRuntime } from './state/useSession'
import { Session } from './session/types'
import { byId } from './session/catalog'
import { audioEngine } from './audio/AudioEngine'
import { effectivePalette, prefersReducedMotion } from './state/util'
import { SleepTimer } from './state/types'

type SampleFn = SessionRuntime['sample']

export default function App() {
  const store = useStore()
  const { screen, go, selectSession, selectedSessionId, persisted, selectedTimer, markPlayed } = store
  const controller = useMemo(() => new GradientController('dusk'), [])
  const reduce = useMemo(() => prefersReducedMotion(), [])

  const [lockedSession, setLockedSession] = useState<Session | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const sampleRef = useRef<SampleFn | null>(null)
  const previewTimer = useRef<number | null>(null)

  const selected = selectedSessionId ? byId(selectedSessionId) : null

  const showBanner = useCallback((text: string) => {
    setBanner(text)
    window.setTimeout(() => setBanner((b) => (b === text ? null : b)), 4000)
  }, [])

  // ── navigation handlers ────────────────────────────────────
  const handleSelect = useCallback(
    (s: Session) => {
      selectSession(s.id)
      controller.setPalette(effectivePalette(s, persisted.settings))
      go('preplay')
    },
    [selectSession, controller, persisted.settings, go],
  )

  const handlePreview = useCallback(
    (s: Session) => {
      // §7.2 long-press → 10s audio preview. Gradient continuity stays on the
      // Pre-Play/Session canvases; here we surface the sound + a hint.
      audioEngine.play(s.sound)
      showBanner(`Previewing ${s.title}`)
      if (previewTimer.current) clearTimeout(previewTimer.current)
      previewTimer.current = window.setTimeout(() => audioEngine.fadeOut(1.5), 10_000)
    },
    [showBanner],
  )

  const handleLocked = useCallback((s: Session) => setLockedSession(s), [])

  const beginSession = useCallback(() => {
    if (!selected) return
    if (previewTimer.current) clearTimeout(previewTimer.current)
    audioEngine.stop()
    markPlayed(selected.id)
    go('session')
  }, [selected, markPlayed, go])

  const backHome = useCallback(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current)
    audioEngine.stop()
    go('home')
  }, [go])

  const onboardingDone = useCallback(
    (_t: SleepTimer) => {
      const drift = byId('drift')!
      handleSelect(drift)
    },
    [handleSelect],
  )

  // §11 low-battery banner (best-effort; Battery API where available).
  useEffect(() => {
    let cancelled = false
    ;(navigator as any).getBattery?.().then((bat: any) => {
      const check = () => {
        if (!cancelled && bat.level < 0.15 && !bat.charging) {
          showBanner('Low battery. Plugging in helps.')
        }
      }
      check()
      bat.addEventListener('levelchange', check)
    })
    return () => {
      cancelled = true
    }
  }, [showBanner])

  const stableSample = useCallback(
    () => sampleRef.current?.() ?? { dim: 1, driftScale: 1, breath: 0.5 },
    [],
  )
  const showGradient = screen === 'preplay' || screen === 'session'

  return (
    <div className="app-frame">
      {showGradient && (
        <GradientCanvas
          controller={controller}
          reduceMotion={reduce}
          sample={screen === 'session' ? stableSample : undefined}
          // bright psychedelic field while choosing (Pre-Play); calm in session
          psychedelic={screen === 'preplay' ? 0.85 : 0}
        />
      )}

      {screen === 'onboarding' && <Onboarding onDone={onboardingDone} />}

      {screen === 'home' && (
        <Home onSelect={handleSelect} onPreview={handlePreview} onLocked={handleLocked} />
      )}

      {screen === 'preplay' && selected && (
        <PrePlay session={selected} onBegin={beginSession} onBack={backHome} />
      )}

      {screen === 'session' && selected && (
        <SessionLayer session={selected} timer={selectedTimer} sampleRef={sampleRef} onExit={backHome} />
      )}

      <Settings />
      <Paywall
        session={lockedSession}
        onClose={() => setLockedSession(null)}
        onUnlock={() => {
          store.setPremium(true)
          setLockedSession(null)
        }}
      />
      {banner && <Banner text={banner} />}
    </div>
  )
}

/**
 * SessionLayer — mounted only during an active session so useSession's lifecycle
 * matches the session. Publishes its per-frame sampler to the shared canvas.
 */
function SessionLayer({
  session,
  timer,
  sampleRef,
  onExit,
}: {
  session: Session
  timer: SleepTimer
  sampleRef: React.MutableRefObject<SampleFn | null>
  onExit: () => void
}) {
  const runtime = useSession({ session, timer, onExit })
  useEffect(() => {
    sampleRef.current = runtime.sample
    return () => {
      sampleRef.current = null
    }
  }, [runtime.sample, sampleRef])
  return <ActiveSession session={session} runtime={runtime} />
}
