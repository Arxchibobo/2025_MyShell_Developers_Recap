
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

  // 抽奖相关状态
  const [showLottery, setShowLottery] = useState(false);
  const [lotteryWinner, setLotteryWinner] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);

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
      const botCount = res.matches.length;

      try {
        console.log('🚀 开始生成个性化内容...');
        console.log('📝 开发者名称:', searchName);
        console.log('🤖 Bot 数量:', botCount);
        console.log('🏷️  主要类别:', topTag);
        console.log('🔑 API Key 可用:', !!process.env.API_KEY);

        // 并行生成：开发者头像（Nana Banana Pro）+ 感谢信（Gemini）
        const [art, summary] = await Promise.all([
          generateFutureVision(searchName, botCount, topTag),
          generateArchetypeSummary(searchName, botCount, topTag)
        ]);

        console.log('✅ 头像生成结果:', art ? '成功' : '失败');
        console.log('✅ 感谢信生成结果:', summary ? summary.substring(0, 50) + '...' : '失败');

        setPersonalArt(art);
        setPersonalArchetype(summary || '');
      } catch (e) {
        console.error("❌ 个性化内容生成失败:", e);
      }
    }
    setIsProcessing(false);
  };

  // 检查是否已有中奖者
  useEffect(() => {
    const winner = localStorage.getItem('myshell_lottery_winner_2025');
    if (winner) {
      setLotteryWinner(winner);
    }
  }, []);

  // 隐藏触发器：连续点击 Logo 5 次
  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 5) {
      setShowLottery(true);
      setClickCount(0); // 重置计数
    }

    // 3 秒后自动重置计数
    setTimeout(() => {
      setClickCount(0);
    }, 3000);
  };

  // 抽奖逻辑
  const handleDrawLottery = () => {
    if (lotteryWinner) {
      alert(`已经有中奖者了！🎉\n中奖者：${lotteryWinner}`);
      return;
    }

    setIsDrawing(true);

    // 模拟抽奖动画（2秒）
    let animationCount = 0;
    const interval = setInterval(() => {
      const randomCreator = allCreators[Math.floor(Math.random() * allCreators.length)];
      setLotteryWinner(randomCreator);
      animationCount++;

      if (animationCount >= 20) {
        clearInterval(interval);

        // 最终随机选择一个开发者
        const finalWinner = allCreators[Math.floor(Math.random() * allCreators.length)];
        setLotteryWinner(finalWinner);
        localStorage.setItem('myshell_lottery_winner_2025', finalWinner);

        setIsDrawing(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 8000);
      }
    }, 100);
  };

  const Nav = () => (
    <nav className="fixed top-0 left-0 right-0 glass z-50 px-10 py-6 flex justify-between items-center border-b border-white/5">
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentPage(Page.Overview)}>
        <img
          src={MYSHELL_LOGO}
          alt="MyShell"
          className="h-6 opacity-90"
          onDoubleClick={handleSecretClick}
          title={clickCount > 0 ? `${clickCount}/5` : ''}
        />
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
          嘿，构建者们！2025 是我们共同开启的奇迹之年。感谢全社区 <span className="text-indigo-400 font-black">{stats.creators}</span> 位灵魂创作者，打造了 <span className="text-indigo-400 font-black">{stats.total}</span> 个璀璨的智慧结晶，用代码跨越星辰，用灵感重绘未来。<br/>
          这些创作不仅是属于你们的荣耀勋章，更是我们并肩铸就的 AI 辉煌新篇章！
        </p>
        <div className="flex justify-center gap-6 pt-12">
           <button onClick={() => setCurrentPage(Page.Creator)} className="px-16 py-6 bg-white text-black font-black rounded-full hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all text-[14px] uppercase tracking-[0.4em] active:scale-95">开启年度成就档案</button>
        </div>
      </header>

      {/* Community Stack (辞海堆叠 - 词云效果) */}
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

          {/* 词云拼贴效果 */}
          <div className="flex flex-wrap justify-center content-center gap-x-3 gap-y-2 relative z-10 max-h-[800px] overflow-y-auto scrollbar-hide py-8">
             {allCreators.map((name, i) => {
               // 随机生成样式参数
               const fontSize = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'][Math.floor(Math.random() * 6)];
               const fontWeight = ['font-medium', 'font-bold', 'font-black'][Math.floor(Math.random() * 3)];
               const rotation = (Math.random() - 0.5) * 8; // -4deg 到 4deg
               const colors = ['text-white/40', 'text-indigo-300/50', 'text-purple-300/50', 'text-blue-300/50', 'text-pink-300/40'];
               const hoverColors = ['hover:text-white', 'hover:text-indigo-400', 'hover:text-purple-400', 'hover:text-blue-400', 'hover:text-pink-400'];
               const colorIndex = Math.floor(Math.random() * colors.length);

               // 随机插入小图标
               const icons = ['✨', '🚀', '💫', '⭐', '🎨', '🔮', '💎', '🌟'];
               const shouldShowIcon = Math.random() > 0.85; // 15% 概率显示图标
               const icon = shouldShowIcon ? icons[Math.floor(Math.random() * icons.length)] : '';

               return (
                 <span
                   key={`${name}-${i}`}
                   className={`${fontSize} ${fontWeight} ${colors[colorIndex]} ${hoverColors[colorIndex]} transition-all duration-500 cursor-default select-none inline-block px-2 py-1 hover:scale-110 hover:text-glow`}
                   style={{
                     transform: `rotate(${rotation}deg)`,
                     transitionDelay: `${(i % 30) * 8}ms`,
                     textShadow: shouldShowIcon ? '0 0 15px rgba(99, 102, 241, 0.3)' : 'none'
                   }}
                 >
                   {icon && <span className="inline-block mr-1 text-sm opacity-60">{icon}</span>}
                   {name}
                 </span>
               );
             })}
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
          <div className="space-y-12 relative z-10">
            {/* 标题 */}
            <div className="space-y-6 border-b border-white/10 pb-8">
              <div className="flex items-center gap-6">
                <span className="text-indigo-400 text-[12px] font-black uppercase tracking-[0.8em]">A Legacy to Remember</span>
                <div className="h-[1px] flex-grow bg-white/10"></div>
              </div>
              <h3 className="text-3xl md:text-4xl font-light text-white">写给每一位 MyShell 开发者老师的一封感谢信</h3>
            </div>

            {/* 感谢信正文 */}
            <div className="space-y-8 text-lg md:text-xl leading-relaxed text-indigo-100/90 font-light">
              <p>各位 MyShell 的开发者老师们，</p>

              <p>想借这个机会，认真地跟大家说一声感谢。</p>

              <p>过去这一年，MyShell 能不断往前推进，靠的从来不只是某一个团队、某一个功能，更多是来自你们持续的投入、试错、打磨和坚持。无论是一个 agent 的反复调优，一次看似微小却关键的结构改进，还是在社区里主动分享经验、回答问题，这些都在实实在在地推动整个生态向前。</p>

              <p>某种意义上来说 ，我觉得这里能往前走得每一步，靠的都是大家彼此得信任和理解，并且是更加坚定的选择与支持。于此，我深感无以为报，只能尽我所能敬我所不能。</p>

              <p>我们很清楚，开发这件事并不总是顺利的。会遇到不稳定的接口、模糊的需求、尚在成长中的工具链，也会有反复推倒重来的时候。但正是在这些过程中，你们选择继续投入精力，把想法变成可用的产品，把概念变成真实被用户使用的东西。</p>

              <p>MyShell 想做的并不是一个"展示想法的平台"，而是一个能让创作者和开发者长期留下来、持续产出的地方。而这一点，是你们用行动一点点建立起来的。</p>

              <p>感谢你们对产品的耐心，对质量的坚持，也感谢你们愿意和我们一起，把事情做复杂、做深入、也尽量做正确。面对市场上游戏规则的不断改版，我们也曾不止一次的变化要求和偏好，让大家一次又一次的配合</p>

              <p>未来还有很多事情要做，系统会继续变化，规则也会不断迭代。但可以确定的是，我们会认真对待每一位开发者的投入，也希望 MyShell 能成为一个配得上你们付出的平台。</p>

              <p>我常在深夜也感到无力，认为配不上大家的努力和付出，自己个人能做得到的事情杯水车薪，不足为报，可总能得到大家的体谅和支持，每一个都磕一个的话好像飞机票确实有点贵了hh。</p>

              <p>这个时代赋予个人的能力开始变得越来越多，我也希望我能为大家做的事情可以越来越多。但大家都是普通的平凡人，摸着石头过河有时候是常态，或许彼此扶持才常胜将军吧。</p>

              <p className="text-indigo-300 italic font-serif text-2xl">愿彼此成就，愿星火燎原.</p>

              <p>再次感谢。</p>
            </div>

            {/* 署名 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 pt-12 border-t border-white/5">
              <div className="space-y-2">
                <div className="text-[14px] font-black text-white tracking-wide">bobo</div>
                <div className="text-[12px] text-indigo-400 tracking-wider">MyShell</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">2025.12</div>
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
                     <p className="text-2xl md:text-3xl leading-relaxed font-light text-indigo-100 italic font-serif">"{personalArchetype}"</p>
                  </div>
                )}

                {/* 如果生成失败，显示错误提示 */}
                {!personalArchetype && !isProcessing && (
                  <div className="glass p-16 rounded-[4rem] relative border-red-500/20 shadow-2xl">
                    <p className="text-xl text-red-400">
                      ⚠️ 感谢信生成失败，请检查 API Key 配置或网络连接
                    </p>
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
                  ) : isProcessing ? (
                    <div className="text-center p-20 space-y-8">
                       <div className="w-20 h-20 bg-indigo-500 rounded-full blur-3xl animate-pulse mx-auto"></div>
                       <h5 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.8em] animate-pulse">Rendering Achievement...</h5>
                    </div>
                  ) : (
                    <div className="text-center p-20 space-y-8">
                      <p className="text-xl text-red-400">⚠️ 头像生成失败</p>
                      <p className="text-sm text-gray-500">请检查 API 配置</p>
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

      {/* 抽奖弹窗 */}
      {showLottery && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[200] flex items-center justify-center p-8 animate-fade-in">
          <div className="glass max-w-2xl w-full p-16 rounded-[4rem] relative border-white/10 space-y-12 animate-slide-up">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowLottery(false)}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 标题 */}
            <div className="text-center space-y-4">
              <h2 className="text-6xl font-black text-white tracking-tighter">🎉 神秘抽奖 🎉</h2>
              <p className="text-xl text-indigo-300">从全体 {allCreators.length} 位开发者中抽取一位幸运星</p>
            </div>

            {/* 抽奖显示区域 */}
            <div className="glass p-12 rounded-[3rem] border-indigo-500/30 bg-indigo-500/5 min-h-[200px] flex items-center justify-center">
              {lotteryWinner ? (
                <div className="text-center space-y-6">
                  <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 animate-pulse">
                    {lotteryWinner}
                  </div>
                  {!isDrawing && (
                    <div className="text-3xl text-green-400 font-black animate-bounce">
                      🎊 恭喜中奖！🎊
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="text-4xl text-gray-500">等待抽奖...</div>
                  <p className="text-gray-600">双击顶部 Logo 可开启此功能</p>
                </div>
              )}
            </div>

            {/* 抽奖按钮 */}
            <div className="flex gap-6 justify-center">
              <button
                onClick={handleDrawLottery}
                disabled={isDrawing || (lotteryWinner !== null && !isDrawing)}
                className="px-16 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black rounded-full hover:shadow-[0_0_60px_rgba(251,191,36,0.6)] transition-all text-lg uppercase tracking-wider active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDrawing ? '抽奖中...' : lotteryWinner && !isDrawing ? '已有中奖者' : '🎲 开始抽奖'}
              </button>

              {lotteryWinner && !isDrawing && (
                <button
                  onClick={() => {
                    if (confirm('确定要清除中奖记录吗？这将允许重新抽奖。')) {
                      localStorage.removeItem('myshell_lottery_winner_2025');
                      setLotteryWinner(null);
                    }
                  }}
                  className="px-12 py-6 bg-red-500/20 text-red-400 font-black rounded-full hover:bg-red-500/30 transition-all text-lg uppercase tracking-wider active:scale-95 border border-red-500/30"
                >
                  重置
                </button>
              )}
            </div>

            {/* 说明文字 */}
            <div className="text-center text-sm text-gray-500 space-y-2">
              <p>⚠️ 本次抽奖全平台仅一位中奖者</p>
              <p className="text-xs">中奖信息存储在本地浏览器，清除缓存后可重置</p>
            </div>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 py-10 text-center glass border-t border-white/5 z-50">
          <div className="text-[10px] font-black tracking-[1em] text-white/20 uppercase italic">MyShell 2025 Ecosystem // Secure Legacy Archive</div>
      </footer>
    </div>
  );
};

export default App;
