'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const MarsExplorerApp = dynamic(
  () => import('@/components/MarsExplorerApp').then((mod) => mod.MarsExplorerApp),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen bg-[#05070a] flex flex-col items-center justify-center gap-4 font-mono text-zinc-400">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-mars-500/30 border-t-mars-500 animate-spin" />
          <Loader2 className="w-8 h-8 text-mars-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-bold tracking-widest text-white uppercase">
            Mars Pathfinder AI
          </span>
          <span className="text-xs text-zinc-500">
            Initializing Martian 3D Geospatial Engine...
          </span>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-black">
      <MarsExplorerApp />
    </main>
  );
}
