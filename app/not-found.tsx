'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 text-center font-sans">
      <h2 className="text-3xl font-black mb-4">404 - Page Not Found</h2>
      <p className="text-zinc-400 mb-6 text-sm">The requested resource could not be found on CargoFlow.</p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-lime-400 text-zinc-950 font-bold hover:bg-lime-300 transition-colors text-sm"
      >
        Return Home
      </Link>
    </div>
  );
}
