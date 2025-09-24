'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { getTranslation } from '@/utils/translations'

interface Capital {
  id: string
  country: string
  capital: string
  coordinates: {
    lat: number
    lng: number
  }
  region: string
  population: number
  area: number
  flag: string
  alternativeSpellings: string[]
  mapPosition: {
    x: number
    y: number
    confidence: string
  }
  difficulty: string
  offMap?: boolean
}

interface QuizData {
  mapDimensions: {
    width: number
    height: number
  }
  capitals: Capital[]
  metadata: {
    totalCapitals: number
    calibratedPoints: number
    excludedCapitals: number
    mapBounds: {
      minX: number
      maxX: number
      minY: number
      maxY: number
    }
    generatedAt: string
  }
}

export default function MapQuiz() {
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [currentCapital, setCurrentCapital] = useState<Capital | null>(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  // const [gameMode, setGameMode] = useState<'practice' | 'quiz'>('practice') // Future feature
  const [showAnswer, setShowAnswer] = useState(false)
  const [language, setLanguage] = useState<'en' | 'nl'>('nl')
  const [questionHistory, setQuestionHistory] = useState<boolean[]>([]) // Track correct/incorrect for last 20 questions
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0) // Track consecutive correct answers
  const [showCelebration, setShowCelebration] = useState(false) // Show celebration video
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const animationRef = useRef<number | null>(null)
  const pulseRef = useRef({ size: 12, growing: true, opacity: 1, time: 0 })

  const t = getTranslation(language)

  // Calculate rolling score (average of last 20 questions, or all questions if less than 20)
  const calculateRollingScore = useCallback(() => {
    if (questionHistory.length === 0) return 0
    const recentQuestions = questionHistory.slice(-20) // Last 20 questions
    const correctCount = recentQuestions.filter(correct => correct).length
    return Math.round((correctCount / recentQuestions.length) * 100)
  }, [questionHistory])

  // Load quiz data
  useEffect(() => {
    fetch('/quizCapitals.json')
      .then(response => response.json())
      .then((data: QuizData) => {
        setQuizData(data)
        selectRandomCapital(data.capitals)
      })
      .catch(error => console.error('Error loading quiz data:', error))
  }, [])

  // Select a random capital for the quiz
  const selectRandomCapital = (capitals: Capital[]) => {
    const randomIndex = Math.floor(Math.random() * capitals.length)
    setCurrentCapital(capitals[randomIndex])
    setUserAnswer('')
    setFeedback('')
    setShowAnswer(false)
  }

  // Draw the map and markers with animation
  const drawMap = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || !quizData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw the map image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height)

    // Calculate scale factors
    const scaleX = canvas.width / quizData.mapDimensions.width
    const scaleY = canvas.height / quizData.mapDimensions.height

    // Draw markers for all capitals (skip off-map cities)
    quizData.capitals.forEach(capital => {
      // Skip cities that are off the map
      if (capital.offMap) return;

      const x = capital.mapPosition.x * scaleX
      const y = capital.mapPosition.y * scaleY

      // Standard blue color for all markers
      const color = '#3b82f6' // blue

      // Highlight current capital with animation
      if (currentCapital && capital.id === currentCapital.id) {
        const pulse = pulseRef.current

        // Draw glow effect
        ctx.save()
        ctx.shadowBlur = 15 + (pulse.size - 12) * 2
        ctx.shadowColor = '#10b981'

        // Draw animated pulsing circle
        ctx.beginPath()
        ctx.arc(x, y, pulse.size, 0, 2 * Math.PI)
        ctx.fillStyle = `rgba(16, 185, 129, ${pulse.opacity})` // green with animated opacity
        ctx.fill()

        // Draw outer ring
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.stroke()

        // Draw inner circle
        ctx.beginPath()
        ctx.arc(x, y, pulse.size * 0.6, 0, 2 * Math.PI)
        ctx.fillStyle = '#ffffff'
        ctx.fill()

        ctx.restore()

        // Draw expanding ripple effect
        const rippleRadius = 20 + (pulse.time % 100) * 0.5
        const rippleOpacity = Math.max(0, 1 - (pulse.time % 100) / 100)
        ctx.beginPath()
        ctx.arc(x, y, rippleRadius, 0, 2 * Math.PI)
        ctx.strokeStyle = `rgba(16, 185, 129, ${rippleOpacity * 0.5})`
        ctx.lineWidth = 2
        ctx.stroke()
      } else {
        // Draw normal marker
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, 2 * Math.PI)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }, [quizData, currentCapital])

  // Handle image load
  const handleImageLoad = () => {
    drawMap()
  }

  // Animation loop for pulsing effect
  const animate = useCallback(() => {
    const pulse = pulseRef.current

    // Update pulse size
    if (pulse.growing) {
      pulse.size += 0.15
      if (pulse.size >= 16) {
        pulse.growing = false
      }
    } else {
      pulse.size -= 0.15
      if (pulse.size <= 10) {
        pulse.growing = true
      }
    }

    // Update opacity for breathing effect
    pulse.opacity = 0.7 + Math.sin(pulse.time * 0.05) * 0.3

    // Increment time for ripple effect
    pulse.time += 2

    drawMap()
    animationRef.current = requestAnimationFrame(animate)
  }, [drawMap])

  // Start/stop animation when current capital changes
  useEffect(() => {
    if (currentCapital && !showAnswer) {
      // Start animation
      pulseRef.current = { size: 12, growing: true, opacity: 1, time: 0 }
      animationRef.current = requestAnimationFrame(animate)
    } else {
      // Stop animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      drawMap()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [currentCapital, showAnswer, animate, drawMap])

  // Handle answer submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentCapital || !quizData) return

    const userAnswerLower = userAnswer.toLowerCase().trim()
    const correctAnswerEn = currentCapital.capital.toLowerCase()
    const correctAnswerNl = t.capitals[currentCapital.capital]?.toLowerCase() || correctAnswerEn
    const alternativeSpellings = currentCapital.alternativeSpellings.map(s => s.toLowerCase())

    const translatedCountry = t.countries[currentCapital.country] || currentCapital.country
    const translatedCapital = t.capitals[currentCapital.capital] || currentCapital.capital

    const isCorrect = userAnswerLower === correctAnswerEn ||
                     userAnswerLower === correctAnswerNl ||
                     alternativeSpellings.includes(userAnswerLower) ||
                     correctAnswerEn.includes(userAnswerLower) ||
                     correctAnswerNl.includes(userAnswerLower) ||
                     userAnswerLower.includes(correctAnswerEn) ||
                     userAnswerLower.includes(correctAnswerNl)

    if (isCorrect) {
      setScore(score + 1)
      setFeedback(`${t.ui.correct} ${translatedCapital} ${language === 'en' ? 'is the capital of' : 'is de hoofdstad van'} ${translatedCountry}.`)

      // Track consecutive correct answers
      const newConsecutiveCorrect = consecutiveCorrect + 1
      setConsecutiveCorrect(newConsecutiveCorrect)

      // Show celebration video at 15 consecutive correct answers
      if (newConsecutiveCorrect === 15) {
        setShowCelebration(true)
      }
    } else {
      setFeedback(`${t.ui.incorrect} ${language === 'en' ? 'The capital of' : 'De hoofdstad van'} ${translatedCountry} ${language === 'en' ? 'is' : 'is'} ${translatedCapital}.`)
      // Reset consecutive counter on incorrect answer
      setConsecutiveCorrect(0)
    }

    // Update question history (keep last 20 questions)
    setQuestionHistory(prev => {
      const newHistory = [...prev, isCorrect]
      return newHistory.slice(-20) // Keep only last 20
    })

    setTotalQuestions(totalQuestions + 1)
    setShowAnswer(true)

    // Auto-advance after 2 seconds
    setTimeout(() => {
      selectRandomCapital(quizData.capitals)
    }, 2000)
  }

  // Skip current question
  const handleSkip = () => {
    if (!quizData) return

    // Track skip as incorrect for the graph
    setQuestionHistory(prev => {
      const newHistory = [...prev, false] // Skip counts as incorrect
      return newHistory.slice(-20) // Keep only last 20
    })

    // Reset consecutive counter on skip
    setConsecutiveCorrect(0)

    selectRandomCapital(quizData.capitals)
    setTotalQuestions(totalQuestions + 1)
  }

  if (!quizData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{t.ui.title}</h2>
            <p className="text-blue-100">{t.ui.score}: {score} / {totalQuestions}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-blue-100">{t.ui.totalCapitals}: {quizData.metadata.totalCapitals}</p>
              <p className="text-blue-100">{t.ui.accuracy}: {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%</p>
              <p className="text-blue-100">{language === 'en' ? 'Streak' : 'Reeks'}: {consecutiveCorrect}/15</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm mb-1">{t.ui.language}</p>
              <button
                onClick={() => setLanguage(language === 'en' ? 'nl' : 'en')}
                className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
              >
                {language === 'en' ? '🇳🇱 NL' : '🇬🇧 EN'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Map Container */}
        <div className="lg:w-2/3 p-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '8505/10206' }}>
            <Image
              ref={imageRef}
              src="/map.png"
              alt="Map of Europe"
              fill
              className="object-contain"
              onLoad={handleImageLoad}
            />
            <canvas
              ref={canvasRef}
              width={850}
              height={1020}
              className="absolute inset-0 w-full h-full"
              style={{ aspectRatio: '8505/10206' }}
            />
          </div>

        </div>

        {/* Quiz Panel */}
        <div className="lg:w-1/3 p-6 bg-gray-50">
          {currentCapital && (
            <>
              <div className="mb-6">
                <div className="text-center mb-4">
                  <span className="text-4xl" role="img" aria-label={currentCapital.country}>
                    {currentCapital.flag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-center mb-2 text-gray-900">
                  {t.ui.whatIsCapital} {t.countries[currentCapital.country] || currentCapital.country}?
                  {currentCapital.offMap && (
                    <div className="text-sm text-orange-600 font-medium mt-1">
                      ({t.ui.notOnMap})
                    </div>
                  )}
                </h3>
                <div className="text-sm text-gray-600 text-center">
                  <span className="text-gray-500">
                    {t.ui.population}: {currentCapital.population ? currentCapital.population.toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>

              {!showAnswer ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder={t.ui.enterCapital}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!userAnswer.trim()}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {t.ui.submitAnswer}
                    </button>
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                      {t.ui.skip}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    feedback.startsWith('Correct') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <p className="font-medium">{feedback}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>{t.ui.region}:</strong> {currentCapital.region}</p>
                    <p><strong>{t.ui.area}:</strong> {currentCapital.area ? currentCapital.area.toLocaleString() : 'N/A'} km²</p>
                    <p><strong>{t.ui.coordinates}:</strong> {currentCapital.coordinates.lat.toFixed(2)}°N, {Math.abs(currentCapital.coordinates.lng).toFixed(2)}°{currentCapital.coordinates.lng >= 0 ? 'E' : 'W'}</p>
                  </div>
                  <p className="text-sm text-gray-500">{t.ui.nextQuestion}</p>
                </div>
              )}

              {/* Rolling Score Graph */}
              {questionHistory.length > 0 && (
                <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {language === 'en' ? 'Rolling Score' : 'Lopende Score'}
                  </h4>
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {calculateRollingScore()}%
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({questionHistory.length < 20
                        ? `${language === 'en' ? 'Last' : 'Laatste'} ${questionHistory.length}`
                        : `${language === 'en' ? 'Last 20' : 'Laatste 20'}`}
                      {language === 'en' ? ' questions' : ' vragen'})
                    </span>
                  </div>

                  {/* Simple bar chart visualization */}
                  <div className="space-y-1">
                    {questionHistory.slice(-Math.min(20, questionHistory.length)).map((correct, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="text-xs text-gray-400 w-6">
                          {questionHistory.length - Math.min(20, questionHistory.length) + index + 1}
                        </div>
                        <div className={`h-4 w-4 rounded-sm ${correct ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div className="text-xs text-gray-600">
                          {correct ? (language === 'en' ? 'Correct' : 'Juist') : (language === 'en' ? 'Incorrect' : 'Fout')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Celebration Video Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full h-full max-w-4xl max-h-3xl flex items-center justify-center">
            <video
              autoPlay
              className="w-full h-full object-contain"
              onEnded={() => {
                setShowCelebration(false)
                setConsecutiveCorrect(0) // Reset counter after video
              }}
            >
              <source src="/celebration.mp4" type="video/mp4" />
            </video>
            <button
              onClick={() => {
                setShowCelebration(false)
                setConsecutiveCorrect(0) // Reset counter when manually closed
              }}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}