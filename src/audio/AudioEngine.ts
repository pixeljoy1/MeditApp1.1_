/**
 * AudioEngine — Drift spec §6.
 * Plays the real, curated MP3 tracks. Each track is routed through Web Audio
 * (MediaElementSource → master gain → destination) so the SleepFader can fade it
 * and an AnalyserNode can drive the equalizer. Tracks loop seamlessly.
 */

import { SleepFader } from './SleepFader'

export class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private fader: SleepFader | null = null
  private _analyser: AnalyserNode | null = null

  private el: HTMLAudioElement | null = null
  private src: MediaElementAudioSourceNode | null = null

  private _volume = 0.85
  private breathCycle = 6

  get volume() {
    return this._volume
  }
  get analyser(): AnalyserNode | null {
    return this._analyser
  }

  /** Time-based breath envelope 0..1 for the gradient luminosity sync. */
  breathEnvelope(): number {
    const t = this.ctx ? this.ctx.currentTime : performance.now() / 1000
    return 0.5 + 0.5 * Math.sin((t / this.breathCycle) * Math.PI * 2)
  }

  private ensure(): AudioContext {
    if (this.ctx) return this.ctx
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = this._volume
    this._analyser = ctx.createAnalyser()
    this._analyser.fftSize = 256
    this._analyser.smoothingTimeConstant = 0.8
    this.master.connect(ctx.destination)
    this.master.connect(this._analyser)
    this.fader = new SleepFader(ctx, this.master)
    return ctx
  }

  /** Start a track: load, loop, route through the graph, and fade in over 3s. */
  async play(url: string, breathCycle = 6) {
    const ctx = this.ensure()
    if (ctx.state === 'suspended') await ctx.resume()
    this.stop()
    this.breathCycle = breathCycle

    const el = new Audio(url)
    el.loop = true
    el.preload = 'auto'
    el.crossOrigin = 'anonymous'
    this.el = el
    const src = ctx.createMediaElementSource(el)
    src.connect(this.master!)
    this.src = src

    try {
      await el.play()
    } catch {
      /* autoplay blocked until a gesture; caller invokes from a tap */
    }
    this.fader!.fadeIn(this._volume, 3)
  }

  beginSleepFade(seconds = 180) {
    this.fader?.fadeToSilence(seconds)
  }

  fadeOut(seconds = 8) {
    this.ctx?.resume()
    this.fader?.fadeToSilence(seconds)
    window.setTimeout(() => this.stop(), seconds * 1000 + 150)
  }

  pause() {
    this.el?.pause()
  }
  resume() {
    this.ctx?.resume()
    this.el?.play().catch(() => {})
  }

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v))
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this._volume, this.ctx.currentTime, 0.05)
    }
  }

  stop() {
    if (this.el) {
      this.el.pause()
      this.el.src = ''
    }
    try {
      this.src?.disconnect()
    } catch {
      /* noop */
    }
    this.src = null
    this.el = null
  }
}

// Singleton — one engine per app, like a single ExoPlayer instance.
export const audioEngine = new AudioEngine()
