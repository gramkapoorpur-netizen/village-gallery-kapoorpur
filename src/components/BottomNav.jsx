import { Home, IdCard, Images, Landmark, Send, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

const navItems = [
  { id: "home", label: "होम", icon: Home },
  { id: "gallery", label: "गैलरी", icon: Images },
  { id: "memories", label: "यादें", icon: Sparkles },
  { id: "circle", label: "सर्कल", icon: UsersRound },
  { id: "profiles", label: "ID", icon: IdCard },
  { id: "submit", label: "भेजें", icon: Send },
  { id: "about", label: "गांव", icon: Landmark },
  { id: "admin", label: "एडमिन", icon: ShieldCheck },
];

export default function BottomNav({ view, setView }) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            className={view === item.id ? "active" : ""}
            onClick={() => setView(item.id)}
            aria-label={item.label}
          >
            <Icon size={19} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
