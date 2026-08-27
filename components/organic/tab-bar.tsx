import Link from "next/link";

const TABS = [
  {
    href: "/",
    key: "inicio",
    label: "Início",
    path: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  },
  {
    href: "/atividades",
    key: "atividades",
    label: "Atividades",
    path: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  },
] as const;

const DISABLED_TABS = [
  {
    key: "turma",
    label: "Turma",
    path: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  },
  {
    key: "perfil",
    label: "Perfil",
    path: "M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0",
  },
] as const;

export function TabBar({ active }: { active: "inicio" | "atividades" }) {
  return (
    <div className="stab">
      {TABS.map((tab) => (
        <Link
          aria-current={active === tab.key ? "page" : undefined}
          className="stab-link"
          href={tab.href}
          key={tab.key}
        >
          <TabIcon path={tab.path} />
          {tab.label}
        </Link>
      ))}
      {DISABLED_TABS.map((tab) => (
        <span aria-disabled="true" className="stab-link" key={tab.key}>
          <TabIcon path={tab.path} />
          {tab.label}
        </span>
      ))}
    </div>
  );
}

function TabIcon({ path }: { path: string }) {
  return (
    <svg
      fill="none"
      height="21"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.75"
      viewBox="0 0 24 24"
      width="21"
    >
      <title>Ícone</title>
      <path d={path} />
    </svg>
  );
}
