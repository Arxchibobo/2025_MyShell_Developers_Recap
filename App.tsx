
import React, { useState, useMemo } from 'react';
import { Page, BotRecord } from './types';
import { db } from './db';
import './data';
import { generateFutureVision, generateArchetypeSummary } from './services/geminiService';

const MYSHELL_LOGO = 'https://cdn.prod.website-files.com/67b6e9e9cc3bf11efbceec75/67e64a7cb6f1401a791ea912_myshell-logo-horizontal_base50-lightgray.png';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Overview);
  const [searchName, setSearchName] = useState('');
  const [creatorResults, setCreatorResults] = useState<{ matches: BotRecord[], suggestions: string[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [personalArt, setPersonalArt] = useState<string | null>(null);
  const [personalArchetype, setPersonalArchetype] = useState<string>('');
  
  const stats = useMemo(() => db.getStats(), []);

  const handlePersonalWrapped = async () => {
    if (!searchName.trim()) return;
    setIsProcessing(true);
    
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
    }

    const res = db.searchByCreator(searchName, 'fuzzy');
    setCreatorResults(res);

    if (res.matches.length > 0) {
      const topTag = res.matches[0].tags[0] || 'Innovation';
      try {
        const [art, summary] = await Promise.all([
          generateFutureVision(searchName, topTag),
          generateArchetypeSummary(searchName, res.matches.length, topTag)
        ]);
        setPersonalArt(art);
        setPersonalArchetype(summary || '');
      } catch (e) {
        console.error("Personalization failed", e);
      }
    }
    setIsProcessing(false);
  };

  const Nav = () => (
    <nav className="fixed top-0 left-0 right-0 glass z-50 px-10 py-6 flex justify-between items-center border-b border-white/5">
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentPage(Page.Overview)}>
        <img src={MYSHELL_LOGO} alt="MyShell" className="h-6 opacity-90" />
        <div className="w-[1px] h-4 bg-white/20"></div>
        <span className="text-[10px] text-indigo-300 font-black tracking-[0.4em] uppercase">2025 RECAP</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setCurrentPage(Page.Overview)} className={`px-6 py-2 rounded-full text-[11px] font-black transition-all uppercase ${currentPage === Page.Overview ? 'bg-indigo-500/20 text-indigo-100 border border-indigo-500/30' : 'text-gray-500 hover:text-gray-300'}`}>总览</button>
        <button onClick={() => setCurrentPage(Page.Creator)} className={`px-6 py-2 rounded-full text-[11px] font-black transition-all uppercase ${currentPage === Page.Creator ? 'bg-indigo-500/20 text-indigo-100 border border-indigo-500/30' : 'text-gray-500 hover:text-gray-300'}`}>成就查询</button>
      </div>
    </nav>
  );

  const renderOverview = () => (
    <div className="pt-40 pb-20 px-8 max-w-7xl mx-auto space-y-40">
      <header className="text-center space-y-12 animate-fade-in relative">
        <h1 className="text-8xl md:text-[11rem] font-black tracking-tighter leading-[0.9] text-white italic">
          MYSHELL<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-indigo-200 to-indigo-600 text-glow">RECAP 2025.</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed uppercase tracking-[0.2em] italic">
          2025 年，共计 {stats.creators} 位卓越创作者在此集结。<br/> 
          <span className="text-white font-bold">1168 个</span> 创意作品共同构筑了我们的未来。
        </p>
        <div className="flex justify-center gap-6 pt-12">
           <button onClick={() => setCurrentPage(Page.Creator)} className="px-12 py-5 bg-white text-black font-black rounded-full hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all text-[12px] uppercase tracking-[0.4em] active:scale-95">查询年度成就报告</button>
        </div>
      </header>

      {/* 社区感谢信 (恢复部分) */}
      <section className="glass p-20 rounded-[4rem] border-indigo-500/10 relative overflow-hidden max-w-5xl mx-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px]"></div>
        <div className="space-y-12 relative z-10">
          <div className="space-y-4">
            <h2 className="text-indigo-400 text-[12px] font-black uppercase tracking-[0.8em]">A Letter to Builders</h2>
            <div className="h-[2px] w-20 bg-indigo-500"></div>
          </div>
          <p className="text-3xl md:text-4xl font-light leading-snug text-indigo-50 italic font-serif">
            “2025 是充满奇迹的一年。1168 个 Bot，不仅仅是代码和提示词的堆砌，更是 227 颗跳动着创造力之心的结晶。每一行指令，每一个场景，都在重塑 AI 的边界。感谢每一位在深夜调试、在社区分享、在 MyShell 留下印记的开发者。未来已来，而你们是其最坚定的构建者。”
          </p>
          <div className="flex justify-between items-end border-t border-white/5 pt-10">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Official MyShell Recap Committee</div>
            <img src={MYSHELL_LOGO} className="h-4 opacity-30 grayscale" alt="" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-slide-up">
        <div className="glass p-20 rounded-[4rem] border-indigo-500/10 group relative overflow-hidden transition-all hover:scale-[1.02] hover:border-indigo-500/30 shadow-2xl text-center">
            <div className="absolute top-8 right-12 text-[9px] font-mono text-indigo-500/30 tracking-[0.4em] uppercase font-black">All Creations</div>
            <div className="text-[10rem] font-black mb-4 tabular-nums tracking-tighter text-white">1168</div>
            <div className="text-[14px] uppercase tracking-[0.6em] text-gray-500 font-black italic">年度创意产出总额</div>
        </div>
        <div className="glass p-20 rounded-[4rem] border-indigo-500/10 group relative overflow-hidden transition-all hover:scale-[1.02] hover:border-indigo-500/30 shadow-2xl text-center">
            <div className="absolute top-8 right-12 text-[9px] font-mono text-indigo-500/30 tracking-[0.4em] uppercase font-black">Community Souls</div>
            <div className="text-[10rem] font-black mb-4 tabular-nums tracking-tighter text-indigo-300">227</div>
            <div className="text-[14px] uppercase tracking-[0.6em] text-gray-500 font-black italic">核心创作者力量</div>
        </div>
      </div>
    </div>
  );

  const renderCreator = () => (
    <div className="pt-40 pb-20 px-8 max-w-7xl mx-auto space-y-24">
      <section className="text-center space-y-12">
        <h2 className="text-8xl md:text-[10rem] font-black italic tracking-tighter text-white drop-shadow-2xl uppercase">Legend.</h2>
        <div className="max-w-2xl mx-auto space-y-12 relative z-10">
          <input 
            type="text" 
            placeholder="输入您的 Handle (如: 彬子 或 金运)"
            className="w-full bg-transparent border-b-4 border-indigo-500/20 px-0 py-10 text-7xl font-black placeholder:text-indigo-500/10 focus:outline-none focus:border-indigo-400 transition-all text-center tracking-tighter uppercase text-indigo-100"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePersonalWrapped()}
          />
          <button 
            onClick={handlePersonalWrapped} 
            disabled={isProcessing}
            className="w-full py-8 bg-indigo-600 text-white font-black uppercase tracking-[0.8em] text-[12px] rounded-full hover:bg-indigo-500 transition-all shadow-[0_25px_60px_rgba(79,70,229,0.5)] active:scale-95"
          >
            {isProcessing ? '正在检索 1168 条记录...' : '开启我的年度回顾'}
          </button>
        </div>
      </section>

      {creatorResults && creatorResults.matches.length > 0 && (
        <div className="animate-fade-in space-y-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <div className="space-y-16">
                <div className="space-y-6 border-l-8 border-indigo-500 pl-12">
                  <h3 className="text-8xl font-black tracking-tighter uppercase italic text-white leading-none">{searchName}</h3>
                  <div className="text-indigo-400 text-[12px] font-black uppercase tracking-[0.8em] italic">Legacy Architect // MyShell 2025</div>
                </div>
                
                {personalArchetype && (
                  <div className="glass p-16 rounded-[4rem] relative border-indigo-500/20 shadow-[0_0_80px_rgba(99,102,241,0.2)]">
                     <p className="text-2xl md:text-3xl leading-relaxed font-light text-indigo-50 italic font-serif">“{personalArchetype}”</p>
                  </div>
                )}

                <div className="glass inline-block p-14 rounded-[3rem] border-indigo-500/10 shadow-2xl min-w-[300px] text-center">
                    <div className="text-9xl font-black mb-2 tabular-nums text-white leading-none">{creatorResults.matches.length}</div>
                    <div className="text-[12px] font-black uppercase tracking-[0.6em] text-indigo-400/60 mt-4">年度贡献作品总数</div>
                </div>
             </div>

             <div className="relative group">
                <div className="aspect-square glass rounded-[5rem] border-indigo-500/20 overflow-hidden shadow-[0_0_150px_rgba(99,102,241,0.3)] flex items-center justify-center relative">
                  {personalArt ? (
                    <img src={personalArt} className="w-full h-full object-cover animate-fade-in" alt={`${searchName}'s 2025 Trophy`} />
                  ) : (
                    <div className="text-center p-20">
                       <div className="w-16 h-16 bg-indigo-400 rounded-full blur-3xl animate-pulse mx-auto"></div>
                       <h5 className="text-[12px] font-black text-indigo-400/60 uppercase tracking-[0.8em] mt-12 animate-pulse italic">Manifesting your personal aura...</h5>
                    </div>
                  )}
                </div>
             </div>
          </div>

          <div className="glass p-24 rounded-[5rem] border-indigo-500/10 relative overflow-hidden shadow-inner">
             <div className="space-y-20 text-center">
               <h4 className="text-[14px] font-black tracking-[1em] text-indigo-400 uppercase italic">The Vault of Creations</h4>
               <div className="flex flex-wrap gap-x-16 gap-y-12 justify-center max-w-6xl mx-auto py-10">
                  {creatorResults.matches.map((b, idx) => (
                    <div key={idx} className="relative group/word transform transition-transform hover:scale-105">
                      <a href={b.myshellUrl} target="_blank" className={`block uppercase font-black tracking-tighter transition-all hover:text-white duration-300 ${
                        idx < 3 ? 'text-7xl text-indigo-50' : 
                        idx < 10 ? 'text-4xl text-indigo-300/70' : 'text-xl text-indigo-500/30'
                      }`}>
                        {b.botName}
                      </a>
                    </div>
                  ))}
               </div>
             </div>
          </div>
        </div>
      )}

      {creatorResults && creatorResults.matches.length === 0 && (
        <div className="text-center py-32 glass rounded-[4rem] border-dashed border-indigo-500/20 max-w-3xl mx-auto">
          <p className="text-indigo-400/60 uppercase tracking-[0.5em] font-black text-sm">未能匹配到 Handle: {searchName}</p>
          <p className="text-gray-600 text-xs mt-4 uppercase tracking-[0.2em]">请尝试以下可能的拼写：</p>
          <div className="mt-12 flex flex-wrap justify-center gap-6">
             {creatorResults.suggestions.length > 0 ? creatorResults.suggestions.map(s => (
               <button key={s} onClick={() => {setSearchName(s); handlePersonalWrapped();}} className="px-8 py-3 glass rounded-full text-[12px] font-black hover:bg-white hover:text-black transition-all uppercase tracking-widest">{s}</button>
             )) : <span className="text-gray-700 italic">No suggestions found.</span>}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-indigo-500 selection:text-white pb-60">
      <Nav />
      <main className="relative z-10">
        {currentPage === Page.Overview && renderOverview()}
        {currentPage === Page.Creator && renderCreator()}
      </main>
      <footer className="fixed bottom-0 left-0 right-0 py-10 text-center glass border-t border-white/5 z-50">
          <div className="text-[10px] font-black tracking-[0.8em] text-indigo-500/40 uppercase">Archived Forever in the MyShell Ecosystem // 2025</div>
      </footer>
    </div>
  );
};

export default App;
