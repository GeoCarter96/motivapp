"use client";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface BackgroundElements {
  stars: { top: string; left: string; size: number }[];
  orbs: { top: string; left: string; size: number }[];
  bubbles: { top: string; left: string; size: number }[];
}

export default function IntroPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [isExiting, setIsExiting] = useState(false);
   const [elements, setElements] = useState<BackgroundElements>({
    stars: [],
    orbs: [],
    bubbles: []
  });

const { scrollYProgress } = useScroll();

// Orbs: Deepest background, moves the least
const yOrbs = useTransform(scrollYProgress, [0, 1], [0, -50]);
// Stars: Mid-ground
const yStars = useTransform(scrollYProgress, [0, 1], [0, -150]);
// Bubbles: Closest to camera, moves the most
const yBubbles = useTransform(scrollYProgress, [0, 1], [0, -300]);

const playSelectSound = () => {

  const audio = new Audio('/sounds/select-chime.mp3'); 
  audio.volume = 0.4;
  audio.play().catch(() => {}); 
};
  const handleEnter = async (route: string) => {
  
  const enterSound = new Audio('/sounds/melancholy.mp3');
  enterSound.volume = 0.6;

 
  setIsExiting(true); 
  enterSound.play().catch(() => {});

 
  if (audioRef.current) {
    const fadeOut = setInterval(() => {
      if (audioRef.current!.volume > 0.02) {
        audioRef.current!.volume -= 0.02;
      } else {
        audioRef.current!.pause();
        clearInterval(fadeOut);
      }
    }, 30);
  }

  
  setTimeout(() => {
    router.push(route);
  }, 2500); 
};


  const options = [
    { id: "goals", title: "Daily Goals", icon: "🎯", color: "from-sky-300 to-sky-500", glow: "rgba(125, 211, 252, 0.5)", desc: "Set and achieve milestones that align with your personal growth.", route: "/goals" },
    { id: "zen", title: "Morning Zen", icon: "☀️", color: "from-amber-300 to-amber-500", glow: "rgba(252, 211, 77, 0.5)", desc: "Start your day with peaceful clarity and intentional calm.", route: "/zen" },
    { id: "focus", title: "Focus Mode", icon: "🧠", color: "from-indigo-300 to-indigo-500", glow: "rgba(165, 180, 252, 0.5)", desc: "Deep dive into your tasks with distraction-free environments.", route: "/focus" },
    { id: "sleep", title: "Deep Sleep", icon: "🌙", color: "from-blue-500 to-blue-700", glow: "rgba(30, 64, 175, 0.5)", desc: "Drift into restorative rest with atmospheric soundscapes.", route: "/sleep" },
  ];
useEffect(() => {

  const selectionAudio = new Audio('/sounds/select-chime.mp3');
  selectionAudio.preload = "auto";


  setElements({

    stars: Array.from({ length: 30 }).map(() => ({
      top: `${Math.random() * 60}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
    })),

    orbs: Array.from({ length: 8 }).map(() => ({
      top: `${Math.random() * 80}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 150 + 100,
    })),

    bubbles: Array.from({ length: 12 }).map(() => ({
      top: `${Math.random() * 90}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 40 + 15,
    }))
  });
}, []);
const blurStars = useTransform(scrollYProgress, [0, 0.5], ["blur(0px)", "blur(8px)"]);

const blurBubbles = useTransform(scrollYProgress, [0, 0.5], ["blur(2px)", "blur(12px)"]);



const opacityBackground = useTransform(scrollYProgress, [0, 0.5], [1, 0.4]);


  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-20 relative overflow-hidden bg-[#b9e2f5]">
     
 <motion.div 
      style={{ y: yStars, filter: blurStars, opacity: opacityBackground }} 
      className="absolute inset-0 pointer-events-none"
    >
      {elements.stars.map((star, i) => (
        <motion.div key={`star-${i}`} className="absolute bg-white rounded-full shadow-[0_0_8px_white]"
          style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3 + i, repeat: Infinity }}
        />
      ))}
    </motion.div>
 <motion.div 
      style={{ y: yBubbles, filter: blurBubbles, opacity: opacityBackground }} 
      className="absolute inset-0 pointer-events-none"
    >
      {elements.bubbles.map((bubble, i) => (
        <motion.div key={`bubble-${i}`} className="absolute border border-white/30 rounded-full"
          style={{ top: bubble.top, left: bubble.left, width: bubble.size, height: bubble.size }}
        />
      ))}
    </motion.div>

      <motion.div 
        animate={selectedOption ? { opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] } : { opacity: 0.5 }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{ background: 'conic-gradient(from 0deg at 50% 30%, transparent 0deg, white 8deg, transparent 16deg)', backgroundSize: '12% 100%' }} 
      />
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-white rounded-full blur-[150px] opacity-80 z-0" />

     
      <AnimatePresence>
        {isExiting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-white z-[200] pointer-events-none" />
        )}
      </AnimatePresence>

     
      <section className="relative z-10 text-center max-w-3xl mb-16">
        <motion.h1 className="text-7xl font-black text-[#1e88e5] mb-6 tracking-tighter filter drop-shadow-[0_4px_10px_white]">
          Welcome to Motiv
        </motion.h1>
        <p className="text-2xl text-[#1e293b]/80 leading-relaxed font-bold max-w-2xl mx-auto">
          Motiv is your personal sanctuary. Designed for everyday use, our app helps you find balance and stay focused on your journey.
        </p>
      </section>

      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8 w-full max-w-6xl">
        {options.map((option) => (
          <motion.div
            key={option.id}
            layoutId={option.id}
             onClick={() => {
    setSelectedOption(option); 
    playSelectSound();         
  }}
            className="cursor-pointer bg-white/90 backdrop-blur-xl p-10 rounded-[60px] shadow-lg border border-white/60 flex flex-col items-center justify-center group"
          >
            <motion.div layoutId={`icon-${option.id}`} className={`w-20 h-20 bg-gradient-to-br ${option.color} rounded-3xl flex items-center justify-center text-4xl mb-4 mx-auto shadow-lg`}>
              {option.icon}
            </motion.div>
            <motion.h3 layoutId={`title-${option.id}`} className="font-black text-[#1e293b] text-2xl tracking-tighter text-center">
              {option.title}
            </motion.h3>
          </motion.div>
        ))}
      </div>

     
      <AnimatePresence>
        {selectedOption && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-sky-900/10 backdrop-blur-md"
          >
            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedOption(null)} />

            <motion.div 
              layoutId={selectedOption.id}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-white p-12 rounded-[70px] max-w-md w-full text-center shadow-2xl pointer-events-auto
                         before:absolute before:bg-white before:w-24 before:h-24 before:rounded-full before:-top-10 before:left-10 before:content-['']
                         after:absolute after:bg-white after:rounded-full after:w-32 after:h-32 after:-top-14 after:right-10 after:content-['']"
            >
              <motion.div layoutId={`icon-${selectedOption.id}`} className={`w-24 h-24 bg-gradient-to-br ${selectedOption.color} rounded-[35px] flex items-center justify-center text-5xl mx-auto mb-8 shadow-lg`}>
                {selectedOption.icon}
              </motion.div>
              
              <motion.h2 layoutId={`title-${selectedOption.id}`} className="text-4xl font-black text-[#1e293b] mb-4 tracking-tighter">
                {selectedOption.title}
              </motion.h2>
              
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg text-[#526D82] font-semibold mb-10">
                {selectedOption.desc}
              </motion.p>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={() => handleEnter(selectedOption.route)}
                className={`w-full py-5 rounded-full bg-gradient-to-r ${selectedOption.color} text-white font-black text-xl shadow-xl`}
              >
                Enter {selectedOption.title}
              </motion.button>
              
              <button onClick={() => setSelectedOption(null)} className="mt-6 font-black text-sky-600/40 uppercase tracking-widest text-sm hover:text-sky-600">
                Go Back
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="absolute bottom-[-150px] w-[160%] left-[-30%] h-[500px] bg-white rounded-[100%] blur-[80px] opacity-95 z-0 shadow-[0_-60px_100px_white]" />
    </main>
  );
}
