import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function FlowLogoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="6.5" fill="white" />
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="6.5"
        stroke="#111111"
        strokeWidth="1"
      />
      <circle cx="12" cy="12" r="4.8" stroke="#111111" strokeWidth="1.7" />
      <path
        d="M14.8 14.8 17 17"
        stroke="#111111"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 16V4M4.5 9.5 10 4l5.5 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PageIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 3.5h5.8L15 6.7V16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M11.5 3.5V7H15" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function FolderIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3.5 6.5A1.5 1.5 0 0 1 5 5h3l1.2 1.2H15A1.5 1.5 0 0 1 16.5 7.7v6.8A1.5 1.5 0 0 1 15 16H5a1.5 1.5 0 0 1-1.5-1.5V6.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 4.5v11M4.5 10h11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FolderPlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3.5 6.5A1.5 1.5 0 0 1 5 5h3l1.2 1.2H15A1.5 1.5 0 0 1 16.5 7.7v6.8A1.5 1.5 0 0 1 15 16H5a1.5 1.5 0 0 1-1.5-1.5V6.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M10 8.4v4.2M7.9 10.5h4.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5.5 6h9M8 6V4.8c0-.4.3-.8.8-.8h2.4c.5 0 .8.4.8.8V6M7 8v6M10 8v6M13 8v6M6.5 6l.6 9.2c0 .4.3.8.8.8h4.2c.5 0 .8-.4.8-.8l.6-9.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 6h12M4 10h12M4 14h12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="m5.5 5.5 9 9m0-9-9 9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M13.8 4.7a1.5 1.5 0 0 1 2.1 2.1l-7.9 7.9-3 .8.8-3 8-7.8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="m12.7 5.8 1.5 1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <rect
        x="4.5"
        y="9"
        width="11"
        height="7"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M6.8 9V7.2A3.2 3.2 0 0 1 10 4a3.2 3.2 0 0 1 3.2 3.2V9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UnlockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <rect
        x="4.5"
        y="9"
        width="11"
        height="7"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M13.2 9V7.2A3.2 3.2 0 0 0 10 4a3.2 3.2 0 0 0-3.2 3.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BookmarkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 4.5h8a1 1 0 0 1 1 1v10.2a.6.6 0 0 1-.95.49L10 13.2l-4.05 2.99A.6.6 0 0 1 5 15.7V5.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M13.9 4.2a6.2 6.2 0 1 0 1.9 11.5 6.4 6.4 0 0 1-7.6-7.6 6.2 6.2 0 0 0 5.7-3.9Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M10 3.5v1.6M10 14.9v1.6M15.6 10h-1.6M6 10H4.4M14.4 5.6l-1.2 1.2M6.8 13.2l-1.2 1.2M14.4 14.4l-1.2-1.2M6.8 6.8 5.6 5.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AssistantIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 3.5 11 5.8l2.5.2-1.9 1.6.6 2.4L10 8.7 7.8 10l.6-2.4L6.5 6l2.5-.2L10 3.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <rect
        x="4"
        y="11"
        width="12"
        height="5"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M7.2 13.5h.01M12.8 13.5h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MathsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <rect
        x="3.5"
        y="3.5"
        width="13"
        height="13"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M6.5 7.2h3M8 5.7v3M11.8 6.1h2.7M11.8 8.2h2.7M6.6 12.2h3M6.6 14.2h3M12.1 11.7l2.3 2.3M14.4 11.7l-2.3 2.3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M13.4 20v-6.3h2.1l.3-2.4h-2.4V9c0-.7.2-1.2 1.2-1.2H16V5.7c-.4-.1-.9-.1-1.6-.1-1.7 0-2.8 1-2.8 2.9v2.8H9.8v2.4h1.8V20Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="5.25"
        y="5.25"
        width="13.5"
        height="13.5"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3.3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.6" cy="7.6" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.5 10v8"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M11.8 18v-4.5c0-1.4 1-2.4 2.3-2.4 1.4 0 2.2.9 2.2 2.7V18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.1" r="1.05" fill="currentColor" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M13.6 5.2c.4 1.3 1.5 2.4 2.9 2.9v2a5.9 5.9 0 0 1-2.9-1v4.4a4.1 4.1 0 1 1-4.1-4.1c.3 0 .5 0 .8.1v2.1a2 2 0 1 0 1.2 1.9v-9h2.1v.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PracticeIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-4" />
      <path d="m14 4 6 6M11 17l-4 1 1-4L18 4a2.12 2.12 0 0 1 3 3Z" />
    </svg>
  );
}
