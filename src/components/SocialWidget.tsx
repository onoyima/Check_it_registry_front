import type { CSSProperties } from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { useAuth } from '../contexts/AuthContext';
import companyInfo from '../lib/companyInfo';

const whatsappNumber = companyInfo.phones[0].replace(/\D/g, '').replace(/^0/, '');
const whatsappHref = `https://wa.me/234${whatsappNumber}?text=${encodeURIComponent(
  'Hello ProveOwnership, I need assistance.'
)}`;

const socialLinks = [
  { name: 'Facebook', icon: FaFacebookF, href: '#facebook', color: '#1877F2' },
  { name: 'X', icon: FaXTwitter, href: '#twitter', color: '#111111' },
  { name: 'LinkedIn', icon: FaLinkedinIn, href: '#linkedin', color: '#0A66C2' },
  { name: 'Instagram', icon: FaInstagram, href: '#instagram', color: '#E4405F' },
  { name: 'WhatsApp', icon: FaWhatsapp, href: whatsappHref, color: '#25D366' }
];

export default function SocialWidget() {
  const { user } = useAuth();

  if (user) return null;

  return (
    <nav className="social-widget" aria-label="Social media">
      {socialLinks.map((social) => {
        const external = social.href.startsWith('http');
        return (
          <a
            key={social.name}
            href={social.href}
            className="social-widget__link"
            style={{ '--social-color': social.color } as CSSProperties}
            aria-label={social.name}
            title={social.name}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <social.icon size={18} />
          </a>
        );
      })}
    </nav>
  );
}
