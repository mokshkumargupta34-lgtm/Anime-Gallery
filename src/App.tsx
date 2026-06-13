import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { 
  Swords, Sparkles, Filter, ArrowUpDown, X, Zap, Shield, Trophy, 
  Heart, RotateCcw, Copy, Check, ExternalLink, Flame, Info, Eye, Compass
} from "lucide-react";
import { CHARACTERS } from "./data";
import { Character } from "./types";
import CharacterCard from "./components/CharacterCard";
import ScrollScrubHero from "./components/ScrollScrubHero";

export default function App() {
  const [selectedSeries, setSelectedSeries] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  // VS Battle simulator state inside the details card
  const [vsOpponentId, setVsOpponentId] = useState<string>("");
  const [isBattleRunning, setIsBattleRunning] = useState<boolean>(false);
  const [battleReport, setBattleReport] = useState<string[]>([]);
  const [battleWinner, setBattleWinner] = useState<Character | null>(null);

  // Initial loader state
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Parallax scroll variable for hero
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    // 1.5 seconds high-spec retro loader animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    const handleScroll = () => {
      // 1. General scroll progress
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Filter series names
  const allSeries = ["ALL", ...Array.from(new Set(CHARACTERS.map(c => c.series)))];

  // Filtering + Sorting formula
  const processedCharacters = CHARACTERS.filter(char => {
    const matchesSeries = selectedSeries === "ALL" || char.series === selectedSeries;
    const matchesSearch = 
      char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.series.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeries && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "power") {
      return b.stats.power - a.stats.power;
    }
    if (sortBy === "speed") {
      return b.stats.speed - a.stats.speed;
    }
    if (sortBy === "technique") {
      return b.stats.technique - a.stats.technique;
    }
    if (sortBy === "popularity") {
      return b.stats.popularity - a.stats.popularity;
    }
    return 0; // default sort (as defined in data.ts)
  });

  // Execute VS Battle Logic
  const handleVsBattle = (char1: Character, opponentId: string) => {
    const char2 = CHARACTERS.find(c => c.id === opponentId);
    if (!char2) return;

    setIsBattleRunning(true);
    setBattleReport(["GATHERING POWER CORES... ⚡", "INITIATING COSMIC DIMENSION FUSION... 🔥"]);
    
    setTimeout(() => {
      const logs = [];
      logs.push(`🚨 CLASH REGISTERED: ${char1.name.toUpperCase()} VS ${char2.name.toUpperCase()}!`);
      
      // Compute round comparisons
      let char1Wins = 0;
      let char2Wins = 0;

      // Round 1: Power
      logs.push(`[ROUND 1 // DESTRUCTIVE RAW POWER]`);
      if (char1.stats.power !== char2.stats.power) {
        const powerWinner = char1.stats.power > char2.stats.power ? char1 : char2;
        logs.push(`🥊 ${powerWinner.name} punches through with ${Math.abs(char1.stats.power - char2.stats.power)} higher power units!`);
        powerWinner.id === char1.id ? char1Wins++ : char2Wins++;
      } else {
        logs.push(`🤝 Equal absolute force register. Shockwaves shatter surrounding realms.`);
      }

      // Round 2: Speed
      logs.push(`[ROUND 2 // KINETIC SPEED & EVASIVE AGILITY]`);
      if (char1.stats.speed !== char2.stats.speed) {
        const speedWinner = char1.stats.speed > char2.stats.speed ? char1 : char2;
        logs.push(`⚡ ${speedWinner.name} moves with Godspeed agility, completely flanking the opponent!`);
        speedWinner.id === char1.id ? char1Wins++ : char2Wins++;
      } else {
        logs.push(`🤝 Speed match. Continuous sonic booms reverberate through the stadium!`);
      }

      // Round 3: Technique & Tactics
      logs.push(`[ROUND 3 // TECHNIQUE & MASTERY OVER RULES]`);
      if (char1.stats.technique !== char2.stats.technique) {
        const techWinner = char1.stats.technique > char2.stats.technique ? char1 : char2;
        logs.push(`🔮 ${techWinner.name} outwits with incredible tactical logic and universal mastery!`);
        techWinner.id === char1.id ? char1Wins++ : char2Wins++;
      } else {
        logs.push(`🤝 Perfect mirroring. Every strike is parried perfectly.`);
      }

      // Special overrides for funny lore accuracy
      if (char1.id === "saitama" || char2.id === "saitama") {
        const sait = char1.id === "saitama" ? char1 : char2;
        const other = char1.id === "saitama" ? char2 : char1;
        logs.push(`💀 [SPECIAL OVERRIDE] Saitama yawns. He unleashes a 'Normal Serious Punch'.`);
        logs.push(`💥 ${other.name} is blasted into orbit!`);
        if (char1.id === "saitama") {
          char1Wins = 99; char2Wins = 0;
        } else {
          char2Wins = 99; char1Wins = 0;
        }
      }

      if ((char1.id === "gojo" && char2.id === "goku") || (char1.id === "goku" && char2.id === "gojo")) {
        logs.push(`🌌 [LORE INTERACTION] Goku prepares a Spirit Bomb, but Gojo's Infinite Void stretches eternity.`);
      }

      // Decide final winner
      let winner: Character;
      if (char1Wins > char2Wins) {
        winner = char1;
      } else if (char2Wins > char1Wins) {
        winner = char2;
      } else {
        // Tiebreaker by popularity
        winner = char1.stats.popularity >= char2.stats.popularity ? char1 : char2;
        logs.push(`🏆 [TIE BREAKER // POPULARITY APPLAUSE] Evaluated by the cheers of the arena!`);
      }

      logs.push(`🎉 DECISIVE CONVICTION: The Winner is ${winner.name}!`);
      setBattleReport(logs);
      setBattleWinner(winner);
      setIsBattleRunning(false);
    }, 1200);
  };

  const resetBattle = () => {
    setVsOpponentId("");
    setBattleReport([]);
    setBattleWinner(null);
    setIsBattleRunning(false);
  };

  return (
    <>
      {/* SCROLL-SCRUBBED VIDEO INTRO — the "first page". The reel advances as you
          scroll and only releases into the gallery once it has played through. */}
      <ScrollScrubHero src="/hero/intro.mp4" poster="/hero/poster.jpg" />

      <div className="bg-neutral-950 p-2 sm:p-4 md:p-8 min-h-screen font-sans antialiased relative">
      {/* Background manga paper wrapper */}
      <div className="bg-manga-paper border-ink-4 max-w-7xl mx-auto min-h-screen shadow-manga-lg relative overflow-hidden bg-manga-grid flex flex-col justify-between">
        
        {/* HALFTONE GLITCH INITIAL LOADER DISPLAY */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
              className="absolute inset-0 bg-manga-paper z-50 flex flex-col items-center justify-center p-6 border-ink-4"
            >
              <div className="absolute inset-0 bg-halftone-dense opacity-20" />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center z-10 p-8 border-ink-4 bg-white max-w-md w-full shadow-manga-flat"
              >
                <div className="font-display text-5xl uppercase tracking-tighter mb-2 text-red-600">
                  CARDS ASSEMBLY
                </div>
                <div className="h-2 w-full bg-neutral-200 border-ink-2 overflow-hidden mb-4 relative">
                  <motion.div 
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                    className="absolute top-0 bottom-0 w-1/2 bg-neutral-900"
                  />
                </div>
                <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest block animate-pulse">
                  PRE-LOADING ORIGINAL ASSETS // 1996S
                </span>
                <span className="font-mono text-[9px] text-neutral-400 block mt-2 uppercase">
                  MANGA SCREEN GRAPHICS G/S v1.02
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO HEADER SECTION WITH EDITORIAL AESTHETIC */}
        <header className="border-b-4 border-ink-4 p-6 md:p-10 relative bg-[#F4F1EA] overflow-hidden">
          {/* Halftone wallpaper */}
          <div className="absolute inset-0 bg-halftone-pattern opacity-[0.04] pointer-events-none" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Top Eyebrow / Label */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex justify-between items-center border-b border-ink-2 pb-2 mb-8 font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase font-bold text-neutral-600"
            >
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#E31B23] animate-pulse" /> Volume 01 // Collectors Edition
              </span>
              <span>EST. 2026 // TOKYO DESIGN SYNCHRONY</span>
            </motion.div>

            {/* Main Typographic grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column info (Editorial style) */}
              <div className="lg:col-span-5 flex flex-col justify-center h-full">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="font-mono text-xs uppercase bg-[#E31B23] text-white px-3 py-1 border-2 border-black shadow-manga-sm inline-block mb-4 font-bold tracking-wider">
                    PREMIUM EDITION // 絶版
                  </span>
                  <h1 className="font-display text-6xl md:text-8xl leading-[0.85] tracking-tighter uppercase mb-4 border-b-4 border-[#121212] pb-4">
                    LEGENDS<br/><span className="text-[#E31B23]">GALLERY</span>
                  </h1>
                  <p className="font-sans text-base font-semibold text-neutral-600 italic mb-4 leading-tight">
                    "Unleash the ultimate visual scroll scrubbing timeline featuring 16 legendary protectors."
                  </p>
                  <p className="font-sans text-xs text-neutral-600 leading-relaxed mb-6">
                    Explore high-octane statistical representations, 3D hand-dealt movement, and battle-clash analysis of history’s greatest champions. Built with custom precision.
                  </p>
                </motion.div>
              </div>

              {/* Center Comic Book Page Poster Column (16:9 Banner image we generated) */}
              <div className="lg:col-span-4 flex justify-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="border-ink-4 relative group shadow-manga-lg bg-white w-full max-w-sm aspect-[16/10] sm:aspect-[9/12] overflow-hidden rounded-none"
                >
                  {/* Dynamic background speedlines overlay */}
                  <div className="absolute inset-0 manga-speedlines-h opacity-[0.14] pointer-events-none z-10" />
                  <div className="absolute inset-0 bg-halftone-pattern opacity-10 pointer-events-none z-10" />
                  
                  {/* Real static AI banner illustration we generated */}
                  <img
                    src="/src/assets/images/hero_cover_1781360190273.jpg"
                    alt="Manga Collage Legend"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale contrast-125 brightness-95 filter transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                    style={{
                      transform: `translateY(${(scrollProgress * 25) - 12.5}px)`
                    }}
                  />
                  
                  {/* Label tag */}
                  <div className="absolute bottom-3 left-3 bg-[#F4F1EA] text-[#121212] border-ink-2 px-3 py-1 font-mono text-xs uppercase font-extrabold tracking-widest z-20 shadow-manga-sm">
                    MAIN PORTRAIT // OP-001
                  </div>
                </motion.div>
              </div>

              {/* Right Column Stat Box info (gives it depth) */}
              <div className="lg:col-span-3">
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="border-ink-2 p-5 bg-white relative bg-halftone-pattern shadow-manga-sm"
                >
                  <div className="absolute top-2 right-2 bg-[#E31B23] text-white rounded-none border border-black p-1.5 text-xs font-mono font-bold uppercase rotate-6 shadow-manga-sm">
                    100% SPEC
                  </div>
                  <h3 className="font-display text-xl uppercase tracking-tight mb-3">
                    LEGENDS CORE
                  </h3>
                  <div className="space-y-3 font-mono text-[11px]">
                    <div className="flex justify-between border-b border-neutral-200 pb-1.5">
                      <span className="text-neutral-500">DECK SIZE:</span>
                      <span className="font-bold">16 CHAMPIONS</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-200 pb-1.5">
                      <span className="text-neutral-500">PEAK SPEED:</span>
                      <span className="font-bold text-[#E31B23]">100% [SAITAMA]</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-200 pb-1.5">
                      <span className="text-neutral-500">PEAK ENERGY:</span>
                      <span className="font-bold text-neutral-800">99% [GOKU]</span>
                    </div>
                    <div className="flex justify-between pb-0.5">
                      <span className="text-neutral-500">ENGINE:</span>
                      <span className="font-bold">CANVAS / V2.4</span>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-ink-2 border-dashed pt-3 text-center">
                    <span className="font-mono text-[9px] uppercase font-bold text-[#E31B23] tracking-widest animate-pulse block">
                      SCROLL TO DISCOVER CORES ↓
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </header>

        {/* STICKY CONTROL BAR (FILTER CHIPS + SEARCH + SORT) */}
        <section className="bg-neutral-900 border-b-4 border-[#121212] text-[#F4F1EA] sticky top-0 z-40 p-4 border-ink-4 shadow-manga-lg">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Left Filter label */}
            <div className="flex items-center gap-2 font-mono text-xs w-full md:w-auto">
              <Filter className="w-4 h-4 text-[#E31B23]" />
              <span className="uppercase tracking-[0.2em] font-bold">TIMELINE DIRECTS:</span>
            </div>

            {/* Center: Search Field */}
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder="PROBE TIMELINE (Luffy, Goku...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121212] text-[#F4F1EA] font-mono text-xs px-4 py-2 border-2 border-neutral-700 focus:border-[#E31B23] focus:outline-none placeholder-neutral-500 uppercase rounded-none transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-[#F4F1EA]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right: Dropdown sorting */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <ArrowUpDown className="w-4 h-4 text-[#E31B23]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#121212] text-[#F4F1EA] border-2 border-neutral-700 focus:border-[#E31B23] font-mono text-xs px-3 py-2 rounded-none focus:outline-none uppercase cursor-pointer"
              >
                <option value="default">SORT: TIMELINE AGE</option>
                <option value="name">SORT: ALPHABETICAL (A-Z)</option>
                <option value="power">SORT: RAW DESTRUCTIVE POWER</option>
                <option value="speed">SORT: SONIC VELOCITY</option>
                <option value="technique">SORT: TACTICAL MASTERY</option>
                <option value="popularity">SORT: FAN POPULARITY</option>
              </select>
            </div>
          </div>

          {/* Series Filtering Horizontal Carousel Chips */}
          <div className="max-w-6xl mx-auto mt-3 pt-3 border-t border-neutral-800 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1">
            {allSeries.map((series) => {
              const active = selectedSeries === series;
              return (
                <button
                  key={series}
                  onClick={() => setSelectedSeries(series)}
                  className={`font-mono text-[10px] uppercase font-bold tracking-wider px-4 py-2 border-2 transition-all shrink-0 rounded-none cursor-pointer ${
                    active 
                      ? "bg-[#E31B23] text-white border-black shadow-manga-sm scale-[1.03]" 
                      : "bg-[#121212] text-neutral-300 border-neutral-700 hover:text-white hover:border-neutral-500"
                  }`}
                  id={`filter-${series.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {series === "ALL" ? "ALL FRANCHISES // 全" : `${series.toUpperCase()}`}
                </button>
              );
            })}
          </div>
        </section>

        {/* HERO ANCHOR STAT SUMMARY DECK */}
        <main className="flex-grow bg-manga-paper relative py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Grid display of character cards */}
            <LayoutGroup>
              <motion.div 
                layout="position"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {processedCharacters.map((char, index) => (
                    <CharacterCard
                      key={char.id}
                      character={char}
                      index={index}
                      onInspect={(selected) => {
                        setSelectedCharacter(selected);
                        resetBattle();
                      }}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>

            {/* Empty state when no character matched */}
            {processedCharacters.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border-ink-4 p-12 bg-white text-center max-w-lg mx-auto shadow-manga-flat my-12 relative"
              >
                <div className="absolute inset-0 bg-halftone-pattern opacity-10" />
                <span className="font-display text-8xl text-neutral-300 block leading-none">空</span>
                <h3 className="font-display text-3xl uppercase tracking-tight text-neutral-900 mt-4 mb-2">
                  DIMENSIONAL VOID
                </h3>
                <p className="font-sans text-sm text-neutral-600 max-w-sm mx-auto mb-6">
                  "No warriors match your current timeline criteria. Refine your query or check another dimension."
                </p>
                <button
                  onClick={() => {
                    setSelectedSeries("ALL");
                    setSearchQuery("");
                    setSortBy("default");
                  }}
                  className="font-mono text-xs uppercase bg-black text-white px-4 py-2 hover:bg-red-600 border border-black shadow-manga-sm transform active:translate-x-1 active:translate-y-1 active:shadow-manga-sm/50 transition-all font-bold"
                >
                  RESET GRID MATRIX
                </button>
              </motion.div>
            )}
          </div>
        </main>

        {/* DETAILS INSPECTION MODAL (CLASH ARENA & STAT COMPARER BENTO OVERLAY) */}
        <AnimatePresence>
          {selectedCharacter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 z-55 flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setSelectedCharacter(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 30, rotate: -1 }}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                exit={{ scale: 0.95, y: 30, rotate: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 180 }}
                className="bg-manga-paper border-ink-4 w-full max-w-4xl rounded-none shadow-manga-lg relative overflow-hidden bg-manga-grid text-neutral-900 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Comic page partition border */}
                <div className="absolute inset-x-0 bottom-0 h-4 bg-neutral-900" />
                
                {/* Halftone wallpaper overlay */}
                <div className="absolute inset-0 bg-halftone-pattern opacity-20 pointer-events-none" />

                {/* Top Actions Panel */}
                <div className="bg-neutral-900 p-4 text-white flex justify-between items-center border-b-4 border-ink-4">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-2xl uppercase tracking-wider text-[#E31B23]">
                      CARD SPEC INSPECTOR // PROTO-DECK
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedCharacter(null)}
                    className="bg-neutral-800 text-white hover:bg-[#E31B23] p-1.5 border border-neutral-700 transition-colors cursor-pointer"
                    aria-label="Close Inspector"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Bento Grid Splitter Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
                  
                  {/* Left Column (Calligraphy Crest Portrait) */}
                  <div className="md:col-span-5 flex flex-col gap-4">
                    <div className="border-ink-4 rounded-none h-80 relative overflow-hidden bg-white shadow-manga-flat">
                      {selectedCharacter.img ? (
                        <div className="w-full h-full relative">
                          <div 
                            className="absolute inset-0 opacity-20 pointer-events-none mix-blend-color z-10"
                            style={{ backgroundColor: selectedCharacter.themeColor }}
                          />
                          <img
                            src={selectedCharacter.img}
                            alt={selectedCharacter.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover grayscale contrast-125 brightness-105"
                          />
                        </div>
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center relative bg-manga-paper"
                          style={{
                            background: `radial-gradient(circle, ${selectedCharacter.themeColor}22 0%, #F4F1EA) 80%`
                          }}
                        >
                          <div className="absolute inset-0 bg-halftone-pattern opacity-15" />
                          <div className="absolute w-44 h-44 border border-dashed border-neutral-300 rounded-full" />
                          <span 
                            className="font-display text-9xl text-neutral-900"
                            style={{ textShadow: `3px 3px 0 ${selectedCharacter.themeColor}7F` }}
                          >
                            {selectedCharacter.motif}
                          </span>
                        </div>
                      )}

                      {/* Series Banner on Crest Card inside inspector */}
                      <span className="absolute top-3 left-3 font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-black text-white border border-black shadow-manga-sm">
                        {selectedCharacter.series}
                      </span>
                    </div>

                    {/* Meta stats text stamp */}
                    <div className="border-ink-2 p-3 bg-white font-mono text-[10px] space-y-1 shadow-manga-sm">
                      <p className="font-bold text-[#E31B23]">// SPECIFICATION IDENTIFIER:</p>
                      <p>FRANCHISE: {selectedCharacter.series.toUpperCase()}</p>
                      <p>REPRESENTATION: CLASS {selectedCharacter.motif}</p>
                      <p>DOMINANT VIBE VECTOR COLOR: {selectedCharacter.themeColor}</p>
                    </div>
                  </div>

                  {/* Right Column (Expanded Stats + VS Arena) */}
                  <div className="md:col-span-7 flex flex-col justify-between">
                    <div>
                      {/* Character Bio block */}
                      <div className="border-b-2 border-dashed border-neutral-300 pb-4 mb-4">
                        <span className="font-mono text-xs uppercase font-extrabold tracking-widest text-[#121212] bg-white border border-ink-1 px-2.5 py-0.5 shadow-manga-sm inline-block mb-2">
                          LEGEND INDEX
                        </span>
                        <h2 className="font-display text-4xl uppercase tracking-tight text-neutral-900 leading-none">
                          {selectedCharacter.name}
                        </h2>
                        <p className="font-sans text-sm font-semibold text-neutral-400 mt-1 italic uppercase tracking-wider">
                          {selectedCharacter.role}
                        </p>
                        <p className="font-sans text-sm text-neutral-700 leading-relaxed mt-3">
                          {selectedCharacter.blurb}
                        </p>
                      </div>

                      {/* Stat Grid with custom labels */}
                      <div className="bg-white border-ink-2 p-4 mb-6 shadow-manga-sm relative">
                        <div className="absolute inset-0 bg-halftone-pattern opacity-5" />
                        <h4 className="font-mono text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1">
                          <Eye className="w-4 h-4 text-neutral-950" /> BIOLOGICAL CRITICALS
                        </h4>
                        
                        <div className="space-y-3 font-mono text-xs">
                          {/* Stat item 1 */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span>RAW DESTRUCTIVE POWER [POW]</span>
                              <span className="font-bold">{selectedCharacter.stats.power}%</span>
                            </div>
                            <div className="h-3 bg-neutral-100 border border-ink-1 overflow-hidden">
                              <div 
                                className="h-full transition-all duration-1000"
                                style={{ width: `${selectedCharacter.stats.power}%`, backgroundColor: selectedCharacter.themeColor }}
                              />
                            </div>
                          </div>

                          {/* Stat item 2 */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span>SPEED & AGILITY [SPD]</span>
                              <span className="font-bold">{selectedCharacter.stats.speed}%</span>
                            </div>
                            <div className="h-3 bg-neutral-100 border border-ink-1 overflow-hidden">
                              <div 
                                className="h-full transition-all duration-1000"
                                style={{ width: `${selectedCharacter.stats.speed}%`, backgroundColor: selectedCharacter.themeColor }}
                              />
                            </div>
                          </div>

                          {/* Stat item 3 */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span>TECHNIQUE & REVERIE [TEC]</span>
                              <span className="font-bold">{selectedCharacter.stats.technique}%</span>
                            </div>
                            <div className="h-3 bg-neutral-100 border border-ink-1 overflow-hidden">
                              <div 
                                className="h-full transition-all duration-1000"
                                style={{ width: `${selectedCharacter.stats.technique}%`, backgroundColor: selectedCharacter.themeColor }}
                              />
                            </div>
                          </div>

                          {/* Stat item 4 */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span>POPULARITY RECEPTOR [POP]</span>
                              <span className="font-bold">{selectedCharacter.stats.popularity}%</span>
                            </div>
                            <div className="h-3 bg-neutral-100 border border-ink-1 overflow-hidden">
                              <div 
                                className="h-full transition-all duration-1000"
                                style={{ width: `${selectedCharacter.stats.popularity}%`, backgroundColor: selectedCharacter.themeColor }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* INTERACTIVE ARENA CLASH VS SIMULATOR */}
                    <div className="border-t-2 border-ink-1 border-dashed pt-4 mt-2">
                      <div className="bg-[#F4F1EA] p-4 border-ink-2 relative bg-halftone-pattern" style={{ backgroundImage: "linear-gradient(#F4F1EA 0%, #F4F1EA 100%)" }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Swords className="w-5 h-5 text-[#E31B23] animate-bounce" />
                          <h4 className="font-display text-xl uppercase tracking-tight text-neutral-900 leading-none">
                            ARENA DUEL CLASH MATRIX
                          </h4>
                        </div>
                        
                        {!battleWinner && !isBattleRunning ? (
                          <div className="flex flex-col sm:flex-row gap-2 items-center">
                            <span className="font-mono text-xs text-neutral-600 sm:shrink-0 uppercase font-bold">
                              VS OPPONENT:
                            </span>
                            <select
                              value={vsOpponentId}
                              onChange={(e) => setVsOpponentId(e.target.value)}
                              className="w-full bg-white border-2 border-neutral-800 text-neutral-800 font-mono text-xs p-2 rounded-none cursor-pointer uppercase font-bold"
                            >
                              <option value="">SELECT HERO FROM DECK</option>
                              {CHARACTERS.filter(c => c.id !== selectedCharacter.id).map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.name.toUpperCase()} (FROM {c.series.toUpperCase()})
                                </option>
                              ))}
                            </select>
                            <button
                              disabled={!vsOpponentId}
                              onClick={() => handleVsBattle(selectedCharacter, vsOpponentId)}
                              className="w-full sm:w-auto font-mono text-xs uppercase bg-[#E31B23] text-white px-4 py-2 hover:bg-black border-2 border-black shadow-manga-sm active:translate-x-0.5 active:translate-y-0.5 transition-all font-bold disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer shrink-0"
                            >
                              ENGAGE BATTLE
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* Battle progress loop display */}
                            <div className="bg-black text-rose-500 p-3 font-mono text-[10px] space-y-1.5 leading-relaxed max-h-[140px] overflow-y-auto border border-red-900">
                              {battleReport.map((line, lIdx) => (
                                <p key={lIdx}>{line}</p>
                              ))}
                              {isBattleRunning && (
                                <p className="animate-pulse text-neutral-400">🔥 CALCULATING REALM SHOCKS...</p>
                              )}
                            </div>

                            {/* Battle outcome declaration banner */}
                            {battleWinner && (
                              <div className="flex items-center justify-between bg-white border border-ink-1 p-2 shadow-manga-sm">
                                <p className="font-mono text-xs">
                                  🏆 WINNER STATE: <span className="font-extrabold text-[#E31B23] uppercase">{battleWinner.name}</span>
                                </p>
                                <button
                                  onClick={resetBattle}
                                  className="font-mono text-[10px] uppercase bg-black text-white px-2 py-1 hover:bg-[#E31B23] shrink-0 cursor-pointer"
                                >
                                  PLAY AGAIN
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM MARGIN CREDIT LABEL (Architectural Honesty) */}
        <footer className="border-t-4 border-ink-4 p-6 bg-white text-center font-mono text-[10px] uppercase text-neutral-500 tracking-wider relative">
          <div className="absolute inset-0 bg-halftone-pattern opacity-5 pointer-events-none" />
          <div className="max-w-xl mx-auto space-y-1.5 relative z-10">
            <p className="font-bold text-neutral-700">LEGEND ASSEMBLER PORTFOLIO // VER V.01-1996S</p>
            <p className="text-neutral-400">
              ENGAGING EXPERIMENT WITH CANVAS ASSETS · INTUITIVE SCROLL FLIES · PERFECT PERFORMANCE RATED 60FPS
            </p>
            <div className="flex justify-center items-center gap-2 pt-2 text-neutral-400">
              <span>DESIGNED BY MOKSHMAMT</span>
              <span>·</span>
              <span>EST. 2026 SPECIAL LICENSE</span>
            </div>
          </div>
        </footer>

      </div>
      </div>
    </>
  );
}
