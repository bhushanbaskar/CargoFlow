'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function CargoFlowLogo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  };

  const textClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Original geometric logo symbol representing routes, nodes, and cargo flow */}
      <div className={`${sizeClasses[size]} rounded-xl bg-zinc-950 text-white flex items-center justify-center p-2 shadow-xs transition-transform hover:scale-105`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Continuous interconnected route lines */}
          <path
            d="M6 22C6 22 10 10 16 10C22 10 26 22 26 22"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M6 10C6 10 10 22 16 22C22 22 26 10 26 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="2 3"
            opacity="0.6"
          />
          {/* Node hubs */}
          <circle cx="6" cy="22" r="3" fill="#d9f99d" stroke="#09090b" strokeWidth="1.5" />
          <circle cx="16" cy="10" r="3" fill="#ffffff" stroke="#09090b" strokeWidth="1.5" />
          <circle cx="26" cy="22" r="3" fill="#d9f99d" stroke="#09090b" strokeWidth="1.5" />
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-tight text-zinc-950 font-sans ${textClasses[size]}`}>
            Cargo<span className="text-zinc-500 font-medium">Flow</span>
          </span>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-zinc-100 text-zinc-700 border border-zinc-200/80">
            Platform
          </span>
        </div>
      )}
    </div>
  );
}
