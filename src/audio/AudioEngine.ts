/**
 * AudioEngine — Drift spec §6.
 * Web Audio twin of the ExoPlayer + LayerMixer + SleepFader stack.
 *
 * V1 renders calming audio live (no licensed stems — §18 Q2) from:
 *   Layer 1 — Foundation : a warm reverbed pad (root + octave + fifth, slow chorus)
 *   Layer 2 — Breath     : a slow swelling tone at the breath cycle (4–7s)
 *   Layer 3 — Ambient    : a per-session sound module (rain / waves / forest / …)
 *
 * Everything runs through a convolution reverb for spaciousness, then a master
 * gain (user volume), which also feeds an AnalyserNode that drives the equalizer.
 */

import { SleepFader } from './SleepFader'

export type AmbientType = 'none' | 'rain' | 'waves' | 'forest' | 'wind' | 'shimmer'

export interface SessionSound {
  /** Root frequency (Hz) for the foundation pad. */
  root: number
  /** Breath cycle seconds (4–7s typical). Drives Layer 2 + the visual breath envelope. */
  breathCycle: number
  /** Ambient intensity 0..1 (Layer 3). */
  ambientDensity: number
  /** Lowpass cutoff (Hz) for the pad — darker = sleepier. */
  cutoff: number
  /** Which ambient sound module to layer in (§6.3 themes). */
  ambient: AmbientType
}

function brownNoiseBuffer(ctx: AudioContext, seconds = 5): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    d[i] = last * 3.2
  }
  return buf
}

function impulseBuffer(ctx: AudioContext, seconds = 3.5, decay = 3): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
  }
  return buf
}

export class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private bus: GainNode | null = null // pre-reverb mix bus
  private wet: GainNode | null = null
  private dry: GainNode | null = null
  private convolver: ConvolverNode | null = null
  private fader: SleepFader | null = null
  private _analyser: AnalyserNode | null = null
  private noise: AudioBuffer | null = null

  // live nodes to tear down per session
  private nodes: Array<OscillatorNode | AudioBufferSourceNode> = []
  private timers: number[] = []

  private _volume = 0.8
  private _breathPhase = 0
  private current: SessionSound | null = null

  get volume() {
    return this._volume
  }
  get analyser(): AnalyserNode | null {
    return this._analyser
  }

  /** Latest breath envelope 0..1 — polled by the gradient for luminosity sync. */
  breathEnvelope(): number {
    const ctx = this.ctx
    if (!this.current || !ctx) return 0.5
    const phase = ((ctx.currentTime / this.current.breathCycle) * Math.PI * 2 + this._breathPhase) % (Math.PI * 2)
    return 0.5 + 0.5 * Math.sin(phase)
  }

  private ensure(): AudioContext {
    if (this.ctx) return this.ctx
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.ctx = ctx
    this.noise = brownNoiseBuffer(ctx)

    this.master = ctx.createGain()
    this.master.gain.value = this._volume
    this._analyser = ctx.createAnalyser()
    this._analyser.fftSize = 256
    this._analyser.smoothingTimeConstant = 0.8
    this.master.connect(ctx.destination)
    this.master.connect(this._analyser)

    // reverb send/return
    this.bus = ctx.createGain()
    this.dry = ctx.createGain()
    this.dry.gain.value = 0.8
    this.wet = ctx.createGain()
    this.wet.gain.value = 0.45
    this.convolver = ctx.createConvolver()
    this.convolver.buffer = impulseBuffer(ctx)
    this.bus.connect(this.dry)
    this.dry.connect(this.master)
    this.bus.connect(this.convolver)
    this.convolver.connect(this.wet)
    this.wet.connect(this.master)

    this.fader = new SleepFader(ctx, this.master)
    return ctx
  }

  async play(sound: SessionSound) {
    const ctx = this.ensure()
    if (ctx.state === 'suspended') await ctx.resume()
    this.stopLayers()
    this.current = sound
    const bus = this.bus!

    // ── Layer 1: foundation pad (root + octave + fifth, gentle chorus) ──
    const padFilter = ctx.createBiquadFilter()
    padFilter.type = 'lowpass'
    padFilter.frequency.value = sound.cutoff
    padFilter.Q.value = 0.4
    const padGain = ctx.createGain()
    padGain.gain.value = 0.16
    padFilter.connect(padGain)
    padGain.connect(bus)
    ;[
      [sound.root, 0, 'sine'],
      [sound.root, -6, 'triangle'],
      [sound.root * 2, 4, 'sine'],
      [sound.root * 1.5, -3, 'sine'],
    ].forEach(([f, det, type]) => {
      const o = ctx.createOscillator()
      o.type = type as OscillatorType
      o.frequency.value = f as number
      o.detune.value = det as number
      // slow chorus drift
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.05 + Math.random() * 0.08
      const lg = ctx.createGain()
      lg.gain.value = 4
      lfo.connect(lg)
      lg.connect(o.detune)
      lfo.start()
      o.connect(padFilter)
      o.start()
      this.nodes.push(o, lfo)
    })

    // ── Layer 2: breath swell ──
    const breathGain = ctx.createGain()
    breathGain.gain.value = 0.0
    breathGain.connect(bus)
    const breathOsc = ctx.createOscillator()
    breathOsc.type = 'sine'
    breathOsc.frequency.value = sound.root * 1.5
    breathOsc.connect(breathGain)
    breathOsc.start()
    const breathLfo = ctx.createOscillator()
    breathLfo.frequency.value = 1 / sound.breathCycle
    const breathLfoGain = ctx.createGain()
    breathLfoGain.gain.value = 0.09
    breathLfo.connect(breathLfoGain)
    breathLfoGain.connect(breathGain.gain)
    breathLfo.start()
    this.nodes.push(breathOsc, breathLfo)

    // ── Layer 3: ambient module ──
    this.buildAmbient(sound)

    // master fade-in (3s, §12.2)
    this.fader!.fadeIn(this._volume, 3)
  }

  // -- ambient modules (the §6.3 "exactly those" sound textures) --------------
  private noiseSource(): AudioBufferSourceNode {
    const src = this.ctx!.createBufferSource()
    src.buffer = this.noise!
    src.loop = true
    src.start()
    this.nodes.push(src)
    return src
  }

  private lfo(freq: number, depth: number, target: AudioParam, base: number) {
    const ctx = this.ctx!
    target.value = base
    const o = ctx.createOscillator()
    o.frequency.value = freq
    const g = ctx.createGain()
    g.gain.value = depth
    o.connect(g)
    g.connect(target)
    o.start()
    this.nodes.push(o)
  }

  private buildAmbient(sound: SessionSound) {
    const ctx = this.ctx!
    const bus = this.bus!
    const d = sound.ambientDensity

    switch (sound.ambient) {
      case 'rain': {
        // body of rain
        const bp = ctx.createBiquadFilter()
        bp.type = 'bandpass'
        bp.frequency.value = 1300
        bp.Q.value = 0.6
        const g = ctx.createGain()
        g.gain.value = 0.5 * d
        this.noiseSource().connect(bp)
        bp.connect(g)
        g.connect(bus)
        this.lfo(0.7, 0.12 * d, g.gain, 0.5 * d) // gentle flutter
        // fine droplets
        const hp = ctx.createBiquadFilter()
        hp.type = 'bandpass'
        hp.frequency.value = 3400
        hp.Q.value = 2.5
        const g2 = ctx.createGain()
        g2.gain.value = 0.14 * d
        this.noiseSource().connect(hp)
        hp.connect(g2)
        g2.connect(bus)
        break
      }
      case 'waves': {
        const lp = ctx.createBiquadFilter()
        lp.type = 'lowpass'
        lp.frequency.value = 520
        const g = ctx.createGain()
        g.gain.value = 0.0
        this.noiseSource().connect(lp)
        lp.connect(g)
        g.connect(bus)
        // slow swell in/out — the breath of the sea
        this.lfo(1 / 9, 0.32 * d, g.gain, 0.34 * d)
        break
      }
      case 'forest': {
        // wind bed
        const lp = ctx.createBiquadFilter()
        lp.type = 'lowpass'
        lp.frequency.value = 650
        const g = ctx.createGain()
        g.gain.value = 0.22 * d
        this.noiseSource().connect(lp)
        lp.connect(g)
        g.connect(bus)
        this.lfo(1 / 11, 220, lp.frequency, 650)
        this.scheduleBirds(d)
        break
      }
      case 'wind': {
        const bp = ctx.createBiquadFilter()
        bp.type = 'bandpass'
        bp.frequency.value = 520
        bp.Q.value = 0.5
        const g = ctx.createGain()
        g.gain.value = 0.4 * d
        this.noiseSource().connect(bp)
        bp.connect(g)
        g.connect(bus)
        this.lfo(1 / 7, 320, bp.frequency, 560)
        this.lfo(1 / 5, 0.16 * d, g.gain, 0.4 * d)
        break
      }
      case 'shimmer':
        this.scheduleShimmer(d)
        break
      case 'none':
      default:
        // pad + breath only; a touch of high shimmer keeps it alive
        if (d > 0) this.scheduleShimmer(d * 0.5)
        break
    }
  }

  private scheduleBirds(density: number) {
    const ctx = this.ctx!
    const tick = () => {
      if (!this.current) return
      if (Math.random() < density) {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        const bp = ctx.createBiquadFilter()
        bp.type = 'bandpass'
        bp.frequency.value = 2600
        bp.Q.value = 6
        o.type = 'sine'
        const base = 1800 + Math.random() * 1400
        const now = ctx.currentTime
        o.frequency.setValueAtTime(base, now)
        o.frequency.linearRampToValueAtTime(base * 1.5, now + 0.12)
        o.frequency.linearRampToValueAtTime(base * 1.1, now + 0.24)
        g.gain.setValueAtTime(0, now)
        g.gain.linearRampToValueAtTime(0.05, now + 0.05)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)
        o.connect(bp)
        bp.connect(g)
        g.connect(this.bus!)
        o.start(now)
        o.stop(now + 0.55)
      }
      this.timers.push(window.setTimeout(tick, 3000 + Math.random() * 5000))
    }
    this.timers.push(window.setTimeout(tick, 2500))
  }

  private scheduleShimmer(density: number) {
    const ctx = this.ctx!
    const tick = () => {
      if (!this.current) return
      if (Math.random() < density) {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'sine'
        const intervals = [0, 3, 5, 7, 12, 19]
        const semi = intervals[Math.floor(Math.random() * intervals.length)]
        o.frequency.value = (this.current?.root ?? 110) * 2 * Math.pow(2, semi / 12)
        const now = ctx.currentTime
        g.gain.setValueAtTime(0, now)
        g.gain.linearRampToValueAtTime(0.05, now + 0.6)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 4.5)
        o.connect(g)
        g.connect(this.bus!)
        o.start(now)
        o.stop(now + 4.6)
      }
      this.timers.push(window.setTimeout(tick, 2200 + Math.random() * 3200))
    }
    this.timers.push(window.setTimeout(tick, 1800))
  }

  beginSleepFade(seconds = 180) {
    this.fader?.fadeToSilence(seconds)
  }

  fadeOut(seconds = 8) {
    // ensure the context is running so the fade is audible even if paused
    this.ctx?.resume()
    this.fader?.fadeToSilence(seconds)
    window.setTimeout(() => this.stopLayers(), seconds * 1000 + 100)
  }

  pause() {
    this.ctx?.suspend()
  }
  resume() {
    this.ctx?.resume()
  }

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v))
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this._volume, this.ctx.currentTime, 0.05)
    }
  }

  stop() {
    this.stopLayers()
  }

  private stopLayers() {
    this.current = null
    this.timers.forEach((t) => clearTimeout(t))
    this.timers = []
    this.nodes.forEach((n) => {
      try {
        n.stop()
      } catch {
        /* already stopped */
      }
    })
    this.nodes = []
  }
}

// Singleton — one engine per app, like a single ExoPlayer instance.
export const audioEngine = new AudioEngine()
