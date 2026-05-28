import { useEffect, useRef, useState } from 'react'
import './App.css'
import { MainMenu } from './components/MainMenu'
import { GameSession } from './components/GameSession'
import { SessionResults } from './components/SessionResults'
import { TournamentScreen } from './components/TournamentScreen'
import { TournamentResults } from './components/TournamentResults'
import { PlayerProfile } from './components/PlayerProfile'
import { BeltCeremony } from './components/BeltCeremony'
import { useGameStore } from './store/gameStore'
import { offlineCache } from './persistence/offlineCache'
import { calculateScore } from './logic/scoring'
import { evaluateProgression } from './logic/beltProgression'
import { Belt } from './types'
import type { PlayerProgress, ProgressionResult, TournamentResult } from './types'

/** Default player progress for new players */
const DEFAULT_PLAYER: PlayerProgress = {
  currentBelt: Belt.White,
  currentStripes: 0,
  totalSessions: 0,
  totalCorrect: 0,
  totalProblems: 0,
}

/** Default player ID for local-only mode */
const LOCAL_PLAYER_ID = 'local-player'

type AppScreen = 'menu' | 'game' | 'sessionResults' | 'tournament' | 'tournamentResults' | 'profile'

function App() {
  const player = useGameStore((s) => s.player)
  const setPlayer = useGameStore((s) => s.setPlayer)
  const setPlayerId = useGameStore((s) => s.setPlayerId)
  const setLoading = useGameStore((s) => s.setLoading)

  const [screen, setScreen] = useState<AppScreen>('menu')
  const [sessionResult, setSessionResult] = useState<ProgressionResult | null>(null)
  const [lastSessionScore, setLastSessionScore] = useState<{ correct: number; total: number; score: number } | null>(null)
  const [tournamentResult, setTournamentResult] = useState<TournamentResult | null>(null)
  const [showBeltCeremony, setShowBeltCeremony] = useState(false)
  const [ceremonyBelt, setCeremonyBelt] = useState<Belt>(Belt.White)

  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Initialize persistence and load saved progress on mount
  useEffect(() => {
    let mounted = true

    async function initApp() {
      setLoading(true)
      try {
        await offlineCache.init()

        // Try to load saved progress
        const savedProgress = await offlineCache.loadProgress(LOCAL_PLAYER_ID)
        if (mounted) {
          if (savedProgress) {
            setPlayer(savedProgress)
          } else {
            setPlayer(DEFAULT_PLAYER)
          }
          setPlayerId(LOCAL_PLAYER_ID)
        }
      } catch {
        // If persistence fails, start with defaults
        if (mounted) {
          setPlayer(DEFAULT_PLAYER)
          setPlayerId(LOCAL_PLAYER_ID)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initApp()

    return () => {
      mounted = false
    }
  }, [setPlayer, setPlayerId, setLoading])

  // Set up auto-save: subscribe to player progress changes in the store
  useEffect(() => {
    // Unsubscribe from previous subscription if any
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }

    unsubscribeRef.current = useGameStore.subscribe(
      (state, prevState) => {
        // Auto-save when player progress changes
        if (state.player && state.player !== prevState.player) {
          offlineCache.saveProgress(LOCAL_PLAYER_ID, state.player).catch(() => {
            // Silently fail - offline cache may not be available
          })
        }
      }
    )

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  // Handle navigation from main menu
  const handleMenuNavigate = (target: 'game' | 'tournament' | 'profile') => {
    setScreen(target)
  }

  // Handle game session completion
  const handleGameComplete = (correctCount: number, totalCount: number) => {
    const score = calculateScore(correctCount, totalCount)
    const currentPlayer = player ?? DEFAULT_PLAYER

    const progression = evaluateProgression(currentPlayer, {
      correctCount,
      totalCount,
      score,
    })

    // Update player in store
    setPlayer(progression.newProgress)

    // Store results for display
    setSessionResult(progression)
    setLastSessionScore({ correct: correctCount, total: totalCount, score })

    // Show results screen
    setScreen('sessionResults')

    // If belt promotion, show ceremony after a brief delay
    if (progression.beltPromotion && progression.newBelt !== undefined) {
      setCeremonyBelt(progression.newBelt)
      setShowBeltCeremony(true)
    }
  }

  // Handle tournament completion
  const handleTournamentComplete = (result: TournamentResult) => {
    setTournamentResult(result)
    setScreen('tournamentResults')
  }

  // Handle "Play Again" from results screens
  const handlePlayAgain = () => {
    setScreen('game')
    setSessionResult(null)
    setLastSessionScore(null)
  }

  // Handle "Main Menu" navigation
  const handleMainMenu = () => {
    setScreen('menu')
    setSessionResult(null)
    setLastSessionScore(null)
    setTournamentResult(null)
  }

  // Handle belt ceremony dismissal
  const handleCeremonyDismiss = () => {
    setShowBeltCeremony(false)
  }

  const currentBelt = player?.currentBelt ?? Belt.White
  const currentStripes = player?.currentStripes ?? 0

  const renderScreen = () => {
    switch (screen) {
      case 'menu':
        return (
          <MainMenu
            onNavigate={handleMenuNavigate}
            currentBelt={currentBelt}
            currentStripes={currentStripes}
          />
        )

      case 'game':
        return (
          <GameSession
            onComplete={handleGameComplete}
            onBack={handleMainMenu}
            currentBelt={currentBelt}
            currentStripes={currentStripes}
          />
        )

      case 'sessionResults':
        return (
          <SessionResults
            correctCount={lastSessionScore?.correct ?? 0}
            totalCount={lastSessionScore?.total ?? 10}
            score={lastSessionScore?.score ?? 0}
            stripeAwarded={sessionResult?.stripeAwarded ?? false}
            beltPromotion={sessionResult?.beltPromotion ?? false}
            newBelt={sessionResult?.newBelt}
            onPlayAgain={handlePlayAgain}
            onMainMenu={handleMainMenu}
          />
        )

      case 'tournament':
        return (
          <TournamentScreen
            onComplete={handleTournamentComplete}
            onBack={handleMainMenu}
            currentBelt={currentBelt}
            variant="championship"
          />
        )

      case 'tournamentResults':
        return tournamentResult ? (
          <TournamentResults
            result={tournamentResult}
            onPlayAgain={() => setScreen('tournament')}
            onMainMenu={handleMainMenu}
          />
        ) : null

      case 'profile':
        return (
          <PlayerProfile
            player={player ?? DEFAULT_PLAYER}
            onBack={handleMainMenu}
          />
        )
    }
  }

  return (
    <div className="app-shell">
      <main className="app-content">
        {renderScreen()}
      </main>

      {/* Belt Ceremony overlay */}
      {showBeltCeremony && (
        <BeltCeremony
          newBelt={ceremonyBelt}
          onDismiss={handleCeremonyDismiss}
        />
      )}
    </div>
  )
}

export default App
