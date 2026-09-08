import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'color' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Official LX MMA Company Logo matching the attached lx로고이미지.png
 * - Red rounded emblem with official white LX ribbon mark
 * - Warm charcoal (#564F4D) LX MMA logotype
 */
export const LxMmaLogo: React.FC<LogoProps> = ({
  className = '',
  variant = 'color',
  size = 'md',
}) => {
  const heights = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-11',
  };

  const isWhite = variant === 'white';
  const emblemBg = isWhite ? '#FFFFFF' : '#A1262B';
  const emblemMark = isWhite ? '#A1262B' : '#FFFFFF';
  const textColor = isWhite ? '#FFFFFF' : '#564F4D';

  return (
    <div
      id="lx-mma-official-logo"
      className={`inline-flex items-center select-none ${heights[size]} ${className}`}
      title="LX MMA"
    >
      <svg
        viewBox="0 0 240 56"
        className="h-full w-auto block"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* LX Official Rounded Emblem */}
        <rect x="2" y="2" width="52" height="52" rx="11" fill={emblemBg} />

        {/* White Stylized LX Monogram Ribbon */}
        <path
          d="M 13 12 H 20.5 V 36.5 L 31.5 24.5 L 44.5 37.5 L 40 42 L 31.5 33.5 L 22.5 42.5 C 21.5 43.5 19 44 16 44 H 14.5 C 13.5 44 13 43 13 42 Z"
          fill={emblemMark}
        />

        {/* Text: LX */}
        <text
          x="66"
          y="39"
          fill={textColor}
          fontFamily="'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="33"
          letterSpacing="-0.04em"
        >
          LX
        </text>

        {/* Text: MMA */}
        <text
          x="124"
          y="39"
          fill={textColor}
          fontFamily="'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="33"
          letterSpacing="-0.02em"
        >
          MMA
        </text>
      </svg>
    </div>
  );
};
