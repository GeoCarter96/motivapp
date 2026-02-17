"use client";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const whooshRef = useRef<HTMLAudioElement | null>(null);
  const controls = useAnimation();
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [elements, setElements] = useState<{ stars: any[], orbs: any[], bubbles: any[] }>({ 
    stars: [], orbs: [], bubbles: [] 
  });

  useEffect(() => {
    audioRef.current = new Audio('/sounds/ethereal.mp3');
    whooshRef.current = new Audio('/sounds/whoosh.mp3');

    // 2026 Cleanup Pattern: Stop audio immediately on navigation
    return () => {
      [audioRef, whooshRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.src = "";
          ref.current.load();
        }
      });
    };
  }, []);

  const handleStart = async () => {
    if (!audioRef.current) return;
    const mainAudio = audioRef.current;
    mainAudio.loop = true;
    mainAudio.volume = 0;

    controls.start({
      scale: 2.2,
      filter: "blur(12px)",
      transition: { duration: 6, ease: "easeInOut" }
    });

    try {
      await mainAudio.play();
      let vol = 0;
      const fadeIn = setInterval(() => {
        if (vol < 0.5) {
          vol += 0.05;
          mainAudio.volume = Math.min(0.5, vol);
        } else { clearInterval(fadeIn); }
      }, 100);

      setTimeout(() => {
        setIsExiting(true); 
        whooshRef.current?.play().catch(() => {});
      }, 2500);

      setTimeout(() => router.push('/intro'), 5500);
    } catch (e) {
      router.push('/intro');
    }
  };

  useEffect(() => {
    setElements({
      stars: Array.from({ length: 35 }).map(() => ({ top: `${Math.random() * 70}%`, left: `${Math.random() * 100}%`, size: Math.random() * 4 + 1 })),
      orbs: Array.from({ length: 10 }).map(() => ({ top: `${Math.random() * 80}%`, left: `${Math.random() * 100}%`, size: Math.random() * 100 + 100 })),
      bubbles: Array.from({ length: 15 }).map(() => ({ top: `${Math.random() * 80}%`, left: `${Math.random() * 100}%`, size: Math.random() * 30 + 10 }))
    });
  }, []);

  // Animation variant for cloud puffs
   // Define the animation variant with explicit typing
  const puffAnimate = (y: number, d: number) => ({
    y: [0, y, 0] as number[], // "as number[]" tells TS this is a sequence
    transition: { 
      duration: d, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }
  });

  return (
    <>
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
        {/* Background Decor */}
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none" 
             style={{ background: 'conic-gradient(from 0deg at 50% 35%, transparent 0deg, white 6deg, transparent 12deg)', backgroundSize: '10% 100%' }} />
        
        {/* LOGO */}
        <div className="relative z-30 flex flex-col items-center w-full mt-24 md:mt-28">
          <h1 className="text-7xl md:text-[12rem] font-black tracking-[-0.07em] lowercase leading-none
                        font-nunito bg-gradient-to-b from-[#6fbcf7] via-[#3a96e8] to-[#1a73e8] 
                        bg-clip-text text-transparent filter drop-shadow-[0_12px_20px_rgba(26,115,232,0.3)]">
            motiv
          </h1>

          {/* ANIMATED CLOUD BUTTON */}
          <motion.button
            onClick={handleStart} 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-16 md:mt-20 relative scale-[0.65] md:scale-100" 
          >
            <div className="bg-white px-20 py-12 rounded-[80px] relative flex items-center justify-center 
                            shadow-[0_30px_60px_rgba(186,230,253,0.6),_inset_0_-12px_20px_rgba(186,230,253,0.25)]">
              
          
<motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-12 left-6 w-24 h-24 bg-white rounded-full blur-[1px]" />
<motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-16 right-8 w-32 h-32 bg-white rounded-full blur-[1px]" />
<motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-12 top-4 w-24 h-24 bg-white rounded-full" />
<motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-8 top-6 w-20 h-20 bg-white rounded-full" />
<motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-32 bg-white rounded-full blur-[5px]" />

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
