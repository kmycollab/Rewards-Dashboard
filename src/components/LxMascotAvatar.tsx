import React, { useState } from 'react';
import mascotOfficialImg from '../assets/images/lx_mascot_official.jpg';

interface LxMascotAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

export const LxMascotAvatar: React.FC<LxMascotAvatarProps> = ({
  className = '',
  size = 'md',
  showBadge = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20 md:w-24 md:h-24',
    lg: 'w-28 h-28 md:w-32 md:h-32',
    xl: 'w-36 h-36 md:w-44 md:h-44',
  };

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden border-2 border-rose-300/40 bg-white shadow-md flex items-center justify-center`}
      >
        {!imgError ? (
          <img
            src={mascotOfficialImg}
            alt="LXMMA 공식 마스코트 엘모"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          /* SVG Representation strictly matching the uploaded mascot */
          <svg
            viewBox="0 0 200 240"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background warm glow */}
            <rect width="200" height="240" fill="#FFF8F6" />

            {/* Bear Ears */}
            <circle cx="55" cy="45" r="22" fill="#D3222A" />
            <circle cx="55" cy="45" r="14" fill="#FFE2D1" />
            <circle cx="145" cy="45" r="22" fill="#D3222A" />
            <circle cx="145" cy="45" r="14" fill="#FFE2D1" />

            {/* Head */}
            <circle cx="100" cy="85" r="58" fill="#E52934" />

            {/* Peach / Cream Heart-Shaped Face Mask */}
            <path
              d="M100 130 C65 130 55 105 55 85 C55 65 75 60 90 70 C96 74 100 80 100 80 C100 80 104 74 110 70 C125 60 145 65 145 85 C145 105 135 130 100 130 Z"
              fill="#FFEADB"
            />

            {/* Cheeks */}
            <ellipse cx="68" cy="98" rx="7" ry="5" fill="#FFB7B2" opacity="0.6" />
            <ellipse cx="132" cy="98" rx="7" ry="5" fill="#FFB7B2" opacity="0.6" />

            {/* Nose */}
            <ellipse cx="100" cy="92" rx="6" ry="4.5" fill="#221C1D" />

            {/* Big Sparkling Eyes */}
            <ellipse cx="80" cy="80" rx="8.5" ry="10" fill="#1C1917" />
            <circle cx="77" cy="77" r="3.5" fill="white" />
            <circle cx="83" cy="83" r="1.5" fill="white" />

            <ellipse cx="120" cy="80" rx="8.5" ry="10" fill="#1C1917" />
            <circle cx="117" cy="77" r="3.5" fill="white" />
            <circle cx="123" cy="83" r="1.5" fill="white" />

            {/* Glasses Frames (Black Hipster Glasses) */}
            <rect
              x="64"
              y="68"
              width="32"
              height="24"
              rx="6"
              fill="none"
              stroke="#2B2625"
              strokeWidth="4"
            />
            <rect
              x="104"
              y="68"
              width="32"
              height="24"
              rx="6"
              fill="none"
              stroke="#2B2625"
              strokeWidth="4"
            />
            {/* Glasses Bridge */}
            <path d="M96 78 Q100 75 104 78" stroke="#2B2625" strokeWidth="4" fill="none" />
            {/* Glasses Temples */}
            <path d="M64 78 L52 76" stroke="#2B2625" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M136 78 L148 76" stroke="#2B2625" strokeWidth="3.5" strokeLinecap="round" />

            {/* Cheerful Smiling Mouth */}
            <path
              d="M86 100 Q100 120 114 100 Q100 106 86 100 Z"
              fill="#8A1822"
              stroke="#2B2625"
              strokeWidth="2"
            />
            <path d="M93 109 Q100 115 107 109 Q100 112 93 109 Z" fill="#F472B6" />

            {/* Red Hoodie Sweater Body */}
            <path
              d="M55 140 Q100 132 145 140 L160 210 Q100 218 40 210 Z"
              fill="#D3222A"
            />

            {/* Blue Employee Badge Lanyard */}
            <path d="M82 140 L97 175 L103 175 L118 140" stroke="#2563EB" strokeWidth="4" fill="none" />
            {/* ID Badge Card */}
            <rect x="91" y="175" width="18" height="26" rx="2" fill="white" stroke="#2563EB" strokeWidth="1.5" />
            <rect x="91" y="175" width="18" height="7" fill="#2563EB" />
            <rect x="94" y="185" width="12" height="6" fill="#93C5FD" rx="1" />
            <rect x="95" y="194" width="10" height="2" fill="#94A3B8" />

            {/* Chest Text: LX MMA in bold white */}
            <text
              x="62"
              y="166"
              fill="white"
              fontSize="12"
              fontWeight="900"
              fontFamily="sans-serif"
              letterSpacing="1"
            >
              LX
            </text>
            <text
              x="122"
              y="166"
              fill="white"
              fontSize="12"
              fontWeight="900"
              fontFamily="sans-serif"
              letterSpacing="1"
            >
              MMA
            </text>

            {/* Maroon Pants */}
            <path d="M50 208 L150 208 L145 240 L55 240 Z" fill="#78141E" />
          </svg>
        )}
      </div>

      {showBadge && (
        <span className="absolute -bottom-2 -right-1 px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-slate-900 rounded-full shadow-xs border border-amber-200 whitespace-nowrap">
          LX MMA 엘모
        </span>
      )}
    </div>
  );
};
