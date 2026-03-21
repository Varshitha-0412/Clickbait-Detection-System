import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Search, Loader2, 
  AlertCircle, Link as LinkIcon, RefreshCcw, 
  History, Trash2, X, Zap, Info 
} from 'lucide-react';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // NEW: Real-time Blocked Counter State
  const [blockedCount, setBlockedCount] = useState(0);

  // Synchronize with Chrome Extension Storage
  useEffect(() => {
    const updateCount = () => {
      if (window.chrome && chrome.storage) {
        chrome.storage.local.get(['baitBlocked'], (res) => {
          setBlockedCount(res.baitBlocked || 0);
        });
      }
    };

    updateCount();
    const interval = setInterval(updateCount, 2000); // Poll every 2s
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const isUrl = input.trim().startsWith('http');
      const response = await fetch(`http://127.0.0.1:8000${isUrl ? '/analyze-url' : '/predict'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isUrl ? { url: input.trim() } : { headline: input.trim() }),
      });
      const data = await response.json();
      setResult(data);
      setHistory(prev => [{...data, id: Date.now()}, ...prev].slice(0, 10));
    } catch (err) {
      setError("AI Backend Offline. Ensure Uvicorn is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex overflow-hidden relative">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Dashboard */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-6 z-10">
        
        {/* --- NEURAL STATS HEADER --- */}
        <div className="w-full max-w-2xl flex gap-4 mb-10">
          <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(239,68,68,0.05)] animate-pulse">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><ShieldAlert size={20}/></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bait Blocked</p>
              <p className="text-2xl font-mono font-bold text-red-400">{blockedCount}</p>
            </div>
          </div>
          <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-cyan-500/20 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><Zap size={20}/></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Neural Sync</p>
              <p className="text-2xl font-mono font-bold text-cyan-400">ACTIVE</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-6xl font-black tracking-tighter text-white mb-2">Clickbait Detector</h1>
          <p className="text-slate-500 font-medium">Cybernetic Content Verification System</p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition"></div>
          <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 flex items-center">
            <input 
              className="w-full bg-transparent py-5 px-6 text-xl outline-none text-white font-light"
              placeholder="Paste headline or URL..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button onClick={handleAnalyze} className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-tighter hover:bg-cyan-400 transition-all">
              {loading ? <Loader2 className="animate-spin" /> : "Analyze"}
            </button>
          </div>
        </div>

        {/* Result Card */}
        {result && (
          <div className="mt-12 w-full max-w-2xl bg-[#0b1224] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom-5">
             <div className="flex justify-between items-center mb-6">
               <span className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${result.is_clickbait ? 'border-red-500/50 text-red-400' : 'border-cyan-500/50 text-cyan-400'}`}>
                 {result.label}
               </span>
               <span className="text-2xl font-mono text-white">{result.confidence}</span>
             </div>
             <h3 className="text-3xl font-bold text-white mb-6">"{result.headline}"</h3>
             <div className="flex flex-wrap gap-2">
               {result.reasons?.map((r, i) => (
                 <span key={i} className="text-[10px] bg-white/5 px-3 py-1 rounded-lg text-slate-400">{r}</span>
               ))}
             </div>
          </div>
        )}
      </main>

      {/* Sidebar Toggle */}
      <button onClick={() => setShowHistory(true)} className="fixed bottom-10 left-10 p-4 bg-slate-900 border border-white/10 rounded-full text-cyan-400 hover:scale-110 transition shadow-lg shadow-cyan-500/20">
        <History size={24} />
      </button>
    </div>
  );
}

export default App;