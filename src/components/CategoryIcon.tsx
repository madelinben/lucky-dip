import {
  Bike,
  BookOpen,
  Brush,
  Camera,
  CircleDot,
  Code,
  Dumbbell,
  Footprints,
  Heart,
  type LucideIcon,
  Mountain,
  Music,
  Palette,
  PersonStanding,
  Sparkles,
  Sun,
  Theater,
  Users,
  UtensilsCrossed,
  Waves,
} from "lucide-react";

// Categories store lucide icon names. A fixed map keeps the bundle small; unknown names fall back to Sparkles.
const ICONS: Record<string, LucideIcon> = {
  Bike,
  BookOpen,
  Brush,
  Camera,
  CircleDot,
  Code,
  Dumbbell,
  Footprints,
  Heart,
  Mountain,
  Music,
  Palette,
  PersonStanding,
  Sun,
  Theater,
  UtensilsCrossed,
  Users,
  Waves,
};

export function CategoryIcon({ name, size = 56 }: { name: string | null; size?: number }) {
  const Icon = (name && ICONS[name]) || Sparkles;
  return <Icon size={size} aria-hidden />;
}
