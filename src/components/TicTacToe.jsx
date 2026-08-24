import { useEffect, useRef, useState } from 'react'
import { keyClick, launchBlip } from '../util/sound'
import './TicTacToe.css'

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

function winnerOf(board)
{
  for (const [a, b, c] of LINES)
  {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
  }
  if (board.every(Boolean)) return 'DRAW'
  return null
}

function minimax(board, player)
{
  const win = winnerOf(board)
  if (win === 'O') return { score: 1 }
  if (win === 'X') return { score: -1 }
  if (win === 'DRAW') return { score: 0 }

  const moves = []
  for (let i = 0; i < 9; i++)
  {
    if (board[i]) continue
    const next = board.slice()
    next[i] = player
    const result = minimax(next, player === 'O' ? 'X' : 'O')
    moves.push({ index: i, score: result.score })
  }

  if (player === 'O')
  {
    return moves.reduce((best, m) => (m.score > best.score ? m : best))
  }
  return moves.reduce((best, m) => (m.score < best.score ? m : best))
}

function bestMove(board)
{
  const empties = board.reduce((acc, v, i) => (v ? acc : [...acc, i]), [])
  if (empties.length === 9) return 4 // WOPR opens center, it's optimal and fast
  let best = null
  for (const i of empties)
  {
    const next = board.slice()
    next[i] = 'O'
    const result = minimax(next, 'X')
    if (best === null || result.score > best.score)
    {
      best = { index: i, score: result.score }
    }
  }
  return best.index
}

const EMPTY = Array(9).fill(null)

function playRandomLegalGame()
{
  // used for WOPR-vs-WOPR autoplay: both sides play optimally -> always a draw,
  // but we vary the opening so it doesn't look identical every time
  let board = EMPTY.slice()
  let player = Math.random() < 0.5 ? 'X' : 'O'
  const history = [board.slice()]
  while (!winnerOf(board))
  {
    const empties = board.reduce((acc, v, i) => (v ? acc : [...acc, i]), [])
    let move
    if (board.every((v) => !v))
    {
      move = empties[Math.floor(Math.random() * empties.length)]
    }
    else
    {
      const scored = empties.map((i) =>
      {
        const next = board.slice()
        next[i] = player
        const result = minimax(next, player === 'O' ? 'X' : 'O')
        return { i, score: player === 'O' ? result.score : -result.score }
      })
      const top = Math.max(...scored.map((s) => s.score))
      const choices = scored.filter((s) => s.score === top)
      move = choices[Math.floor(Math.random() * choices.length)].i
    }
    board = board.slice()
    board[move] = player
    history.push(board.slice())
    player = player === 'X' ? 'O' : 'X'
  }
  return history
}

export default function TicTacToe({ onDone })
{
  const [board, setBoard] = useState(EMPTY)
  const [result, setResult] = useState(null)
  const [thinking, setThinking] = useState(false)
  const [autoplay, setAutoplay] = useState(false)
  const [autoRound, setAutoRound] = useState(0)
  const timeoutRef = useRef(null)

  useEffect(() =>
  {
    const win = winnerOf(board)
    if (win)
    {
      setResult(win)
      if (win !== 'DRAW') launchBlip()
    }
  }, [board])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  function handleCellClick(i)
  {
    if (autoplay || thinking || board[i] || result) return
    keyClick()
    const next = board.slice()
    next[i] = 'X'
    setBoard(next)
    if (winnerOf(next)) return
    setThinking(true)
    timeoutRef.current = setTimeout(() =>
    {
      const move = bestMove(next)
      const withWopr = next.slice()
      withWopr[move] = 'O'
      launchBlip()
      setBoard(withWopr)
      setThinking(false)
    }, 450 + Math.random() * 350)
  }

  function reset()
  {
    setBoard(EMPTY)
    setResult(null)
    setThinking(false)
  }

  function runAutoplay()
  {
    setAutoplay(true)
    setAutoRound(0)
    let round = 0
    const ROUNDS = 6

    function playOne()
    {
      const history = playRandomLegalGame()
      let step = 0
      const step_interval = setInterval(() =>
      {
        setBoard(history[step])
        step += 1
        if (step >= history.length)
        {
          clearInterval(step_interval)
          round += 1
          setAutoRound(round)
          if (round >= ROUNDS)
          {
            timeoutRef.current = setTimeout(() =>
            {
              setResult('DRAW')
              setAutoplay(false)
            }, 500)
          }
          else
          {
            timeoutRef.current = setTimeout(playOne, 350)
          }
        }
      }, 220)
    }
    playOne()
  }

  const statusText = thinking
    ? 'WOPR IS THINKING...'
    : autoplay
      ? `WOPR VS WOPR — SIMULATION ${Math.min(autoRound + 1, 6)} / 6`
      : result === 'DRAW'
        ? 'DRAW.'
        : result === 'X'
          ? 'YOU WIN?! RECALCULATING...'
          : result === 'O'
            ? 'WOPR WINS.'
            : 'YOUR MOVE (X)'

  return (
    <div className="ttt">
      <div className="ttt-status">{statusText}</div>
      <div className={`ttt-board ${autoplay ? 'ttt-board--auto' : ''}`}>
        {board.map((cell, i) => (
          <button
            key={i}
            className={`ttt-cell ${cell ? `ttt-cell--${cell}` : ''}`}
            onClick={() => handleCellClick(i)}
            disabled={autoplay || thinking || !!result}
          >
            {cell}
          </button>
        ))}
      </div>

      {result && !autoplay && (
        <div className="ttt-controls">
          {result === 'DRAW' ? (
            <>
              <button onClick={reset}>PLAY AGAIN</button>
              <button onClick={runAutoplay}>LET WOPR PLAY ITSELF</button>
              <button onClick={() => onDone('draw')}>RETURN TO MENU</button>
            </>
          ) : (
            <>
              <button onClick={reset}>PLAY AGAIN</button>
              <button onClick={() => onDone(result === 'O' ? 'wopr' : 'you')}>
                RETURN TO MENU
              </button>
            </>
          )}
        </div>
      )}

      {!result && !autoplay && (
        <div className="ttt-hint">CLICK A SQUARE TO PLACE X</div>
      )}

      {autoplay && autoRound >= 6 && (
        <div className="ttt-hint">EVERY GAME ENDS THE SAME WAY.</div>
      )}
    </div>
  )
}
