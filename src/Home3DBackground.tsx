import React from 'react';
import { motion } from 'motion/react';
import { Video, Film, Scissors, PlaySquare, Music, Image as ImageIcon, Sparkles, Wand2 } from 'lucide-react';

export const Home3DBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-stone-950">
      {/* 3D Perspective Grid */}
      <div 
        className="absolute w-[200vw] h-[200vh] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(245,158,11,0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(245,158,11,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          transform: 'rotateX(70deg) translateZ(-100px) translateY(-50px)',
          transformOrigin: 'center center',
          perspective: '1000px',
          maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 60%)'
        }}
      />
      
      {/* Sweeping Timeline Playhead over the Grid */}
      <motion.div
        animate={{
          x: ['-50vw', '50vw'],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute w-1 h-[200vh] bg-amber-500/30 left-1/2 top-0 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
        style={{
          transform: 'rotateX(70deg) translateZ(-90px) translateY(-50px)',
          transformOrigin: 'center center',
          perspective: '1000px',
        }}
      />
      
      {/* Floating Elements mimicking video editing UI (nodes, tracks) */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          rotateX: [15, 25, 15],
          rotateY: [-20, -10, -20],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-64 h-32 bg-stone-900/40 backdrop-blur-md border border-stone-700/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.1)] flex items-center p-5 gap-5"
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      >
         <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl flex items-center justify-center border border-amber-500/30">
            <Video className="w-7 h-7 text-amber-500" />
         </div>
         <div className="space-y-3 flex-1">
            <div className="w-full h-2.5 bg-stone-800/80 rounded-full overflow-hidden">
               <motion.div 
                 animate={{ width: ["0%", "100%", "0%"] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]"
               />
            </div>
            <div className="w-2/3 h-2.5 bg-stone-800/80 rounded-full" />
         </div>
      </motion.div>

      <motion.div
        animate={{
          y: [0, 40, 0],
          rotateX: [-25, -15, -25],
          rotateY: [30, 20, 30],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[20%] right-[15%] w-72 h-40 bg-stone-900/40 backdrop-blur-md border border-stone-700/50 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.1)] p-5 flex flex-col gap-3"
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      >
         <div className="flex gap-3 items-center mb-2">
           <Film className="w-6 h-6 text-blue-500" />
           <div className="w-24 h-2.5 bg-stone-800/80 rounded-full" />
         </div>
         <div className="flex-1 flex gap-1.5 items-end px-1">
           {[...Array(16)].map((_, i) => (
              <motion.div 
                key={i}
                animate={{ height: ['20%', `${40 + Math.random() * 60}%`, '20%'] }}
                transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                className="flex-1 bg-gradient-to-t from-blue-600/40 to-blue-400/80 rounded-t-sm"
              />
           ))}
         </div>
      </motion.div>
      
      {/* 3D Timeline Tracks Floating */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotateX: [45, 55, 45],
          rotateY: [10, 20, 10],
          rotateZ: [-10, -5, -10]
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        className="absolute top-[40%] left-[60%] w-96 h-24 bg-stone-900/30 backdrop-blur-sm border border-stone-700/30 rounded-xl shadow-[0_0_40px_rgba(236,72,153,0.1)] p-3 flex flex-col gap-2"
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      >
        <div className="flex gap-2 items-center text-pink-500 opacity-60">
          <Music className="w-4 h-4" />
          <div className="text-[10px] font-mono tracking-widest uppercase">Audio Track</div>
        </div>
        <div className="flex-1 w-full bg-stone-950/50 rounded-lg border border-stone-800/50 overflow-hidden flex items-center px-2">
           <motion.div 
             animate={{ x: [-100, 400] }}
             transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
             className="w-32 h-1/2 bg-pink-500/30 rounded-full blur-sm"
           />
        </div>
      </motion.div>

      {/* Floating Icons mimicking tools */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotateZ: [-5, 5, -5],
          rotateX: [0, 20, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 2 }}
        className="absolute top-[15%] right-[25%] opacity-40 mix-blend-screen"
      >
        <Scissors className="w-24 h-24 text-stone-700" />
      </motion.div>

      <motion.div
        animate={{
          x: [0, 20, 0],
          rotateZ: [10, 0, 10],
          rotateY: [0, 30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 3 }}
        className="absolute bottom-[30%] left-[10%] opacity-20 mix-blend-screen"
      >
        <PlaySquare className="w-40 h-40 text-stone-600" />
      </motion.div>

      <motion.div
        animate={{
          y: [0, -30, 0],
          rotateZ: [-15, 15, -15],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute top-[60%] right-[10%] opacity-30 mix-blend-screen"
      >
        <Sparkles className="w-20 h-20 text-amber-700" />
      </motion.div>
      
      <motion.div
        animate={{
          y: [0, 40, 0],
          rotateZ: [20, -10, 20],
          x: [0, -30, 0]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute top-[20%] left-[45%] opacity-20 mix-blend-screen"
      >
        <ImageIcon className="w-32 h-32 text-blue-800" />
      </motion.div>

      {/* Floating Particles/Nodes */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          animate={{
            y: [0, -Math.random() * 100 - 50, 0],
            x: [0, Math.random() * 100 - 50, 0],
            opacity: [0.1, 0.6, 0.1],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5
          }}
          className="absolute rounded-full"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${10 + Math.random() * 80}%`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            backgroundColor: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#3b82f6' : '#ec4899',
            boxShadow: `0 0 10px ${i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#3b82f6' : '#ec4899'}`,
          }}
        />
      ))}

      {/* Light flares */}
      <div className="absolute top-1/4 left-1/3 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[150px] mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/3 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[150px] mix-blend-screen" />
      <div className="absolute top-1/2 right-1/4 w-[25rem] h-[25rem] bg-pink-500/5 rounded-full blur-[120px] mix-blend-screen" />
    </div>
  );
};
