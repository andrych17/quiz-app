import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-6">�</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Quiz Gereja Mawar Sharon
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Selamat datang di platform quiz interaktif untuk jemaat Gereja Mawar Sharon. Admin dapat membuat quiz, mengelola pertanyaan, dan memantau hasil peserta. Peserta dapat mengerjakan quiz dengan mudah tanpa registrasi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admin/login"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              <span className="mr-2">👤</span>
              Masuk Admin
            </Link>
            <a
              href="#features"
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold border border-gray-200"
            >
              <span className="mr-2">🔍</span>
              Lihat Fitur
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Create Quizzes</h3>
            <p className="text-gray-600">
              Build interactive multiple-choice quizzes with easy-to-use admin interface. Add questions, set correct answers, and manage options effortlessly.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Multiple Choice</h3>
            <p className="text-gray-600">
              Support for multiple-choice questions with up to 4 options per question. Perfect for assessments, surveys, and knowledge tests.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Track Results</h3>
            <p className="text-gray-600">
              Monitor participant attempts, view detailed scores, and export results to CSV for further analysis and reporting.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Share Easily</h3>
            <p className="text-gray-600">
              Generate unique quiz links to share with participants. No registration required for quiz takers - just click and start.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Time Control</h3>
            <p className="text-gray-600">
              Set expiration dates for quizzes to control access periods. Perfect for timed assignments and event-based assessments.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Secure Access</h3>
            <p className="text-gray-600">
              Each participant can only submit once per quiz using their NIJ. Prevents duplicate submissions and ensures data integrity.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Login as Admin</h3>
              <p className="text-sm text-gray-600">Access the admin dashboard with your credentials</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create Quiz</h3>
              <p className="text-sm text-gray-600">Add questions with multiple choice options</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Link</h3>
              <p className="text-sm text-gray-600">Publish and copy the generated quiz link</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">4️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">View Results</h3>
              <p className="text-sm text-gray-600">Monitor attempts and export data</p>
            </div>
          </div>
        </div>

  {/* Branding updated, demo credentials removed */}
      </div>
    </div>
  );
}
