import React from 'react';
import MapComponent from './components/MapComponent';

function App() {
  return (
    <div className="bg-slate-100 min-h-screen flex flex-col font-sans">
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <header className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              2026학년도 미림마이스터고 신입생 모집 현황 분석
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">2025.9.28. 기준</p>
          </header>
          <MapComponent />
        </div>
      </main>
      <footer className="text-center text-sm text-slate-500 py-6 leading-relaxed">
        <p>&copy; 2025 이대형. All rights reserved.</p>
        <p>Mirim Meister High School</p>
      </footer>
    </div>
  );
}

export default App;
