import React from 'react';

interface BrandMarkProps {
  className?: string;
}

/**
 * Proprietary Swiss Clinical Monogram: Mineral Slate plate with crisp clinical cross
 * and signature Mineral Sage Teal center pulse (#2DD4BF).
 */
export const BrandMark: React.FC<BrandMarkProps> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
  >
    <rect x="1.5" y="1.5" width="33" height="33" rx="9.5" fill="#162231" />
    <rect
      x="1.5"
      y="1.5"
      width="33"
      height="33"
      rx="9.5"
      stroke="rgba(255, 255, 255, 0.16)"
      strokeWidth="1.25"
    />
    <path
      d="M18 9v18M9 18h18"
      stroke="#F8FAFC"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <rect x="15.25" y="15.25" width="5.5" height="5.5" rx="1.6" fill="#2DD4BF" />
  </svg>
);
