import React from 'react';

/**
 * CareerBridge Brand Icon
 * A person climbing career steps toward a star — matches the brand identity.
 * Used consistently across all nav bars and brand marks.
 */
export const CareerBridgeIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Star (goal) at top right */}
    <path
      d="M25 5 L25.9 7.8 L28.8 7.8 L26.5 9.5 L27.4 12.3 L25 10.6 L22.6 12.3 L23.5 9.5 L21.2 7.8 L24.1 7.8 Z"
      fill="currentColor"
      opacity="0.9"
    />
    {/* Steps / career ladder */}
    <rect x="4" y="22" width="5" height="6" rx="1" fill="currentColor" opacity="0.5" />
    <rect x="10" y="18" width="5" height="10" rx="1" fill="currentColor" opacity="0.65" />
    <rect x="16" y="14" width="5" height="14" rx="1" fill="currentColor" opacity="0.8" />
    {/* Person (stick figure simplified) */}
    <circle cx="14" cy="10" r="2.2" fill="currentColor" />
    {/* Body */}
    <path d="M14 12.5 L14 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    {/* Legs */}
    <path d="M14 17 L11.5 20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M14 17 L16 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    {/* Arms / Briefcase arm */}
    <path d="M14 14 L11 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M14 14 L17 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    {/* Briefcase */}
    <rect x="8" y="15" width="4" height="3" rx="0.8" fill="currentColor" />
    <path d="M9.5 15 L9.5 14.2 Q10 13.6 10.5 14.2 L10.5 15" stroke="currentColor" strokeWidth="0.8" fill="none" />
  </svg>
);

export default CareerBridgeIcon;
