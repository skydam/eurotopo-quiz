import MapQuiz from '@/components/MapQuiz'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            EuroTopo Quiz
          </h1>
          <p className="text-xl text-gray-600">
            Test your knowledge of European capital cities!
          </p>
        </div>
        <MapQuiz />
      </div>
    </main>
  )
}
