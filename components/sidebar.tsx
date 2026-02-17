"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Moon, Sun, Monitor } from "lucide-react";
import Link from "next/link";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: <Home size={20} /> },
  { name: "Intro", href: "/intro", icon: 'ℹ️' },
  { name: "Daily Goals", href: "/goals", icon: "🎯" },
  { name: "Morning Zen", href: "/zen", icon: "☀️" },
  { name: "Focus Mode", href: "/focus", icon: "🧠" },
  { name: 'Deep Sleep', href: '/sleep', icon: "🌙" },
];

type Theme = "light" | "dark" | "system";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

 
const applyTheme = (t: Theme) => {
  const root = window.document.documentElement;
  const isDark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};



  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as Theme | null;
    const initial = saved || "system";
    setTheme(initial);
    applyTheme(initial);

    // Listen for system changes while in "system" mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (localStorage.getItem("theme") === "system" || !localStorage.getItem("theme")) {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <>
      <div className="md:hidden">
        {/* Trigger Button */}
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed top-6 left-6 z-[100] p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 dark:border-slate-700 text-sky-600 dark:text-sky-400"
        >
          <Menu size={24} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-sky-900/40 backdrop-blur-sm z-[110]"
              />

              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                className="fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-slate-950 z-[120] shadow-2xl flex flex-col p-8 bg-white dark:bg-slate-900 border-r border-sky-100 dark:border-slate-800 shadow-2xl"
              >
                {/* Brand Header */}
                <div className="flex items-center justify-between mb-10">
                  <span className="font-black text-sky-500 dark:text-sky-400 text-xl uppercase tracking-tighter drop-shadow-sm">
                    Motiv
                  </span>
                  <button onClick={() => setIsOpen(false)} className="text-sky-900/20 dark:text-sky-100/20">
                    <X size={24} />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col gap-2">
                  {NAV_ITEMS.map((item) => (
                    <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                      <motion.div className="flex items-center gap-4 p-3 rounded-xl text-sky-900 dark:text-sky-100 font-bold hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors">
                        <div className="text-sky-500 dark:text-sky-400">{item.icon}</div>
                        <span className="uppercase text-[11px] tracking-widest">{item.name}</span>
                      </motion.div>
                    </Link>
                  ))}
                </nav>

              
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
