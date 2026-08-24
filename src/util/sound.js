let ctx = null
let muted = false

function getCtx()
{
  if (!ctx)
  {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    ctx = new AudioCtx()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function setMuted(value)
{
  muted = value
}

export function isMuted()
{
  return muted
}

export function beep({ freq = 220, duration = 0.03, type = 'square', gain = 0.03 } = {})
{
  if (muted) return
  try
  {
    const audioCtx = getCtx()
    if (!audioCtx) return
    const osc = audioCtx.createOscillator()
    const amp = audioCtx.createGain()
    osc.type = type
    osc.frequency.value = freq
    amp.gain.value = gain
    osc.connect(amp)
    amp.connect(audioCtx.destination)
    const now = audioCtx.currentTime
    amp.gain.setValueAtTime(gain, now)
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc.start(now)
    osc.stop(now + duration)
  }
  catch
  {
    // audio not available, ignore
  }
}

export function keyClick()
{
  beep({ freq: 500 + Math.random() * 200, duration: 0.02, gain: 0.02 })
}

export function lineBeep()
{
  beep({ freq: 140, duration: 0.045, gain: 0.035 })
}

export function alertBeep()
{
  beep({ freq: 90, duration: 0.18, type: 'sawtooth', gain: 0.05 })
}

export function launchBlip()
{
  beep({ freq: 880, duration: 0.05, type: 'triangle', gain: 0.03 })
}
