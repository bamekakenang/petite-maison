export default function Loading(){
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({length:8}).map((_,i)=> (
          <div key={i} className="border rounded-2xl p-3 bg-white">
            <div className="animate-pulse aspect-[3/4] bg-neutral-200 rounded-xl mb-3"/>
            <div className="animate-pulse h-4 bg-neutral-200 rounded w-1/2 mb-2"/>
            <div className="animate-pulse h-4 bg-neutral-200 rounded w-1/3"/>
          </div>
        ))}
      </div>
    </main>
  );
}