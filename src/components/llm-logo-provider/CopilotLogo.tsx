type CopilotLogoProps = {
  className?: string;
};

export default function CopilotLogo({ className = 'w-5 h-5' }: CopilotLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M5 13.5c0-1.2 1-2 2.2-2 .9 0 1.4.4 2 .4h5.6c.6 0 1.1-.4 2-.4 1.2 0 2.2.8 2.2 2v1.8c0 2.2-3.1 3.7-7 3.7s-7-1.5-7-3.7v-1.8z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M8 9.2C8 7.4 9.6 6 12 6s4 1.4 4 3.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="9.5" cy="14.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="14.5" r="1" fill="currentColor" />
    </svg>
  );
}
