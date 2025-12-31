export function ProductImage({ alt, className = "" }: { alt: string; className?: string }) {
  return (
    <div className={`w-full h-full bg-gray-200 rounded-xl flex items-center justify-center ${className}`}>
      <svg className="w-16 h-16 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
      </svg>
    </div>
  );
}
