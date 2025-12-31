export function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`} 
      style={{ width: size, height: size }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 28 28"
        aria-label="Logo La Petite Maison de l'Épouvante"
      >
        {/* Dark spooky background */}
        <rect width="28" height="28" rx="6" fill="#1a1a1a"/>
        
        {/* Full moon */}
        <circle cx="21" cy="7" r="3" fill="#fef3c7" opacity="0.9"/>
        
        {/* Haunted house silhouette */}
        <path d="M14 8l6 4v10h-2v-6H10v6H8V12l6-4z" fill="#374151"/>
        
        {/* House roof */}
        <path d="M14 8l6 4h-12l6-4z" fill="#1f2937"/>
        
        {/* Spooky windows with orange glow */}
        <rect x="11" y="14" width="1.5" height="2" rx="0.3" fill="#f59e0b" opacity="0.8"/>
        <rect x="15.5" y="14" width="1.5" height="2" rx="0.3" fill="#f59e0b" opacity="0.8"/>
        
        {/* Door */}
        <rect x="13" y="18" width="2" height="4" rx="0.3" fill="#1f2937"/>
        
        {/* Chimney */}
        <rect x="17" y="6" width="1.5" height="3" fill="#1f2937"/>
        
        {/* Flying bats */}
        <path d="M5 10l1-0.5 1 0.5-1-0.5z" fill="#374151"/>
        <path d="M7 8l0.8-0.4 0.8 0.4-0.8-0.4z" fill="#374151"/>
        
        {/* Spooky trees */}
        <path d="M3 18v4h1v-4c0-1-0.5-2-1-2z" stroke="#374151" strokeWidth="0.8" fill="none"/>
        <path d="M25 16v6h1v-6c0-1.5-0.5-2.5-1-2.5z" stroke="#374151" strokeWidth="0.8" fill="none"/>
      </svg>
    </div>
  );
}
