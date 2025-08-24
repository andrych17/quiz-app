"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-spin"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Logo with bounce animation */}
        <div className="mb-8 animate-bounce">
          <div className="text-8xl mb-4 filter drop-shadow-lg">⛪</div>
        </div>

        {/* Title with slide-up animation */}
        <div className="transform transition-all duration-1000 ease-out animate-pulse">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Test Online
            </span>
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
            Gereja Mawar Sharon
          </h2>

          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Platform test online untuk jemaat GMS
          </p>
        </div>

        {/* CTA Button with pulse animation */}
        <div className="animate-pulse">
          <div className="inline-block">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-1">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-pointer">
                📝 Platform Test Online
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 text-4xl animate-bounce" style={{animationDelay: '0.5s'}}>📖</div>
        <div className="absolute top-32 right-16 text-3xl animate-pulse" style={{animationDelay: '1s'}}>✨</div>
        <div className="absolute bottom-20 left-20 text-3xl animate-bounce" style={{animationDelay: '1.5s'}}>🙏</div>
        <div className="absolute bottom-32 right-12 text-4xl animate-pulse" style={{animationDelay: '2s'}}>💙</div>
      </div>
    </div>
  );
}
