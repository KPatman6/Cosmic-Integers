import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Target, 
  MoveRight, 
  RotateCcw, 
  Trophy, 
  AlertCircle,
  ChevronRight,
  Star,
  Zap,
  Shield,
  Compass,
  MessageSquare,
  Send,
  Loader2,
  X
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type Operation = {
  label: string;
  apply: (val: number) => number;
};

type Planet = {
  name: string;
  description: string;
  target: number;
  startValue: number;
  maxMoves: number;
  operations: Operation[];
  color: string;
  size: string;
};

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

type Message = {
  role: 'user' | 'model';
  text: string;
};

// --- Constants ---
// --- Constants ---
const EASY_PLANETS: Planet[] = [
  {
    name: "Moon",
    description: "The first step into the void. Reach the lunar base.",
    target: 10,
    startValue: 0,
    maxMoves: 5,
    operations: [
      { label: "+2", apply: (v) => v + 2 },
      { label: "+3", apply: (v) => v + 3 },
      { label: "-1", apply: (v) => v - 1 },
    ],
    color: "bg-slate-300",
    size: "w-32 h-32",
  },
  {
    name: "Mars",
    description: "The Red Planet. Gravity is tricky here.",
    target: 24,
    startValue: 4,
    maxMoves: 6,
    operations: [
      { label: "+5", apply: (v) => v + 5 },
      { label: "x2", apply: (v) => v * 2 },
      { label: "-3", apply: (v) => v - 3 },
    ],
    color: "bg-orange-600",
    size: "w-40 h-40",
  },
  {
    name: "Jupiter",
    description: "The Gas Giant. Massive integers ahead.",
    target: 100,
    startValue: 10,
    maxMoves: 8,
    operations: [
      { label: "+15", apply: (v) => v + 15 },
      { label: "x3", apply: (v) => v * 3 },
      { label: "/2", apply: (v) => Math.floor(v / 2) },
      { label: "-5", apply: (v) => v - 5 },
    ],
    color: "bg-amber-200",
    size: "w-64 h-64",
  },
  {
    name: "Saturn",
    description: "The Ringed Jewel. Precision is key.",
    target: 77,
    startValue: 0,
    maxMoves: 7,
    operations: [
      { label: "+11", apply: (v) => v + 11 },
      { label: "x7", apply: (v) => v * 7 },
      { label: "-13", apply: (v) => v - 13 },
      { label: "/3", apply: (v) => Math.floor(v / 3) },
    ],
    color: "bg-yellow-100",
    size: "w-56 h-56",
  },
  {
    name: "Neptune",
    description: "The Deep Blue. Cold and distant.",
    target: -50,
    startValue: 0,
    maxMoves: 10,
    operations: [
      { label: "-10", apply: (v) => v - 10 },
      { label: "-5", apply: (v) => v - 5 },
      { label: "x2", apply: (v) => v * 2 },
      { label: "/5", apply: (v) => Math.floor(v / 5) },
    ],
    color: "bg-blue-600",
    size: "w-48 h-48",
  },
  {
    name: "The Void",
    description: "The edge of the known universe. Reach zero.",
    target: 0,
    startValue: 1337,
    maxMoves: 12,
    operations: [
      { label: "/10", apply: (v) => Math.floor(v / 10) },
      { label: "-123", apply: (v) => v - 123 },
      { label: "x0", apply: (v) => v * 0 },
      { label: "+42", apply: (v) => v + 42 },
    ],
    color: "bg-indigo-950",
    size: "w-72 h-72",
  }
];

const MEDIUM_PLANETS: Planet[] = [
  {
    name: "Mercury",
    description: "Closest to the sun. The heat is intense.",
    target: 15,
    startValue: 0,
    maxMoves: 5,
    operations: [
      { label: "+5", apply: (v) => v + 5 },
      { label: "+3", apply: (v) => v + 3 },
      { label: "-2", apply: (v) => v - 2 },
    ],
    color: "bg-orange-100",
    size: "w-24 h-24",
  },
  {
    name: "Moon",
    description: "The first step into the void.",
    target: 20,
    startValue: 0,
    maxMoves: 6,
    operations: [
      { label: "+4", apply: (v) => v + 4 },
      { label: "+7", apply: (v) => v + 7 },
      { label: "-3", apply: (v) => v - 3 },
    ],
    color: "bg-slate-300",
    size: "w-32 h-32",
  },
  {
    name: "Venus",
    description: "Acidic clouds and crushing pressure.",
    target: 42,
    startValue: 2,
    maxMoves: 7,
    operations: [
      { label: "+10", apply: (v) => v + 10 },
      { label: "x3", apply: (v) => v * 3 },
      { label: "-4", apply: (v) => v - 4 },
    ],
    color: "bg-orange-200",
    size: "w-36 h-36",
  },
  {
    name: "Mars",
    description: "The Red Planet.",
    target: 33,
    startValue: 3,
    maxMoves: 6,
    operations: [
      { label: "+10", apply: (v) => v + 10 },
      { label: "x2", apply: (v) => v * 2 },
      { label: "-7", apply: (v) => v - 7 },
    ],
    color: "bg-orange-600",
    size: "w-40 h-40",
  },
  {
    name: "Jupiter",
    description: "The Gas Giant.",
    target: 150,
    startValue: 10,
    maxMoves: 8,
    operations: [
      { label: "x5", apply: (v) => v * 5 },
      { label: "+25", apply: (v) => v + 25 },
      { label: "/2", apply: (v) => Math.floor(v / 2) },
    ],
    color: "bg-amber-200",
    size: "w-64 h-64",
  },
  {
    name: "Saturn",
    description: "The Ringed Jewel.",
    target: 99,
    startValue: 0,
    maxMoves: 7,
    operations: [
      { label: "+11", apply: (v) => v + 11 },
      { label: "x9", apply: (v) => v * 9 },
      { label: "-22", apply: (v) => v - 22 },
    ],
    color: "bg-yellow-100",
    size: "w-56 h-56",
  },
  {
    name: "Neptune",
    description: "The Deep Blue.",
    target: -75,
    startValue: 0,
    maxMoves: 9,
    operations: [
      { label: "-15", apply: (v) => v - 15 },
      { label: "x2", apply: (v) => v * 2 },
      { label: "/3", apply: (v) => Math.floor(v / 3) },
    ],
    color: "bg-blue-600",
    size: "w-48 h-48",
  },
  {
    name: "The Void",
    description: "The edge of the known universe.",
    target: 0,
    startValue: 2000,
    maxMoves: 10,
    operations: [
      { label: "/10", apply: (v) => Math.floor(v / 10) },
      { label: "-50", apply: (v) => v - 50 },
      { label: "x0", apply: (v) => v * 0 },
    ],
    color: "bg-indigo-950",
    size: "w-72 h-72",
  }
];

const HARD_PLANETS: Planet[] = [
  {
    name: "Mercury",
    description: "The scorched world.",
    target: 25,
    startValue: 0,
    maxMoves: 4,
    operations: [
      { label: "+7", apply: (v) => v + 7 },
      { label: "+4", apply: (v) => v + 4 },
      { label: "-3", apply: (v) => v - 3 },
    ],
    color: "bg-orange-100",
    size: "w-24 h-24",
  },
  {
    name: "Moon",
    description: "Lunar silence.",
    target: 17,
    startValue: 0,
    maxMoves: 5,
    operations: [
      { label: "+5", apply: (v) => v + 5 },
      { label: "+2", apply: (v) => v + 2 },
      { label: "-4", apply: (v) => v - 4 },
    ],
    color: "bg-slate-300",
    size: "w-32 h-32",
  },
  {
    name: "Venus",
    description: "The pressure is rising.",
    target: 88,
    startValue: 0,
    maxMoves: 6,
    operations: [
      { label: "x5", apply: (v) => v * 5 },
      { label: "+13", apply: (v) => v + 13 },
      { label: "-7", apply: (v) => v - 7 },
    ],
    color: "bg-orange-200",
    size: "w-36 h-36",
  },
  {
    name: "Mars",
    description: "The Red Planet.",
    target: 50,
    startValue: 5,
    maxMoves: 6,
    operations: [
      { label: "x3", apply: (v) => v * 3 },
      { label: "+10", apply: (v) => v + 10 },
      { label: "-5", apply: (v) => v - 5 },
    ],
    color: "bg-orange-600",
    size: "w-40 h-40",
  },
  {
    name: "Jupiter",
    description: "The Great Red Spot.",
    target: 250,
    startValue: 0,
    maxMoves: 7,
    operations: [
      { label: "x10", apply: (v) => v * 10 },
      { label: "+25", apply: (v) => v + 25 },
      { label: "/2", apply: (v) => Math.floor(v / 2) },
    ],
    color: "bg-amber-200",
    size: "w-64 h-64",
  },
  {
    name: "Saturn",
    description: "The Rings of Ice.",
    target: 144,
    startValue: 12,
    maxMoves: 6,
    operations: [
      { label: "x12", apply: (v) => v * 12 },
      { label: "+12", apply: (v) => v + 12 },
      { label: "/3", apply: (v) => Math.floor(v / 3) },
    ],
    color: "bg-yellow-100",
    size: "w-56 h-56",
  },
  {
    name: "Uranus",
    description: "The Tilted Giant.",
    target: 333,
    startValue: 0,
    maxMoves: 8,
    operations: [
      { label: "x10", apply: (v) => v * 10 },
      { label: "+3", apply: (v) => v + 3 },
      { label: "+33", apply: (v) => v + 33 },
    ],
    color: "bg-cyan-200",
    size: "w-52 h-52",
  },
  {
    name: "Neptune",
    description: "Stormy depths.",
    target: -100,
    startValue: 0,
    maxMoves: 8,
    operations: [
      { label: "-25", apply: (v) => v - 25 },
      { label: "x2", apply: (v) => v * 2 },
      { label: "/4", apply: (v) => Math.floor(v / 4) },
    ],
    color: "bg-blue-600",
    size: "w-48 h-48",
  },
  {
    name: "Pluto",
    description: "The Frozen Heart.",
    target: 7,
    startValue: 100,
    maxMoves: 7,
    operations: [
      { label: "/7", apply: (v) => Math.floor(v / 7) },
      { label: "-13", apply: (v) => v - 13 },
      { label: "x0", apply: (v) => v * 0 },
      { label: "+7", apply: (v) => v + 7 },
    ],
    color: "bg-zinc-400",
    size: "w-24 h-24",
  },
  {
    name: "The Void",
    description: "The Final Frontier.",
    target: 0,
    startValue: 9999,
    maxMoves: 10,
    operations: [
      { label: "/9", apply: (v) => Math.floor(v / 9) },
      { label: "-111", apply: (v) => v - 111 },
      { label: "x0", apply: (v) => v * 0 },
    ],
    color: "bg-indigo-950",
    size: "w-72 h-72",
  }
];

// --- Components ---

const SpaceBackground = () => {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full opacity-50"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const GeminiNavigator = ({ currentPlanet, currentValue, movesLeft }: { currentPlanet: Planet, currentValue: number, movesLeft: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: 'user',
            parts: [{
              text: `You are the Cosmic Navigator, a helpful AI onboard a spacecraft. 
              The player is currently at ${currentPlanet.name}.
              Current Energy: ${currentValue}
              Target Vector: ${currentPlanet.target}
              Moves Left: ${movesLeft}
              Available Operations: ${currentPlanet.operations.map(o => o.label).join(', ')}
              
              The player says: "${userMessage}"
              
              Provide a brief, helpful, and thematic hint or encouragement. Don't just give the answer unless they are really stuck. Keep it under 60 words.`
            }]
          }
        ],
        config: {
          systemInstruction: "You are a cosmic navigator. Be helpful, concise, and stay in character as a space AI."
        }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "Connection lost in the nebula. Try again." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Error communicating with deep space relay." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-80 h-96 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase text-white/70">Navigator Link</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-white/10" />
                  <p className="text-xs text-white/30">Need a hint for {currentPlanet.name}?</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white/10 text-white/80 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/10">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask for a hint..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button 
                  onClick={sendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
};

export default function App() {
  const [planetIndex, setPlanetIndex] = useState(() => {
    const saved = localStorage.getItem('cosmic-integers-progress');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    const saved = localStorage.getItem('cosmic-integers-difficulty');
    return (saved as Difficulty) || 'MEDIUM';
  });
  
  const getPlanetsForDifficulty = useCallback((diff: Difficulty) => {
    if (diff === 'EASY') return EASY_PLANETS;
    if (diff === 'HARD') return HARD_PLANETS;
    return MEDIUM_PLANETS;
  }, []);

  const currentPlanets = getPlanetsForDifficulty(difficulty);
  const currentPlanet = currentPlanets[planetIndex] || currentPlanets[0];

  const [currentValue, setCurrentValue] = useState(currentPlanet.startValue);
  const [movesLeft, setMovesLeft] = useState(currentPlanet.maxMoves);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'traveling' | 'win' | 'gameover' | 'complete'>('start');
  const [history, setHistory] = useState<number[]>([]);

  const currentTarget = currentPlanet.target;

  // Save progress and difficulty
  useEffect(() => {
    localStorage.setItem('cosmic-integers-progress', planetIndex.toString());
    localStorage.setItem('cosmic-integers-difficulty', difficulty);
  }, [planetIndex, difficulty]);

  const resetPlanet = useCallback(() => {
    setCurrentValue(currentPlanet.startValue);
    setMovesLeft(currentPlanet.maxMoves);
    setHistory([]);
    setGameState('playing');
  }, [currentPlanet]);

  const handleOperation = (op: Operation) => {
    if (gameState !== 'playing' || movesLeft <= 0) return;

    const newValue = op.apply(currentValue);
    setHistory([...history, currentValue]);
    setCurrentValue(newValue);
    setMovesLeft(movesLeft - 1);

    if (newValue === currentTarget) {
      setGameState('traveling');
      setTimeout(() => {
        if (planetIndex === currentPlanets.length - 1) {
          setGameState('complete');
        } else {
          const nextIndex = planetIndex + 1;
          setPlanetIndex(nextIndex);
          setCurrentValue(currentPlanets[nextIndex].startValue);
          setMovesLeft(currentPlanets[nextIndex].maxMoves);
          setHistory([]);
          setGameState('playing');
        }
      }, 2000);
    } else if (movesLeft - 1 === 0) {
      setGameState('gameover');
    }
  };

  const startGame = (index: number = 0) => {
    const planets = getPlanetsForDifficulty(difficulty);
    const targetIndex = index >= planets.length ? 0 : index;
    setPlanetIndex(targetIndex);
    setCurrentValue(planets[targetIndex].startValue);
    setMovesLeft(planets[targetIndex].maxMoves);
    setHistory([]);
    setGameState('playing');
  };

  return (
    <div className="h-screen w-screen bg-black text-white font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      <SpaceBackground />

      {/* HUD - Centered Top Bar */}
      <AnimatePresence>
        {gameState === 'playing' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-0 right-0 z-20 flex justify-center px-8"
          >
            <div className="flex items-center gap-4 bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {/* Energy */}
              <div className="bg-white/5 rounded-[1.5rem] px-8 py-4 min-w-[140px] text-center flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block mb-1">Energy</span>
                <span className="text-4xl font-mono font-bold text-indigo-400 leading-none">{currentValue}</span>
              </div>

              {/* Target */}
              <div className="bg-white/5 rounded-[1.5rem] px-8 py-4 min-w-[140px] text-center border-x border-white/5 flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block mb-1">Target</span>
                <span className="text-4xl font-mono font-bold text-emerald-400 leading-none">{currentTarget}</span>
              </div>

              {/* Fuel */}
              <div className="bg-white/5 rounded-[1.5rem] px-8 py-4 min-w-[140px] flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Fuel</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: currentPlanet.maxMoves }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-5 w-2 rounded-full transition-all duration-300 ${i < movesLeft ? 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]' : 'bg-white/5'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Perfectly centered */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <main className="relative z-10 w-full max-w-2xl flex flex-col items-center pointer-events-auto">
          {gameState === 'start' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-12 w-full"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-20"
                />
                <Rocket className="w-24 h-24 mx-auto text-indigo-400 mb-4 relative z-10" />
              </div>
              <div className="space-y-4">
                <h1 className="text-7xl font-display font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 leading-none">
                  COSMIC<br/>INTEGERS
                </h1>
                <p className="text-lg text-white/40 max-w-md mx-auto leading-relaxed font-medium">
                  Navigate the solar system using the power of mathematics. Reach the target vector at each planet to jump to the next.
                </p>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Select Difficulty</span>
                <div className="flex gap-3 justify-center">
                  {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setDifficulty(d);
                        const planets = getPlanetsForDifficulty(d);
                        // Reset to start when changing difficulty
                        setPlanetIndex(0);
                      }}
                      className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest transition-all border ${
                        difficulty === d 
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' 
                          : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => startGame(planetIndex)}
                  className="group relative px-10 py-5 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                >
                  <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors text-lg">
                    {planetIndex > 0 ? 'CONTINUE MISSION' : 'INITIATE LAUNCH'} <ChevronRight className="w-6 h-6" />
                  </span>
                </button>

                <button 
                  onClick={() => {
                    if (window.confirm('Start a new mission from the beginning? Current progress will be lost.')) {
                      localStorage.removeItem('cosmic-integers-progress');
                      setPlanetIndex(0);
                      startGame(0);
                    }
                  }}
                  className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white font-bold rounded-full transition-all text-lg border border-white/10"
                >
                  {planetIndex > 0 ? 'NEW MISSION' : 'RESET PROGRESS'}
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <div className="w-full flex flex-col items-center gap-12">
              {/* Planet Visual Container */}
              <div className="relative flex flex-col items-center justify-center w-full">
                {/* The Planet Circle and Orbit */}
                <div className="relative flex items-center justify-center h-80 w-full">
                  <motion.div
                    key={currentPlanet.name}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`rounded-full shadow-[0_0_100px_rgba(255,255,255,0.05)] relative ${currentPlanet.size} ${currentPlanet.color}`}
                  >
                    {/* Surface detail */}
                    <div className="absolute inset-0 rounded-full bg-black/10 overflow-hidden">
                      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-black/5 rounded-full blur-xl" />
                      <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-white/5 rounded-full blur-lg" />
                    </div>
                  </motion.div>

                  {/* Orbiting Rocket (Player) */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[130%] h-[130%] pointer-events-none"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Rocket className="w-8 h-8 text-indigo-400 rotate-45 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                    </div>
                  </motion.div>
                </div>

                {/* Planet Label - Centered below the visual */}
                <div className="text-center mt-4">
                  <h2 className="text-5xl font-display font-bold tracking-tight uppercase leading-none">{currentPlanet.name}</h2>
                  <p className="text-base text-white/30 mt-3 max-w-[320px] mx-auto font-medium leading-tight">{currentPlanet.description}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="w-full space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full px-4">
                  {currentPlanet.operations.map((op, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOperation(op)}
                      className="group relative h-24 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl flex items-center justify-center transition-all hover:-translate-y-1 active:translate-y-0 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-3xl font-mono font-bold group-hover:text-indigo-400 transition-colors">{op.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-center gap-12">
                  <button 
                    onClick={resetPlanet}
                    className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-xs font-bold tracking-widest uppercase"
                  >
                    <RotateCcw className="w-4 h-4" /> Restart
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (history.length > 0) {
                        const prevValue = history[history.length - 1];
                        setCurrentValue(prevValue);
                        setHistory(history.slice(0, -1));
                        setMovesLeft(movesLeft + 1);
                      }
                    }}
                    disabled={history.length === 0}
                    className="flex items-center gap-2 text-white/30 hover:text-white disabled:opacity-10 disabled:cursor-not-allowed transition-colors text-xs font-bold tracking-widest uppercase"
                  >
                    <MoveRight className="w-4 h-4 rotate-180" /> Undo
                  </button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'traveling' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-12"
            >
              <motion.div
                animate={{ 
                  y: [0, -30, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Rocket className="w-32 h-32 mx-auto text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]" />
              </motion.div>
              <div className="space-y-4">
                <h2 className="text-5xl font-display font-black italic tracking-tight leading-none">WARP DRIVE ACTIVE</h2>
                <p className="text-white/30 font-mono tracking-widest uppercase text-sm">Calculating trajectory to {currentPlanets[planetIndex + 1]?.name || 'The Unknown'}...</p>
              </div>
              <div className="w-72 h-1.5 bg-white/5 rounded-full mx-auto overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                  className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
              </div>
            </motion.div>
          )}

          {gameState === 'gameover' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-10 bg-zinc-900/50 border border-red-500/20 p-16 rounded-[60px] backdrop-blur-2xl"
            >
              <AlertCircle className="w-24 h-24 mx-auto text-red-500" />
              <div className="space-y-4">
                <h2 className="text-6xl font-display font-black tracking-tight leading-none">MISSION<br/>FAILED</h2>
                <p className="text-white/40 text-lg font-medium">Ran out of fuel before reaching the target vector.</p>
              </div>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={resetPlanet}
                  className="px-10 py-5 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform text-lg shadow-xl"
                >
                  RETRY MISSION
                </button>
                <button 
                  onClick={() => setGameState('start')}
                  className="text-white/20 hover:text-white transition-colors text-sm font-bold tracking-widest uppercase pt-4"
                >
                  Return to Base
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'complete' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-12"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-16 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-3xl opacity-30"
                />
                <Trophy className="w-40 h-40 mx-auto text-yellow-400 relative z-10 drop-shadow-[0_0_50px_rgba(250,204,21,0.5)]" />
              </div>
              <div className="space-y-6">
                <h2 className="text-7xl font-display font-black tracking-tight leading-none">UNIVERSE<br/>CONQUERED</h2>
                <p className="text-xl text-white/40 max-w-md mx-auto font-medium">
                  You've mastered the cosmic integers and reached the edge of existence.
                </p>
              </div>
              <button 
                onClick={() => {
                  setPlanetIndex(0);
                  setGameState('start');
                }}
                className="px-14 py-7 bg-yellow-400 text-black font-black text-2xl rounded-full hover:scale-110 transition-transform shadow-[0_20px_60px_rgba(250,204,21,0.3)]"
              >
                PLAY AGAIN
              </button>
            </motion.div>
          )}
        </main>
      </div>

      {/* Gemini Navigator */}
      {gameState === 'playing' && (
        <GeminiNavigator 
          currentPlanet={currentPlanet} 
          currentValue={currentValue} 
          movesLeft={movesLeft} 
        />
      )}
    </div>
  );
}
