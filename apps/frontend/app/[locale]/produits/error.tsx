'use client';

export default function ProduitsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="text-xl font-bold mb-2 text-red-500">Erreur page produits</h2>
      <p className="text-neutral-300 mb-2">Digest: {error.digest}</p>
      <p className="text-neutral-300 mb-4">Message: {error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-red-700"
      >
        Réessayer
      </button>
    </main>
  );
}
