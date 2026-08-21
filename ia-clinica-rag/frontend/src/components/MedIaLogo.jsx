import React from 'react';

/**
 * Componente oficial do Logo e Ícone medIa
 * Símbolo vetorial de estrela com nós cardinais e tipografia oficial "medIa"
 */
export function MedIaIcon({ className = "h-8 w-8", strokeWidth = 5, ringStrokeWidth = 4, ...props }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Raios diagonais (45° e 135°) */}
      <line
        x1="24"
        y1="24"
        x2="76"
        y2="76"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <line
        x1="76"
        y1="24"
        x2="24"
        y2="76"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Eixos cardinais principal (Vertical e Horizontal) */}
      <line
        x1="50"
        y1="18"
        x2="50"
        y2="82"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="50"
        x2="82"
        y2="50"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* 4 Nós circulares (anéis) cardinais */}
      <circle
        cx="50"
        cy="14"
        r="5.5"
        fill="currentColor"
        fillOpacity="0.05"
        stroke="currentColor"
        strokeWidth={ringStrokeWidth}
      />
      <circle
        cx="50"
        cy="86"
        r="5.5"
        fill="currentColor"
        fillOpacity="0.05"
        stroke="currentColor"
        strokeWidth={ringStrokeWidth}
      />
      <circle
        cx="14"
        cy="50"
        r="5.5"
        fill="currentColor"
        fillOpacity="0.05"
        stroke="currentColor"
        strokeWidth={ringStrokeWidth}
      />
      <circle
        cx="86"
        cy="50"
        r="5.5"
        fill="currentColor"
        fillOpacity="0.05"
        stroke="currentColor"
        strokeWidth={ringStrokeWidth}
      />
    </svg>
  );
}

export function MedIaLogo({ 
  className = "flex items-center gap-2.5", 
  iconClassName = "h-8 w-8 text-[#17231f]", 
  textClassName = "font-editorial text-xl font-semibold tracking-[-0.02em] text-[#17231f]",
  showText = true 
}) {
  return (
    <div className={className}>
      <MedIaIcon className={iconClassName} />
      {showText && <span className={textClassName}>medIa</span>}
    </div>
  );
}
