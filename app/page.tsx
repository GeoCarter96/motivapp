"use client";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const controls = useAnimation();
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [elements, setElements] = useState<{ stars: any[], orbs: any[], bubbles: any[] }>({ 
    stars: [], orbs: [], bubbles: [] 
  });

  // Pre-load audio to avoid "NotSupportedError" in Next.js 16
  useEffect(() => {
    audioRef.current = new Audio('/sounds/ethereal.mp3');
  }, []);

  const handleStart = async () => {
    if (!audioRef.current) return;
    
    const mainAudio = audioRef.current;
    mainAudio.loop = true;
    mainAudio.volume = 0;

    // Use a try-catch for the secondary audio as well
    let whooshAudio: HTMLAudioElement;
    try {
      whooshAudio = new Audio('/sounds/whoosh.mp3');
      whooshAudio.volume = 0.4;
    } catch (e) {
      console.warn("Whoosh audio failed to load");
    }

    // 1. CINEMATIC ZOOM & BLUR
    controls.start({
      scale: 2.2,
      filter: "blur(12px)",
      transition: { duration: 6, ease: "easeInOut" }
    });

    try {
      await mainAudio.play();
      
      // 2. FADE IN
      let vol = 0;
      const fadeIn = setInterval(() => {
        if (vol < 0.5) {
          vol += 0.05;
          mainAudio.volume = Math.min(0.5, vol);
        } else {
          clearInterval(fadeIn);
        }
      }, 100);

      // 3. EXIT SEQUENCE (2.5s)
      setTimeout(() => {
        setIsExiting(true); 
        whooshAudio?.play().catch(() => {});
        
        const fadeOut = setInterval(() => {
          if (mainAudio.volume > 0) {
            mainAudio.volume = Math.max(0, mainAudio.volume - 0.05);
          } else {
            mainAudio.pause();
            clearInterval(fadeOut);
          }
        }, 80);
      }, 2500);

      // 4. NAVIGATE
      setTimeout(() => {
        router.push('/intro');
      }, 5500);

    } catch (e) {
      // Fallback if browser blocks audio completely
      router.push('/intro');
    }
  };

  useEffect(() => {
    setElements({
      stars: Array.from({ length: 35 }).map(() => ({
        top: `${Math.random() * 70}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 4 + 1,
      })),
      orbs: Array.from({ length: 10 }).map(() => ({
        top: `${Math.random() * 80}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 100 + 100,
      })),
      bubbles: Array.from({ length: 15 }).map(() => ({
        top: `${Math.random() * 80}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 30 + 10,
      }))
    });
  }, []);

  return (
    <>
      {/* Blinding White Transition Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 1 : 0 }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        className="fixed inset-0 bg-white z-[100] pointer-events-none"
      />

      <motion.main 
        animate={controls}
        className="flex flex-col items-center justify-start min-h-screen pt-12 px-6 font-sans overflow-hidden relative bg-[#bde4f7]"
      >
        {/* RADIANT SUNBEAMS (Matching Image) */}
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none" 
             style={{ background: 'conic-gradient(from 0deg at 50% 35%, transparent 0deg, white 6deg, transparent 12deg)', backgroundSize: '10% 100%' }} />
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white rounded-full blur-[150px] opacity-90 z-0" />

        {/* FLOATING BUBBLES & STARS */}
        {elements.orbs.map((orb, i) => (
          <motion.div key={`orb-${i}`} className="absolute bg-white/20 rounded-full blur-3xl"
            style={{ top: orb.top, left: orb.left, width: orb.size, height: orb.size }}
            animate={{ y: [0, -60, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 15 + i, repeat: Infinity }} />
        ))}
        {elements.stars.map((star, i) => (
          <motion.div key={`star-${i}`} className="absolute bg-white rounded-full shadow-[0_0_15px_white]"
            style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.6, 1.4, 0.6] }}
            transition={{ duration: 3 + Math.random() * 3, repeat: Infinity }} />
        ))}

        {/* LOGO */}
        <div className="relative z-30 flex flex-col items-center w-full mt-28">
          <h1 className="text-[12rem] font-black tracking-[-0.07em] lowercase leading-none
                        font-nunito bg-gradient-to-b from-[#6fbcf7] via-[#3a96e8] to-[#1a73e8] 
                        bg-clip-text text-transparent
                        filter drop-shadow-[0_12px_20px_rgba(26,115,232,0.3)]">
            motiv
          </h1>

          {/* PUFFY CLOUD BUTTON (True to Image) */}
          <motion.button
            onClick={handleStart} 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="mt-20 relative" 
          >
            <div className="bg-white px-20 py-12 rounded-[80px] relative flex items-center justify-center 
                            shadow-[0_30px_60px_rgba(186,230,253,0.6),_inset_0_-12px_20px_rgba(186,230,253,0.25)]">
              
              {/* Surrounding Puffs */}
              <div className="absolute -top-12 left-6 w-24 h-24 bg-white rounded-full blur-[1px]" />
              <div className="absolute -top-16 right-8 w-32 h-32 bg-white rounded-full blur-[1px]" />
              <div className="absolute -left-12 top-4 w-24 h-24 bg-white rounded-full" />
              <div className="absolute -right-8 top-6 w-20 h-20 bg-white rounded-full" />
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-32 bg-white rounded-full blur-[5px]" />

              <span className="font-black text-6xl cursor-pointer text-black relative z-10 tracking-tighter">
                Start
              </span>
            </div>
          </motion.button>
        </div>
    
        
      </motion.main>
    </>
  );
}
