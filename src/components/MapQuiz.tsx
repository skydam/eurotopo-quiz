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
  const [language, setLanguage] = useState<'en' | 'nl'>('en')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const t = getTranslation(language)

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

  // Draw the map and markers
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

    // Draw markers for all capitals
    quizData.capitals.forEach(capital => {
      const x = capital.mapPosition.x * scaleX
      const y = capital.mapPosition.y * scaleY

      // Different colors based on difficulty
      let color = '#3b82f6' // blue for easy
      if (capital.difficulty === 'medium') color = '#f59e0b' // orange
      if (capital.difficulty === 'hard') color = '#ef4444' // red

      // Highlight current capital
      if (currentCapital && capital.id === currentCapital.id) {
        // Draw pulsing circle for current capital
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, 2 * Math.PI)
        ctx.fillStyle = '#10b981' // green
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
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

  // Redraw when current capital changes
  useEffect(() => {
    drawMap()
  }, [currentCapital, quizData, drawMap])

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
    } else {
      setFeedback(`${t.ui.incorrect} ${language === 'en' ? 'The capital of' : 'De hoofdstad van'} ${translatedCountry} ${language === 'en' ? 'is' : 'is'} ${translatedCapital}.`)
    }

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

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
              <span>{t.ui.easy}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
              <span>{t.ui.medium}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
              <span>{t.ui.hard}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              <span>{t.ui.currentQuestion}</span>
            </div>
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
                <h3 className="text-xl font-bold text-center mb-2">
                  {t.ui.whatIsCapital} {t.countries[currentCapital.country] || currentCapital.country}?
                </h3>
                <div className="text-sm text-gray-600 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    currentCapital.difficulty === 'easy' ? 'bg-blue-100 text-blue-800' :
                    currentCapital.difficulty === 'medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentCapital.difficulty.charAt(0).toUpperCase() + currentCapital.difficulty.slice(1)}
                  </span>
                  <span className="ml-2 text-gray-500">
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
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}