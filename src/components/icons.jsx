// A small hand-rolled icon set — line icons, 1.75 stroke, rounded joins.
// Kept deliberately minimal so Growly doesn't depend on an icon package.

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function HomeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9v10a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1V9" />
    </svg>
  );
}

export function StockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M3.5 8 12 3.5 20.5 8 12 12.5 3.5 8Z" />
      <path d="M3.5 8v8L12 20.5 20.5 16V8" />
      <path d="M12 12.5V20.5" />
    </svg>
  );
}

export function ProductsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.6" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.6" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.6" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.6" />
    </svg>
  );
}

export function InsightsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4 19V13" />
      <path d="M9.5 19V9" />
      <path d="M15 19v-6.5" />
      <path d="M20 19V6" />
      <path d="M4 12.5 9 8l4.5 3L20 5.5" />
    </svg>
  );
}

export function PlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function ChevronLeftIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M15 5 8 12l7 7" />
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.35-4.35" />
    </svg>
  );
}

export function EditIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  );
}

export function TrashIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M5 7h14" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M7 7l1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="m5 13 4.5 4.5L19 8" />
    </svg>
  );
}

export function SwitchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4 8h13M17 8l-3-3M17 8l-3 3" />
      <path d="M20 16H7M7 16l3-3M7 16l3 3" />
    </svg>
  );
}

export function BoxOpenIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M3.5 9.5 12 5l8.5 4.5v7L12 21l-8.5-4.5v-7Z" />
      <path d="M3.5 9.5 12 14l8.5-4.5" />
      <path d="M12 14v7" />
    </svg>
  );
}

export function OrdersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M6 3h12a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2Z" />
      <path d="M9 8h6M9 12h6M9 15h4" />
    </svg>
  );
}

export function ExpenseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 10h18M7 15h2M15 15h2" />
    </svg>
  );
}

export function SettingsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

export function DownloadIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

export function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function SunIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

// ---- craft / business-type icons ----

export function WhiskIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3v6" />
      <path d="M8.5 9c-2 2-2 6 0 8.5C10 20 12 20 12 20s2 0 3.5-2.5c2-2.5 2-6.5 0-8.5" />
      <path d="M9.5 9c-1 2-1 5 0 7M14.5 9c1 2 1 5 0 7" />
      <path d="M12 20v1" />
    </svg>
  );
}

export function SparkleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 4c.6 3 1.8 4.2 4.8 4.8-3 .6-4.2 1.8-4.8 4.8-.6-3-1.8-4.2-4.8-4.8C10.2 8.2 11.4 7 12 4Z" />
      <path d="M18.5 15c.3 1.4.9 2 2.3 2.3-1.4.3-2 .9-2.3 2.3-.3-1.4-.9-2-2.3-2.3 1.4-.3 2-.9 2.3-2.3Z" />
    </svg>
  );
}

export function DropletIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3.5c3 4 6 7.4 6 10.8a6 6 0 0 1-12 0c0-3.4 3-6.8 6-10.8Z" />
    </svg>
  );
}

export function PaletteIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 4a8 8 0 1 0 0 16c1.1 0 1.8-.9 1.4-1.9-.2-.5-.1-1.1.3-1.5.4-.4 1-.5 1.5-.3 1.4.5 2.8-.6 2.8-2.1V13A8 8 0 0 0 12 4Z" />
      <circle cx="9" cy="9.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="8" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="13.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function NeedleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M6 18 17.5 6.5a2.1 2.1 0 0 1 3 3L8.5 21 4 20l1-4.5Z" />
      <circle cx="16.2" cy="7.8" r="1.1" />
      <path d="M4 20l3-1" />
    </svg>
  );
}

export function TiffinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="5" y="10" width="14" height="9.5" rx="2" />
      <path d="M6.5 10V7.5a1.5 1.5 0 0 1 1.5-1.5h8a1.5 1.5 0 0 1 1.5 1.5V10" />
      <path d="M5 14.2h14" />
      <path d="M10.3 4.5h3.4" />
    </svg>
  );
}

export function HandIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M8 12.5V5.8a1.3 1.3 0 1 1 2.6 0V11" />
      <path d="M10.6 11V4.6a1.3 1.3 0 1 1 2.6 0V11" />
      <path d="M13.2 11V5.8a1.3 1.3 0 1 1 2.6 0V13" />
      <path d="M15.8 8.8a1.3 1.3 0 1 1 2.6 0v6.7c0 3-2.2 5.5-5.6 5.5-2.3 0-3.6-.7-4.8-2.2L5 15.4c-.6-.8-.4-1.8.4-2.3.7-.4 1.5-.3 2 .3l1.4 1.6" />
    </svg>
  );
}

const CRAFT_ICONS = {
  whisk: WhiskIcon,
  sparkle: SparkleIcon,
  droplet: DropletIcon,
  palette: PaletteIcon,
  needle: NeedleIcon,
  tiffin: TiffinIcon,
  hand: HandIcon,
};

export function CraftIcon({ icon, ...props }) {
  const Cmp = CRAFT_ICONS[icon] || HandIcon;
  return <Cmp {...props} />;
}
