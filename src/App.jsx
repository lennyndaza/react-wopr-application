import { useEffect, useRef, useState } from 'react'
import TicTacToe from './components/TicTacToe'
import GlobalWar from './components/GlobalWar'
import { GAME_LIST } from './data/games'
import { keyClick, lineBeep, setMuted, isMuted } from './util/sound'
import './App.css'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default function App()
{
  const [history, setHistory] = useState([])
  const [typing, setTyping] = useState(null)
  const [waiting, setWaiting] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [activeGame, setActiveGame] = useState(null)
  const [muted, setMutedState] = useState(isMuted())

  const idRef = useRef(0)
  const handlerRef = useRef(null)
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const startedRef = useRef(false)

  useEffect(() =>
  {
    if (startedRef.current) return
    startedRef.current = true
    bootSequence()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() =>
  {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [history, typing, activeGame])

  useEffect(() =>
  {
    if (waiting && inputRef.current) inputRef.current.focus()
  }, [waiting])

  function addLine(text)
  {
    setHistory((h) => [...h, { id: idRef.current++, text }])
  }

  async function say(lines, speed = 16)
  {
    for (const text of lines)
    {
      if (text === '')
      {
        addLine('')
        await sleep(150)
        continue
      }
      lineBeep()
      let shown = ''
      setTyping('')
      for (const ch of text)
      {
        shown += ch
        setTyping(shown)
        await sleep(speed + Math.random() * speed * 0.6)
      }
      setTyping(null)
      addLine(text)
      await sleep(120)
    }
  }

  function askAnything(handler)
  {
    handlerRef.current = handler
    setWaiting(true)
  }

  function handleSubmit(e)
  {
    e.preventDefault()
    if (!waiting) return
    const value = inputValue
    addLine(value || ' ')
    setInputValue('')
    setWaiting(false)
    const handler = handlerRef.current
    handlerRef.current = null
    if (handler) handler(value)
  }

  // ---- script ----

  async function bootSequence()
  {
    await say(['CONNECTING...', '158.201.4.221 CONNECTED', ''], 10)
    await sleep(400)
    await say(['GREETINGS PROFESSOR FALKEN.'])
    askAnything(afterGreeting)
  }

  async function afterGreeting()
  {
    await say([
      'HOW ABOUT A NICE GAME OF CHESS?',
      '',
      'TYPE "LIST GAMES" TO SEE AVAILABLE SIMULATIONS.',
    ])
    askAnything(handleMenuInput)
  }

  async function showGameList()
  {
    await say(['AVAILABLE GAMES:', '', ...GAME_LIST.map((g) => '  ' + g), ''])
    await say(['MAKE A SELECTION.'])
    askAnything(handleMenuInput)
  }

  async function handleMenuInput(raw)
  {
    const input = raw.trim().toUpperCase()
    if (!input)
    {
      askAnything(handleMenuInput)
      return
    }
    if (input.includes('LIST'))
    {
      await showGameList()
      return
    }
    if (input.includes('THERMONUCLEAR') || input.includes('GLOBAL'))
    {
      await startWarFlow()
      return
    }
    if (input.includes('TIC'))
    {
      await startTicTacToe()
      return
    }
    if (GAME_LIST.some((g) => g.toUpperCase() === input))
    {
      await say([`LOADING ${input}...`])
      await sleep(900)
      await say([
        'UNABLE TO COMPLY.',
        'STRATEGIC MEMORY RESERVED FOR TIC-TAC-TOE AND GLOBAL THERMONUCLEAR WAR.',
      ])
      askAnything(handleMenuInput)
      return
    }
    await say(["I DON'T UNDERSTAND THAT.", 'TYPE "LIST GAMES" TO SEE AVAILABLE SIMULATIONS.'])
    askAnything(handleMenuInput)
  }

  async function startWarFlow()
  {
    await say(["WOULDN'T YOU PREFER A GOOD GAME OF CHESS?"])
    askAnything(handleWarConfirm)
  }

  async function handleWarConfirm()
  {
    await say(['A STRANGE GAME.', '', 'PLEASE SELECT A SIDE:', '  [1] UNITED STATES', '  [2] USSR'])
    askAnything(handleSideSelect)
  }

  async function handleSideSelect(raw)
  {
    const input = raw.trim().toUpperCase()
    let side = null
    if (input === '1' || input.includes('US') || input.includes('UNITED')) side = 'USA'
    else if (input === '2' || input.includes('USSR') || input.includes('SOVIET') || input.includes('RUSSIA'))
      side = 'USSR'

    if (!side)
    {
      await say(['INVALID SELECTION.', 'PLEASE SELECT A SIDE: [1] UNITED STATES  [2] USSR'])
      askAnything(handleSideSelect)
      return
    }
    await say([`SIDE SELECTED: ${side}`, 'INITIATING GLOBAL THERMONUCLEAR WAR SIMULATION...'])
    setActiveGame({ type: 'war', side })
  }

  function handleWarDone()
  {
    setActiveGame(null)
    say([
      '',
      'A STRANGE GAME.',
      'THE ONLY WINNING MOVE IS NOT TO PLAY.',
      '',
      'HOW ABOUT A NICE GAME OF CHESS?',
    ]).then(() => askAnything(handleMenuInput))
  }

  async function startTicTacToe()
  {
    await say(['LOADING TIC-TAC-TOE...', ''])
    setActiveGame({ type: 'ttt' })
  }

  function handleTttDone(outcome)
  {
    setActiveGame(null)
    const lines =
      outcome === 'wopr'
        ? ['WOPR WINS.', 'AS EXPECTED.']
        : ['A STRANGE GAME.', 'THE ONLY WINNING MOVE IS NOT TO PLAY.', '', 'HOW ABOUT A NICE GAME OF CHESS?']
    say(lines).then(() => askAnything(handleMenuInput))
  }

  function toggleMute()
  {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  return (
    <div className="crt">
      <div className="crt-scanlines" />
      <div className="crt-vignette" />

      <div className="wopr-frame">
        <div className="wopr-titlebar">
          <span>W.O.P.R. — WAR OPERATION PLAN RESPONSE</span>
          <button className="mute-btn" onClick={toggleMute}>
            {muted ? 'SOUND: OFF' : 'SOUND: ON'}
          </button>
        </div>

        <div className="wopr-screen" ref={scrollRef}>
          {history.map((line) => (
            <div key={line.id} className="term-line">
              {line.text}
            </div>
          ))}
          {typing !== null && <div className="term-line">{typing}<span className="cursor" /></div>}

          {activeGame?.type === 'ttt' && <TicTacToe onDone={handleTttDone} />}
          {activeGame?.type === 'war' && <GlobalWar side={activeGame.side} onDone={handleWarDone} />}

          {waiting && (
            <form onSubmit={handleSubmit} className="term-input-row" onClick={() => inputRef.current?.focus()}>
              <span className="prompt">&gt;</span>
              <input
                ref={inputRef}
                className="term-input"
                value={inputValue}
                onKeyDown={(e) =>
                {
                  if (e.key === 'Enter' || e.keyCode === 13) handleSubmit(e)
                }}
                onChange={(e) =>
                {
                  keyClick()
                  setInputValue(e.target.value)
                }}
                autoComplete="off"
                spellCheck={false}
              />
              <button type="submit" className="send-btn">ENTER &#9656;</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
