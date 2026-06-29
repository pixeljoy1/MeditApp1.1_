/**
 * Equalizer — a 90s hi-fi graphic spectrum analyzer.
 * Classic segmented LED bars (green → amber → red, bottom to top) with
 * slow-falling peak-hold caps, driven by the AudioEngine's AnalyserNode.
 * Toggleable + battery-friendly (loop pauses when hidden).
 */

import { useEffect, useRef } from 'react'
import { audioEngine } from '../audio/AudioEngine'

interface Props {
  bars?: number
  segments?: number
  opacity?: number
  width?: number
  height?: number
  running?: boolean
}

// classic stereo-EQ segment color by vertical position (0 bottom → 1 top)
function segColor(t: number, lit: boolean) {
  if (!lit) return 'rgba(120,130,150,0.10)'
  if (t > 0.85) return '#E5484D' // red
  if (t > 0.62) return '#E8C547' // amber
  return '#41D67E' // green
}

export function Equalizer({ bars = 16, segments = 12, opacity = 1, width = 300, height = 64, running = true }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const opacityRef = useRef(opacity)
  opacityRef.current = opacity
  const runningRef = useRef(running)
  runningRef.current = running

  useEffect(() => {
    const canvas = ref.current!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    const g = canvas.getContext('2d')!
    g.scale(dpr, dpr)

    let raf = 0
    const level = new Array(bars).fill(0)
    const peak = new Array(bars).fill(0)
    let freq: Uint8Array | null = null

    const segGap = 2
    const barGap = Math.max(2, width / bars / 4)
    const barW = (width - barGap * (bars - 1)) / bars
    const segH = (height - segGap * (segments - 1)) / segments

    const draw = () => {
      if (!runningRef.current) {
        raf = requestAnimationFrame(draw)
        return
      }
      const analyser = audioEngine.analyser
      if (analyser) {
        if (!freq || freq.length !== analyser.frequencyBinCount) freq = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(freq as Uint8Array<ArrayBuffer>)
      }
      g.clearRect(0, 0, width, height)
      const op = opacityRef.current
      g.globalAlpha = op

      for (let b = 0; b < bars; b++) {
        // sample across the musical part of the spectrum
        const raw = freq ? freq[Math.floor((b / bars) * (freq.length * 0.7))] / 255 : 0
        level[b] += (raw - level[b]) * 0.22
        // peak hold falls slowly
        if (level[b] > peak[b]) peak[b] = level[b]
        else peak[b] = Math.max(level[b], peak[b] - 0.012)

        const lit = Math.round(level[b] * segments)
        const peakSeg = Math.round(peak[b] * segments)
        const x = b * (barW + barGap)

        for (let s = 0; s < segments; s++) {
          const t = s / (segments - 1)
          const y = height - (s + 1) * segH - s * segGap
          const isLit = s < lit
          const isPeak = s === peakSeg - 1 && peakSeg > 0
          g.fillStyle = isPeak ? '#F0EEF8' : segColor(t, isLit)
          g.fillRect(x, y, barW, segH)
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [bars, segments, width, height])

  return <canvas ref={ref} style={{ width, height, display: 'block' }} aria-hidden />
}
