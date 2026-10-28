import {
  Briefcase,
  Church,
  Clapperboard,
  HeartHandshake,
  Music,
  PartyPopper,
  Presentation,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Music,
  PartyPopper,
  Presentation,
  HeartHandshake,
  Trophy,
  Briefcase,
  Clapperboard,
  Church,
  Users,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Music;
  return <Icon className={className} />;
}
