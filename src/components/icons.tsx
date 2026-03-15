import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function FlowLogoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="6.5" fill="white" />
      <rect x="2.5" y="2.5" width="19" height="19" rx="6.5" stroke="#111111" strokeWidth="1" />
      <circle cx="12" cy="12" r="4.8" stroke="#111111" strokeWidth="1.7" />
      <path d="M14.8 14.8 17 17" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" />
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
      <rect x="4.5" y="9" width="11" height="7" rx="1.8" stroke="currentColor" strokeWidth="1.3" />
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
      <rect x="4.5" y="9" width="11" height="7" rx="1.8" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M13.2 9V7.2A3.2 3.2 0 0 0 10 4a3.2 3.2 0 0 0-3.2 3.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
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
