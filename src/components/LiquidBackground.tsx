import React from 'react';

export const LiquidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#070709]">
      {/* Ambient glass gradient spheres */}
      <div 
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-zinc-700/20 via-zinc-800/10 to-transparent blur-3xl opacity-60 animate-pulse"
        style={{ animationDuration: '10s' }}
      />
      <div 
        className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tl from-white/10 via-zinc-600/15 to-transparent blur-3xl opacity-40 animate-pulse"
        style={{ animationDuration: '14s' }}
      />
      <div 
        className="absolute -bottom-32 left-1/3 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-zinc-800/30 via-zinc-900/40 to-transparent blur-3xl opacity-50"
      />

      {/* Subtle liquid mesh grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top subtle liquid glass highlight curve */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
};
