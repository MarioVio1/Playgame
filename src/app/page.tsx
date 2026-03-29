'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Caricamento...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-white mb-4">PLAYGAME</h1>
      <p className="text-xl text-purple-300">Test page - Basic rendering works!</p>
    </main>
  );
}
