import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function base(props: IconProps) {
  const { title, ...rest } = props;
  return {
    viewBox: "0 0 24 24",
    width: 24,
    height: 24,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    role: "img" as const,
    "aria-hidden": title ? undefined : true,
    ...rest,
  };
}

export function AirIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M3 8h10a3 3 0 1 0-3-3" />
      <path d="M3 12h14a3 3 0 1 1-3 3" />
      <path d="M3 16h7" />
    </svg>
  );
}

export function ScienceIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M9 3h6" />
      <path d="M10 3v5.5L5.4 17A2.5 2.5 0 0 0 7.6 21h8.8a2.5 2.5 0 0 0 2.2-3.9L14 8.5V3" />
      <path d="M7 15h10" />
    </svg>
  );
}

export function RoverIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <rect x="3" y="9" width="14" height="7" rx="2.5" />
      <path d="M17 12h3.5" />
      <circle cx="7" cy="18" r="2.2" />
      <circle cx="13" cy="18" r="2.2" />
      <path d="M8 9V6h5" />
    </svg>
  );
}

export function GreenhouseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M12 21V9" />
      <path d="M12 13c-3 0-5-2-5-5 3 0 5 2 5 5Z" />
      <path d="M12 11c0-3 2-5 5-5 0 3-2 5-5 5Z" />
      <path d="M4 21h16" />
    </svg>
  );
}

export function DishIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M4 14a10 10 0 0 1 10-10" />
      <path d="M4 14 15 3a10 10 0 0 1-1 12Z" />
      <path d="M7 11 3 7" />
      <path d="M10 21h8" />
      <path d="M14 21v-5" />
    </svg>
  );
}

export function ShelterIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M3 20V11a9 9 0 0 1 18 0v9" />
      <path d="M3 20h18" />
      <path d="M9 20v-5a3 3 0 0 1 6 0v5" />
    </svg>
  );
}

export function BatteryIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <rect x="2.5" y="7" width="16" height="10" rx="2.5" />
      <path d="M21 10.5v3" />
      <path d="m9.5 9-2.5 6h3l-1 4 4.5-7h-3Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="m12 3 2.6 5.7 6.2.7-4.6 4.2 1.3 6.1L12 16.7 6.5 19.7l1.3-6.1L3.2 9.4l6.2-.7Z" />
    </svg>
  );
}

export function HelmetIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <circle cx="12" cy="11" r="7" />
      <path d="M5 12h14" />
      <path d="M9 19h6" />
    </svg>
  );
}

export function SoundIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M4 10v4h3l4 3.5v-11L7 10Z" />
      <path d="M16 9a4 4 0 0 1 0 6" />
      <path d="M18.5 6.5a7.5 7.5 0 0 1 0 11" />
    </svg>
  );
}

export function MutedIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M4 10v4h3l4 3.5v-11L7 10Z" />
      <path d="m16 10 4 4" />
      <path d="m20 10-4 4" />
    </svg>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5" />
    </svg>
  );
}

export function HelpIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.7 2.7 0 1 1 3.8 2.5c-.8.4-1.3 1-1.3 2" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

export function BermIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M3 20h18" />
      <path d="M4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z" />
      <path d="M7 12h4v4H7zM13 12h4v4h-4z" />
      <path d="M10 8h4v4h-4z" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M12 3 5 6v5c0 4.4 3 8.2 7 10 4-1.8 7-5.6 7-10V6Z" />
      <path d="M12 8v7" />
      <path d="M8.5 11.5h7" />
    </svg>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M5 19c0-8 5-13 14-14 1 9-4 15-11 15H5Z" />
      <path d="M5 19c2-5 5-7 9-9" />
    </svg>
  );
}
