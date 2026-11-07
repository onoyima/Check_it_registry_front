import {
  BellRing,
  CheckCircle,
  Database,
  Fingerprint,
  Laptop,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Star,
  Users,
  Zap
} from 'lucide-react';

type Variant = 'hero' | 'features' | 'about' | 'community' | 'cta';

const iconSets: Record<Variant, Array<typeof Smartphone>> = {
  hero: [Smartphone, ShieldCheck, Fingerprint, Laptop, Database, MapPin, BellRing, CheckCircle],
  features: [ShieldCheck, Database, Fingerprint, Smartphone, RefreshCw, CheckCircle],
  about: [Fingerprint, MapPin, ShieldCheck, Database],
  community: [Users, Star, MapPin, ShieldCheck, CheckCircle],
  cta: [ShieldCheck, Zap, Smartphone, Fingerprint]
};

export default function FloatingIcons({ variant }: { variant: Variant }) {
  return (
    <div className={`floating-icons floating-icons--${variant}`} aria-hidden="true">
      {iconSets[variant].map((Icon, index) => (
        <span className="floating-icon" key={`${variant}-${index}`}>
          <span className="floating-icon__tile">
            <Icon size={20} strokeWidth={1.65} />
          </span>
        </span>
      ))}
    </div>
  );
}
