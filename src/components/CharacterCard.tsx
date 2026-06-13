import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";
import { Sparkles, Trophy, Zap, Shield, Heart } from "lucide-react";
import { Character } from "../types";

interface CharacterCardProps {
  key?: string | number;
  character: Character;
  index: number;
  onInspect: (character: Character) => void;
}

export default function CharacterCard({ character, index, onInspect }: CharacterCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-10% 0px -10% 0px" });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // 3D Tilt variables
  const [tilt, setTilt] = useState({ x: 0, y: 0, isHovered: false });

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const el = cardRef.current;
    const rect = el.getBoundingClientRect();
    
    // Relative coordinates [-0.5, 0.5]
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Smooth angle mapping
    setTilt({
      x: x * 10,  // Max 10 deg rotation on Y axis
      y: -y * 10, // Max 10 deg rotation on X axis
      isHovered: true
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, isHovered: false });
  };

  // Flying in setup: odd from left (index is odd), even from right (index is even)
  const isEven = index % 2 === 0;
  const initialX = prefersReducedMotion ? 0 : (isEven ? 80 : -80);
  const initialY = prefersReducedMotion ? 0 : 60;
  const initialRotate = prefersReducedMotion ? 0 : (isEven ? 3 : -3);
  const initialScale = prefersReducedMotion ? 1 : 0.85;
  const initialBlur = prefersReducedMotion ? "0px" : "8px";

  // Staggering by index to layout dealt cards row cascades
  // Uses modulo 4 to group staggers for up to 4 columns beautifully
  const staggerDelay = prefersReducedMotion ? 0 : (index % 4) * 0.08;

  // Custom premium easing
  const premiumTransition = {
    duration: prefersReducedMotion ? 0.3 : 0.8,
    ease: [0.16, 1, 0.3, 1], // cubic-bezier(.16, 1, .3, 1)
    delay: staggerDelay,
  };

  // Convert theme hex to a soft transparent version for glow effects
  const cardShadowStyle = tilt.isHovered 
    ? {
        boxShadow: `12px 12px 0px 0px #121212, 0px 0px 24px 2px ${character.themeColor}3F`,
        borderColor: "#121212",
      }
    : {
        boxShadow: "6px 6px 0px 0px #121212",
        borderColor: "#121212",
      };

  return (
    <motion.div
      ref={cardRef}
      initial={{
        opacity: 0,
        x: initialX,
        y: initialY,
        rotate: initialRotate,
        scale: initialScale,
        filter: `blur(${initialBlur})`,
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              x: 0,
              y: 0,
              rotate: 0,
              scale: 1,
              filter: "blur(0px)",
            }
          : {}
      }
      transition={premiumTransition}
      style={{
        transformPerspective: 800,
        transform: prefersReducedMotion 
          ? "none" 
          : `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${tilt.isHovered ? 1.02 : 1})`,
        transition: tilt.isHovered ? "none" : "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        ...cardShadowStyle,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onInspect(character)}
      className="bg-manga-paper border-ink-4 p-4 rounded-none cursor-pointer relative overflow-hidden transition-shadow duration-300 group flex flex-col justify-between select-none min-h-[500px]"
      id={`card-${character.id}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onInspect(character);
        }
      }}
    >
      {/* Halftone back texture */}
      <div className="absolute inset-0 bg-halftone-pattern opacity-30 pointer-events-none z-0" />

      {/* Speed lines active on Hover to show extreme velocity/action! */}
      <div 
        className={`absolute inset-0 manga-speedlines-v opacity-10 pointer-events-none transition-opacity duration-300 ${
          tilt.isHovered ? "opacity-25" : "opacity-0"
        }`} 
      />

      {/* Card Content Wrapper */}
      <div className="z-10 flex flex-col h-full justify-between">
        {/* Header Ribbon */}
        <div className="flex justify-between items-start border-b-2 border-ink-1 pb-2 mb-3">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest bg-ink-1 px-1.5 py-0.5 text-black border border-ink-1">
              {character.series}
            </span>
            <p className="font-mono text-[9px] text-neutral-500 mt-1 uppercase font-semibold">
              ROLE // {character.crestSymbol || "FIGHTER"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span 
              className="w-3 h-3 rounded-full border border-ink-1"
              style={{ backgroundColor: character.themeColor }}
            />
            <span className="font-mono text-xs font-bold">{character.motif}</span>
          </div>
        </div>

        {/* Portait / Crest Section */}
        <div className="border-ink-2 relative overflow-hidden bg-neutral-100 flex-grow mb-4 flex items-center justify-center min-h-[220px]">
          {character.img ? (
            /* Character custom image with subtle parallax */
            <div className="w-full h-full relative overflow-hidden bg-manga-paper group-hover:scale-105 transition-transform duration-500">
              {/* Dynamic screen tint to match character theme */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none mix-blend-color z-10 transition-opacity duration-300 group-hover:opacity-25" 
                style={{ backgroundColor: character.themeColor }}
              />
              <img
                src={character.img}
                alt={character.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale contrast-125 brightness-105 blend-multiply transition-all duration-300 group-hover:grayscale-0"
              />
            </div>
          ) : (
            /* Premium original craft Calligraphy Crest */
            <div 
              className="w-full h-full flex flex-col items-center justify-center relative p-4 bg-manga-paper"
              style={{
                background: `radial-gradient(circle at center, ${character.themeColor}15 10%, #F4F1EA 70%)`
              }}
            >
              {/* Geometric pattern */}
              <div className="absolute inset-0 bg-halftone-pattern opacity-15" />
              <div className="absolute w-28 h-28 border border-neutral-300 rounded-full animate-spin-slow opacity-20 pointer-events-none" />
              <div className="absolute w-24 h-24 border-ink-1 border-dashed rounded-full pointer-events-none opacity-40" />
              
              {/* Giant Calligraphy Motif */}
              <span 
                className="font-display text-8xl relative z-10 text-neutral-900 select-none drop-shadow-[4px_4px_0px_#F4F1EA]"
                style={{
                  textShadow: `0 0 20px ${character.themeColor}3F, 3px 3px 0px #121212`
                }}
              >
                {character.motif}
              </span>

              {/* Monospace banner label inside crest */}
              <div className="absolute bottom-2 font-mono text-[9px] uppercase tracking-widest text-[#121212] bg-white border border-ink-1 px-2 py-0.5 shadow-manga-sm">
                CREST // {character.id}
              </div>
            </div>
          )}

          {/* Action sparkles icon */}
          <div className="absolute top-2 right-2 bg-neutral-900 text-white border border-ink-1 p-1 z-20 shadow-manga-sm scale-90 group-hover:scale-105 transition-all">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          </div>
        </div>

        {/* Character Bio */}
        <div className="mb-4">
          <h3 className="font-display text-2xl uppercase tracking-tight text-neutral-900 leading-none group-hover:text-red-600 transition-colors duration-200">
            {character.name}
          </h3>
          <p className="font-sans text-xs font-semibold text-neutral-500 mt-1 mb-2 line-clamp-1 italic">
            "{character.role}"
          </p>
          <p className="font-sans text-xs text-neutral-700 leading-relaxed line-clamp-3">
            {character.blurb}
          </p>
        </div>

        {/* Animated Card Footer: Stat Summary */}
        <div className="border-t-2 border-dashed border-neutral-300 pt-3">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {/* Stat Row 1: Power */}
            <div>
              <div className="flex justify-between items-center font-mono text-[9px] mb-1 font-bold">
                <span className="flex items-center gap-1 text-black uppercase">
                  <Zap className="w-2.5 h-2.5" /> POW
                </span>
                <span>{isInView ? character.stats.power : 0}%</span>
              </div>
              <div className="h-2 bg-neutral-200 border border-ink-1 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${character.stats.power}%` } : {}}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: staggerDelay + 0.3 }}
                  className="h-full border-r border-ink-1"
                  style={{ backgroundColor: character.themeColor }}
                />
              </div>
            </div>

            {/* Stat Row 2: Speed */}
            <div>
              <div className="flex justify-between items-center font-mono text-[9px] mb-1 font-bold">
                <span className="flex items-center gap-1 text-black uppercase">
                  <Heart className="w-2.5 h-2.5" /> SPD
                </span>
                <span>{isInView ? character.stats.speed : 0}%</span>
              </div>
              <div className="h-2 bg-neutral-200 border border-ink-1 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${character.stats.speed}%` } : {}}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: staggerDelay + 0.4 }}
                  className="h-full border-r border-ink-1"
                  style={{ backgroundColor: character.themeColor }}
                />
              </div>
            </div>

            {/* Stat Row 3: Technique */}
            <div>
              <div className="flex justify-between items-center font-mono text-[9px] mb-1 font-bold">
                <span className="flex items-center gap-1 text-black uppercase">
                  <Shield className="w-2.5 h-2.5" /> TEC
                </span>
                <span>{isInView ? character.stats.technique : 0}%</span>
              </div>
              <div className="h-2 bg-neutral-200 border border-ink-1 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${character.stats.technique}%` } : {}}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: staggerDelay + 0.5 }}
                  className="h-full border-r border-ink-1"
                  style={{ backgroundColor: character.themeColor }}
                />
              </div>
            </div>

            {/* Stat Row 4: Popularity */}
            <div>
              <div className="flex justify-between items-center font-mono text-[9px] mb-1 font-bold">
                <span className="flex items-center gap-1 text-black uppercase">
                  <Trophy className="w-2.5 h-2.5" /> POP
                </span>
                <span>{isInView ? character.stats.popularity : 0}%</span>
              </div>
              <div className="h-2 bg-neutral-200 border border-ink-1 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${character.stats.popularity}%` } : {}}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: staggerDelay + 0.6 }}
                  className="h-full border-r border-ink-1"
                  style={{ backgroundColor: character.themeColor }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* View inspection handle decor */}
        <div className="mt-3 text-center border-t border-ink-1 border-dotted pt-1.5">
          <span className="font-mono text-[8px] text-neutral-500 tracking-wider group-hover:text-[#121212] transition-colors leading-[1.3] uppercase inline-flex items-center gap-1 font-bold">
            [ CLICK TO UNLEASH STAT OVERLAY ]
          </span>
        </div>
      </div>
    </motion.div>
  );
}
