
import React, { useState, useMemo, useEffect } from 'react';
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

const Particles = () => {
  const particles = useMemo(() => Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 15,
    delay: Math.random() * 20,
    opacity: Math.random() * 0.4 + 0.1
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 mix-blend-screen">
      <style>{`
        @keyframes festive-float {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          20% { opacity: var(--target-opacity); }
          80% { opacity: var(--target-opacity); }
          100% { transform: translate(-20px, -80px) rotate(45deg); opacity: 0; }
        }
      `}</style>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-indigo-300 blur-[0.5px] shadow-[0_0_8px_rgba(129,140,248,0.4)]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            '--target-opacity': p.opacity,
            animation: `festive-float ${p.duration}s infinite linear`,
            animationDelay: `-${p.delay}s`
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

const Confetti = () => {
  const pieces = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, 
      y: -10 - Math.random() * 20,
      size: Math.random() * 8 + 4,
      color: ['#6366f1', '#818cf8', '#fbbf24', '#f472b6', '#ffffff'][Math.floor(Math.random() * 5)],
      duration: Math.random() * 2 + 2,
      delay: Math.random() * 0.5,
      shape: Math.random() > 0.5 ? '50%' : '2px'
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <style>{`
        @keyframes fall-and-spin {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.shape,
            animation: `fall-and-spin ${p.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 10px ${p.color}`
          }}
        />
      ))}
    </div>
  );
};

const getCategoryIcon = (tag: string = '') => {
  const t = tag.toLowerCase();
  if (t.includes('tool') || t.includes('工具')) return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  );
  if (t.includes('game') || t.includes('整活') || t.includes('video') || t.includes('视频')) return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  );
  if (t.includes('ip') || t.includes('role') || t.includes('anime') || t.includes('beauty')) return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  );
  // Default Sparkles
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
  );
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Overview);
  const [searchName, setSearchName] = useState('');
  const [creatorResults, setCreatorResults] = useState<{ matches: BotRecord[], suggestions: string[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [personalArt, setPersonalArt] = useState<string | null>(null);
  const [personalArchetype, setPersonalArchetype] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  
  const stats = useMemo(() => db.getStats(), []);
  
  const allCreators = useMemo(() => {
    const bots = db.getAllBots();
    const unique = Array.from(new Set(bots.map(b => b.developer)));
    return unique.sort((a, b) => a.localeCompare(b));
  }, []);

  // 页面切换平滑滚动
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handlePersonalWrapped = async () => {
    if (!searchName.trim()) return;
    setIsProcessing(true);
    setPersonalArt(null);
    setPersonalArchetype('');
    setShowConfetti(false); // Reset before new search
    
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
    }

    const res = db.searchByCreator(searchName, 'fuzzy');
    setCreatorResults(res);

    if (res.matches.length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Auto hide after 5s

      const topTag = res.matches[0].tags[0] || 'AI';
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
        <span className="text-[10px] text-indigo-300 font-black tracking-[0.4em] uppercase">2025 ARCHIVE</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setCurrentPage(Page.Overview)} className={`px-6 py-2 rounded-full text-[11px] font-black transition-all uppercase ${currentPage === Page.Overview ? 'bg-indigo-500/20 text-indigo-100 border border-indigo-500/30' : 'text-gray-500 hover:text-gray-300'}`}>总览</button>
        <button onClick={() => setCurrentPage(Page.Creator)} className={`px-6 py-2 rounded-full text-[11px] font-black transition-all uppercase ${currentPage === Page.Creator ? 'bg-indigo-500/20 text-indigo-100 border border-indigo-500/30' : 'text-gray-500 hover:text-gray-300'}`}>成就查询</button>
      </div>
    </nav>
  );

  const renderOverview = () => (
    <div className="pt-40 pb-20 px-8 max-w-7xl mx-auto space-y-48 relative">
      <Particles />
      <header className="text-center space-y-12 animate-fade-in relative z-10">
        <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter leading-[0.85] text-white italic">
          MYSHELL<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-indigo-200 to-indigo-600 text-glow">RECAP 2025.</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-light max-w-4xl mx-auto leading-relaxed uppercase tracking-[0.2em] italic">
          嘿，构建者们！2025 是我们共同开启的奇迹之年。感谢全社区 {stats.creators} 位灵魂创作者，在 {stats.total} 个日夜里用代码跨越星辰，用灵感重绘未来。<br/> 
          这一个个璀璨的智慧结晶，不仅是属于你们的荣耀勋章，更是我们并肩铸就的 AI 辉煌新篇章！
        </p>
        <div className="flex justify-center gap-6 pt-12">
           <button onClick={() => setCurrentPage(Page.Creator)} className="px-16 py-6 bg-white text-black font-black rounded-full hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all text-[14px] uppercase tracking-[0.4em] active:scale-95">开启年度成就档案</button>
        </div>
      </header>

      {/* Community Stack (辞海堆叠) */}
      <section className="relative max-w-6xl mx-auto animate-slide-up relative z-10 px-4">
        <div className="text-center mb-16 space-y-4">
           <div className="flex items-center justify-center gap-4 mb-8">
             <div className="h-[1px] w-20 bg-indigo-500/30"></div>
             <h2 className="text-indigo-400 text-xs font-black uppercase tracking-[0.8em]">The 2025 Builders</h2>
             <div className="h-[1px] w-20 bg-indigo-500/30"></div>
           </div>
           <div className="text-4xl md:text-5xl font-black text-white italic tracking-tight uppercase">
              {stats.creators} Architects of Intelligence
           </div>
        </div>
        
        <div className="glass p-12 md:p-16 rounded-[3rem] border-white/5 relative overflow-hidden shadow-2xl group">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
          
          <div className="flex flex-wrap justify-center content-center gap-x-4 gap-y-3 relative z-10 max-h-[800px] overflow-y-auto scrollbar-hide py-4">
             {allCreators.map((name, i) => (
                <span 
                  key={name} 
                  className="text-lg md:text-2xl font-black text-white/30 hover:text-white hover:text-glow transition-all duration-300 cursor-default select-none uppercase italic"
                  style={{ 
                    transitionDelay: `${(i % 20) * 10}ms`,
                    opacity: 0.2 + Math.random() * 0.5 
                  }}
                >
                  {name}
                </span>
             ))}
             {allCreators.length === 0 && <span className="text-white/40 italic">Waiting for data injection...</span>}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent pointer-events-none"></div>
        </div>
      </section>

      {/* 社区感谢信 */}
      <section className="relative max-w-5xl mx-auto animate-slide-up relative z-10">
        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[5rem] blur-2xl opacity-30"></div>
        <div className="glass p-16 md:p-24 rounded-[4rem] border-white/10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px]"></div>
          <div className="space-y-16 relative z-10">
            <div className="flex items-center gap-6">
              <span className="text-indigo-400 text-[12px] font-black uppercase tracking-[0.8em]">A Legacy to Remember</span>
              <div className="h-[1px] flex-grow bg-white/10"></div>
            </div>
            
            <p className="text-4xl md:text-5xl font-light leading-tight text-white italic font-serif tracking-tight">
              “2025 年是属于构建者的一年。在 MyShell，我们见证了从 0 到 {stats.total} 的跨越。每一个 Bot 都是一段独特的对话，每一个指令都是创意的火种。感谢 {stats.creators} 位开发者，你们不仅在编写代码，更是在编写未来。”
            </p>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 pt-12 border-t border-white/5">
              <div className="space-y-2">
                <div className="text-[12px] font-black text-white uppercase tracking-widest">MyShell Recap Committee</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Signed with Code & Creativity // 2025.12</div>
              </div>
              <img src={MYSHELL_LOGO} className="h-5 opacity-40 grayscale brightness-200" alt="MyShell Logo" />
            </div>
          </div>
        </div>
      </section>

      {/* 统计核心数据 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto relative z-10">
        <div className="glass p-20 rounded-[4rem] border-white/5 group hover:border-indigo-500/20 transition-all duration-700 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 text-[12rem] font-black text-white/[0.02] pointer-events-none">BOTS</div>
            <div className="text-[11rem] font-black tracking-tighter text-white mb-4 leading-none">{stats.total}</div>
            <div className="text-[14px] uppercase tracking-[0.6em] text-indigo-400 font-black italic">年度智能产出总数</div>
        </div>
        <div className="glass p-20 rounded-[4rem] border-white/5 group hover:border-indigo-500/20 transition-all duration-700 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 text-[12rem] font-black text-white/[0.02] pointer-events-none">DEVS</div>
            <div className="text-[11rem] font-black tracking-tighter text-indigo-400 mb-4 leading-none">{stats.creators}</div>
            <div className="text-[14px] uppercase tracking-[0.6em] text-gray-500 font-black italic">活跃创作者 Handle</div>
        </div>
      </div>
    </div>
  );

  const renderCreator = () => (
    <div className="pt-40 pb-20 px-8 max-w-7xl mx-auto space-y-32">
      <section className="text-center space-y-16">
        <div className="space-y-4">
          <span className="text-indigo-400 text-sm font-black uppercase tracking-[1em] block">Legacy Search</span>
          <h2 className="text-8xl md:text-[10rem] font-black italic tracking-tighter text-white uppercase leading-none">The Architect.</h2>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-12 relative">
          <input 
            type="text" 
            placeholder="输入您的开发者 Handle (如: 彬子)"
            className="w-full bg-transparent border-b-4 border-indigo-500/20 px-0 py-12 text-7xl md:text-8xl font-black placeholder:text-white/5 focus:outline-none focus:border-indigo-500 transition-all text-center tracking-tighter uppercase text-white selection:bg-indigo-500"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePersonalWrapped()}
          />
          <button 
            onClick={handlePersonalWrapped} 
            disabled={isProcessing}
            className="w-full py-10 bg-indigo-600 text-white font-black uppercase tracking-[1em] text-[14px] rounded-full hover:bg-indigo-500 transition-all shadow-[0_30px_70px_rgba(79,70,229,0.4)] active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? '检索年度档案中...' : '生成我的年度总结'}
          </button>
        </div>
      </section>

      {creatorResults && creatorResults.matches.length > 0 && (
        <div className="animate-fade-in space-y-48">
          {/* 顶部英雄版块 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <div className="space-y-20">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-[2px] bg-indigo-500"></div>
                    <span className="text-indigo-400 text-sm font-black uppercase tracking-[0.6em]">Validated Builder</span>
                  </div>
                  <h3 className="text-9xl font-black tracking-tighter uppercase italic text-white leading-none">{searchName}</h3>
                </div>
                
                {personalArchetype && (
                  <div className="glass p-16 rounded-[4rem] relative border-indigo-500/20 shadow-2xl">
                     <p className="text-2xl md:text-3xl leading-relaxed font-light text-indigo-100 italic font-serif">“{personalArchetype}”</p>
                  </div>
                )}

                <div className="flex gap-12 items-center">
                    <div className="glass p-12 rounded-[3rem] border-white/5 flex flex-col items-center min-w-[200px]">
                        <div className="text-8xl font-black text-white leading-none">{creatorResults.matches.length}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-4">Total Creations</div>
                    </div>
                    <div className="text-gray-500 text-[12px] uppercase tracking-widest leading-loose font-medium">
                      在 2025 年的每一天<br/>
                      你都在用代码<br/>
                      绘制属于自己的星图
                    </div>
                </div>
             </div>

             <div className="relative group">
                <div className="aspect-square glass rounded-[6rem] border-white/10 overflow-hidden shadow-[0_0_120px_rgba(99,102,241,0.2)] flex items-center justify-center relative">
                  {personalArt ? (
                    <img src={personalArt} className="w-full h-full object-cover animate-fade-in" alt="Annual Achievement" />
                  ) : (
                    <div className="text-center p-20 space-y-8">
                       <div className="w-20 h-20 bg-indigo-500 rounded-full blur-3xl animate-pulse mx-auto"></div>
                       <h5 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.8em] animate-pulse">Rendering Achievement...</h5>
                    </div>
                  )}
                </div>
             </div>
          </div>

          {/* 作品展示墙 - Vault of Creations */}
          <div className="space-y-20">
             <div className="flex items-center gap-8">
               <h4 className="text-[14px] font-black tracking-[1em] text-indigo-400 uppercase">The Vault of Creations</h4>
               <div className="h-[1px] flex-grow bg-white/5"></div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {creatorResults.matches.map((bot, idx) => (
                  <a 
                    key={bot.myshellUrl} 
                    href={bot.myshellUrl} 
                    target="_blank" 
                    className="glass group p-8 rounded-[2rem] border-white/5 hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full bg-gradient-to-br from-white/[0.02] to-transparent"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                          {getCategoryIcon(bot.tags[0])}
                      </div>
                      <div className="text-[10px] font-mono text-gray-500 bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
                          {bot.launchDate}
                      </div>
                    </div>

                    <div className="flex-grow space-y-4">
                       <h3 className="text-sm font-bold text-white/90 group-hover:text-indigo-400 transition-colors tracking-wide leading-loose" style={{ fontFamily: "'Microsoft YaHei', sans-serif" }}>
                         {bot.botName}
                       </h3>
                       {bot.note && (
                         <p className="text-[11px] text-gray-400/80 font-light leading-[2] border-t border-dashed border-white/10 pt-4" style={{ fontFamily: "'Microsoft YaHei', sans-serif" }}>
                           {bot.note}
                         </p>
                       )}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-2 pt-4">
                      {bot.tags.map(tag => (
                        <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/5 text-[10px] text-gray-400 font-medium border border-white/5 group-hover:border-indigo-500/30 transition-colors">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </a>
                ))}
             </div>
          </div>
        </div>
      )}

      {creatorResults && creatorResults.matches.length === 0 && (
        <div className="text-center py-40 glass rounded-[5rem] border-dashed border-white/10 max-w-4xl mx-auto space-y-12">
          <div className="space-y-4">
            <p className="text-indigo-400 text-lg font-black uppercase tracking-[0.5em]">未在 2025 档案中发现 Handle: {searchName}</p>
            <p className="text-gray-500 text-sm uppercase tracking-[0.2em] font-light italic">请核对拼写或尝试以下建议名单</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 px-12">
             {creatorResults.suggestions.length > 0 ? creatorResults.suggestions.map(s => (
               <button 
                key={s} 
                onClick={() => {setSearchName(s); handlePersonalWrapped();}} 
                className="px-10 py-4 glass rounded-full text-[13px] font-black hover:bg-white hover:text-black transition-all uppercase tracking-widest border-white/5"
               >
                {s}
               </button>
             )) : <span className="text-gray-700 font-mono italic">No matches in current vault.</span>}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-indigo-500 selection:text-white pb-60 font-sans">
      <Nav />
      {showConfetti && <Confetti />}
      <main className="relative z-10">
        {currentPage === Page.Overview && renderOverview()}
        {currentPage === Page.Creator && renderCreator()}
      </main>
      <footer className="fixed bottom-0 left-0 right-0 py-10 text-center glass border-t border-white/5 z-50">
          <div className="text-[10px] font-black tracking-[1em] text-white/20 uppercase italic">MyShell 2025 Ecosystem // Secure Legacy Archive</div>
      </footer>
    </div>
  );
};

export default App;
