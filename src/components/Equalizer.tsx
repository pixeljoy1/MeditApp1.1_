/**
 * Equalizer — audio-reactive visualizer that mimics the playing music.
 * Reads the AudioEngine's AnalyserNode each frame and draws a symmetric row of
 * bars whose heights follow the live frequency spectrum. Soft, glowing, calm —
 * a reflection of the sound, not a club VU meter.
 */

import { useEffect, useRef } from 'react'
import { audioEngine } from '../audio/AudioEngine'
import { color } from '../theme/tokens'

interface Props {
  bars?: number
  /** Overall opacity (fades with the session dimming). */
  opacity?: number
  width?: number
  height?: number
}

export function Equalizer({ bars = 28, opacity = 1, width = 300, height = 64 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const opacityRef = useRef(opacity)
  opacityRef.current = opacity

  useEffect(() => {
    const canvas = ref.current!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    const g = canvas.getContext('2d')!
    g.scale(dpr, dpr)

    let raf = 0
    const smooth = new Array(bars).fill(0)
    let freq: Uint8Array | null = null

    const frame = () => {
      const analyser = audioEngine.analyser
      g.clearRect(0, 0, width, height)

      if (analyser) {
        if (!freq || freq.length !== analyser.frequencyBinCount) {
          freq = new Uint8Array(analyser.frequencyBinCount)
        }
        analyser.getByteFrequencyData(freq as Uint8Array<ArrayBuffer>)
      }

      const op = opacityRef.current
      const mid = (bars - 1) / 2
      const barW = width / bars
      for (let i = 0; i < bars; i++) {
        // sample lower-mid spectrum (most musical energy lives there)
        const src = freq ? freq[Math.floor((i / bars) * (freq.length * 0.6))] / 255 : 0
        // ease toward target for a gentle, liquid motion
        smooth[i] += (src - smooth[i]) * 0.18
        const dist = 1 - Math.abs(i - mid) / mid // taller in the middle
        const h = Math.max(2, smooth[i] * height * (0.5 + 0.5 * dist))
        const x = i * barW + barW * 0.2
        const w = barW * 0.6
        const y = (height - h) / 2
        g.fillStyle = color.accent
        g.globalAlpha = op * (0.35 + 0.65 * smooth[i])
        // rounded bar
        const r = Math.min(w / 2, 3)
        g.beginPath()
        g.roundRect(x, y, w, h, r)
        g.fill()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [bars, width, height])

  return <canvas ref={ref} style={{ width, height, display: 'block' }} aria-hidden />
}
