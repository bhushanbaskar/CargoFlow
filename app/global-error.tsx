'use client';
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 text-center font-sans">
        <h2 className="text-3xl font-black mb-4">Something went wrong!</h2>
        <p className="text-zinc-400 mb-6 text-sm">{error?.message || 'An unhandled error occurred.'}</p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-full bg-lime-400 text-zinc-950 font-bold hover:bg-lime-300 transition-colors text-sm"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
