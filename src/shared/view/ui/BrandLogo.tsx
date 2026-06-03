import React, { useEffect, useState } from 'react';

interface BrandLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false,
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', width = 64, height = 64 }) => {
  const isDark = useIsDark();

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Hoo"
    >
      <rect width="200" height="200" rx="40" fill={isDark ? '#09090B' : '#FAFAFA'} />
      <path d="M40,72 A34,34 0 0 0 40,128" fill="none" stroke="#00F0FF" strokeWidth="6" strokeLinecap="round" />
      <path d="M160,72 A34,34 0 0 1 160,128" fill="none" stroke="#00F0FF" strokeWidth="6" strokeLinecap="round" />
      <circle cx="70" cy="100" r="30" fill="none" stroke={isDark ? '#FAFAFA' : '#09090B'} strokeWidth="9" />
      <circle cx="130" cy="100" r="30" fill="none" stroke={isDark ? '#FAFAFA' : '#09090B'} strokeWidth="9" />
      <polygon points="100,89 111,100 100,111 89,100" fill="#00F0FF" />
    </svg>
  );
};

export default BrandLogo;
