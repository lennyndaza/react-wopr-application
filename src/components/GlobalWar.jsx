import { useEffect, useRef, useState } from 'react'
import { US_TARGETS, USSR_TARGETS } from '../data/games'
import { USA_OUTLINE, USSR_OUTLINE } from '../data/mapOutlines'
import { alertBeep, launchBlip } from '../util/sound'
import './GlobalWar.css'

function MapPanel({ label, outline, cities, hits })
{
  return (
    <div className="war-panel">
      <div className="war-panel-label">{label}</div>
      <div className="war-map">
        <svg className="war-outline" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d={outline} />
        </svg>
        {cities.map((city) => (
          <div
            key={city.name}
            className={`war-dot ${hits.includes(city.name) ? 'war-dot--hit' : ''}`}
            style={{ left: `${city.x}%`, top: `${city.y}%` }}
            title={city.name}
          >
            <span className="war-dot-label">{city.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function shuffled(arr)
{
  const copy = arr.slice()
  for (let i = copy.length - 1; i > 0; i--)
  {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function GlobalWar({ side, onDone })
{
  const enemyName = side === 'USA' ? 'USSR' : 'UNITED STATES'
  const enemyTargets = side === 'USA' ? USSR_TARGETS : US_TARGETS
  const homeTargets = side === 'USA' ? US_TARGETS : USSR_TARGETS

  const [defcon, setDefcon] = useState(5)
  const [hits, setHits] = useState([])
  const [log, setLog] = useState([])
  const [megatons, setMegatons] = useState(0)
  const [phase, setPhase] = useState('running')
  const logRef = useRef(null)
  const timers = useRef([])
  const megatonsRef = useRef(0)

  useEffect(() =>
  {
    const targets = shuffled(enemyTargets).concat(shuffled(homeTargets))
    let t = 400

    const schedule = (fn, delay) =>
    {
      const id = setTimeout(fn, delay)
      timers.current.push(id)
    }

    schedule(() => addLog(`WOPR: SIMULATION INITIATED — ${side} FIRST STRIKE POSTURE`), t)
    t += 700

    const defconSteps = [4, 3, 2, 1]
    defconSteps.forEach((level, i) =>
    {
      schedule(() =>
      {
        setDefcon(level)
        alertBeep()
        addLog(`DEFENSE CONDITION ${level}`)
      }, t + i * 550)
    })
    t += defconSteps.length * 550 + 400

    targets.forEach((city, i) =>
    {
      schedule(() =>
      {
        launchBlip()
        setHits((h) => [...h, city.name])
        const gain = Math.round(5 + Math.random() * 45)
        megatonsRef.current += gain
        setMegatons(megatonsRef.current)
        addLog(`WARHEAD DETONATED — ${city.name}`)
      }, t + i * 260)
    })
    t += targets.length * 260 + 900

    schedule(() =>
    {
      addLog('')
      addLog('NORAD LINK SEVERED')
      addLog('ALL FORCES COMMITTED')
      addLog('')
    }, t)
    t += 1200

    schedule(() =>
    {
      setPhase('done')
      addLog('WINNER: NONE')
    }, t)
    t += 1600

    schedule(() => onDone({ megatons: megatonsRef.current }), t)

    return () => timers.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addLog(text)
  {
    setLog((l) => [...l.slice(-13), { id: l.length, text }])
  }

  useEffect(() =>
  {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  return (
    <div className="war">
      <div className="war-header">
        <div>SIDE: {side}</div>
        <div className={`war-defcon war-defcon--${defcon}`}>DEFCON {defcon}</div>
        <div>MEGATONS: {megatons}</div>
      </div>

      <div className="war-panels">
        <MapPanel
          label={side === 'USA' ? 'UNITED STATES' : 'USSR'}
          outline={side === 'USA' ? USA_OUTLINE : USSR_OUTLINE}
          cities={homeTargets}
          hits={hits}
        />
        <MapPanel
          label={enemyName}
          outline={side === 'USA' ? USSR_OUTLINE : USA_OUTLINE}
          cities={enemyTargets}
          hits={hits}
        />
      </div>

      <div className="war-log" ref={logRef}>
        {log.map((l) => (
          <div key={l.id} className="war-log-line">{l.text || ' '}</div>
        ))}
      </div>

      {phase === 'done' && (
        <div className="war-result">
          NO SURVIVORS DETECTED — TARGETING {enemyName} PRODUCED NO STRATEGIC ADVANTAGE
        </div>
      )}
    </div>
  )
}
