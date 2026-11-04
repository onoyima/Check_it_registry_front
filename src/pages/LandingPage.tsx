import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  RefreshCw,
  CheckCircle,
  Search,
  Users,
  AlertTriangle,
  ArrowRight,
  Globe,
  Database,
  X,
  Star,
  ChevronRight,
  BarChart3,
  Fingerprint,
  BellRing,
  Phone,
  Laptop,
  Shield,
  MapPin,
  Award,
  Zap,
  ShieldCheck,
  Mail,
  Building2,
  UserSquare2
} from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { companyInfo } from '../lib/companyInfo';
import { landingVariantsEnabled, landingVersions } from '../lib/landingVariants';
import Navbar from '../components/Navbar';
import FloatingIcons from '../components/FloatingIcons';
import { useAuth } from '../contexts/AuthContext';
import { useModules } from '../contexts/ModulesContext';
import './landing-page.css';

const FALLBACK_AVATAR = '/images/avatar-placeholder.svg';

const TEAM_PHOTOS: Record<string, string> = {
  'IKECHUKWU IZEGBU': '/images/team-ikechukwu-izegbu.jpg',
  'CLINTON BONIFACE': '/images/team-clinton-boniface.jpg',
  'Christopher Lawrence': '/images/team-christopher-lawrence.webp',
  'Egbe Ntami': '/images/team-egbe-ntami.jpg',
  'Sarah Okonjo': '/images/team-ceo.png',
  'David Adeleke': '/images/team-cto.png',
  'Grace Ibrahim': '/images/team-community.png'
};

const normalizeImageUrl = (value?: string) => {
  if (!value) return '';
  if (value.startsWith('data:image;base64,')) {
    return value.replace('data:image;base64,', 'data:image/jpeg;base64,');
  }
  return value;
};

const getTeamPhoto = (member: any) => (
  TEAM_PHOTOS[member?.name] ||
  normalizeImageUrl(member?.image_url || member?.image) ||
  FALLBACK_AVATAR
);

const getTestimonialPhoto = (testimonial: any) => (
  normalizeImageUrl(testimonial?.image_url || testimonial?.image) ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial?.name || 'User')}&background=16a34a&color=fff&bold=true`
);

const TESTIMONIAL_DEFAULTS = [
  { name: 'Chidinma O.', role: 'Student, University of Lagos', content: "I never thought I'd see my phone again. Prove Ownership made it happen in 2 days." },
  { name: 'Emeka A.', role: 'Freelance Developer', content: 'I sell devices regularly. The ownership certificate makes buyers trust me instantly.' },
  { name: 'ACP Balogun', role: 'NPF Cybercrime Unit', content: 'This platform has revolutionized how we handle stolen device cases. The data is instant and actionable.' },
  { name: 'Funke I.', role: 'IT Director, Lagos State University', content: 'We registered 2,400 laptops. The theft rate dropped 67% in one semester. This is the future.' }
];

const buildTestimonials = (items: any[]) => {
  const merged = [...items];
  const names = new Set(merged.map((item) => String(item?.name || '').trim().toLowerCase()));
  for (const fallback of TESTIMONIAL_DEFAULTS) {
    if (merged.length >= 4) break;
    const key = fallback.name.toLowerCase();
    if (!names.has(key)) {
      merged.push(fallback);
      names.add(key);
    }
  }
  return merged.slice(0, 4);
};

export default function LandingPage() {
  const { user, logout } = useAuth();
  const marketOn = useModules().visible('marketplace');
  const location = useLocation();
  const [stats, setStats] = useState({
    users: 0,
    devices: 0,
    verified_devices: 0,
    recovered_devices: 0
  });

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);


  const navigate = useNavigate();

  useEffect(() => {
    const CACHE_KEY = 'landing_content_cache';
    const CACHE_TTL = 3600000; // 1 hour

    const getCached = () => {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const cached = JSON.parse(raw);
        if (Date.now() - cached.timestamp > CACHE_TTL) {
          localStorage.removeItem(CACHE_KEY);
          return null;
        }
        return cached.data;
      } catch { return null }
    };

    const setCached = (data: any) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
      } catch { /* localStorage quota may be exceeded */ }
    };

    const cached = getCached();
    if (cached) {
      setTeamMembers(cached.team || []);
      setTestimonials(cached.testimonials || []);
    }

    const fetchLandingContent = async () => {
      try {
        const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';
        const API_URL = API_BASE ? `${API_BASE}/api` : (import.meta.env.VITE_API_URL || '/api');
        const res = await fetch(`${API_URL}/landing-content`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setTeamMembers(data.team || []);
            setTestimonials(data.testimonials || []);
            setCached(data);
          }
        }
      } catch (err) {
        console.error('Failed to load landing content', err);
      }
    };
    fetchLandingContent();

    const fetchStats = async () => {
      try {
        const data = await (apiClient as any).publicStats();
        // Keep zeros for anything missing so a partial response can't crash the page
        const n = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
        setStats({ users: n(data?.users), devices: n(data?.devices), verified_devices: n(data?.verified_devices), recovered_devices: n(data?.recovered_devices) });
      } catch (error) {
        console.error('Failed to load stats', error);
      }
    };
    fetchStats();
  }, []);

  const features = [
    {
      icon: Database,
      title: "Your Digital Vault",
      desc: "We keep a safe, permanent record of your personal devices linked directly to you.",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: ShieldCheck,
      title: "Prove It's Yours",
      desc: "Selling your phone? Show buyers it's legally yours with instant, trusted verification.",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: BellRing,
      title: "Find Missing Items",
      desc: "If you lose something, we instantly notify the police and block it from being resold.",
      gradient: "from-amber-500 to-orange-600"
    },
    {
      icon: Fingerprint,
      title: "Anti-Theft Shield",
      desc: "Your devices are cryptographically tied to your identity, making theft pointless.",
      gradient: "from-violet-500 to-purple-600"
    },
    {
      icon: BarChart3,
      title: "Real-Time Intelligence",
      desc: "Get alerts about stolen devices in your area and stay ahead of the market.",
      gradient: "from-rose-500 to-pink-600"
    },
    {
      icon: Globe,
      title: "Nationwide Coverage",
      desc: "Integrated with law enforcement databases across Nigeria for faster recovery.",
      gradient: "from-cyan-500 to-sky-600"
    }
  ];

  const displayTeam = teamMembers;
  const displayTestimonials = buildTestimonials(testimonials);

  return (
    <>
      {/* Navbar rendered outside the landing-page div to prevent overflow clipping */}
      <Navbar user={user} onLogout={logout} />

      {/* Landing page version switcher (development only) */}
      {landingVariantsEnabled && (
      <div style={{
        position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 1040, display: 'flex', alignItems: 'center', gap: 4,
        maxWidth: 'calc(100vw - 20px)', overflowX: 'auto',
        background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
        border: '1px solid var(--glass-border)', borderRadius: 12,
        padding: '6px', boxShadow: 'var(--glass-shadow)',
        scrollbarWidth: 'none', msOverflowStyle: 'none'
      }}>
        <span className="d-none d-md-inline" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', padding: '0 10px', whiteSpace: 'nowrap', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>View:</span>
        {landingVersions.map((v) => (
          <Link
            key={v.path}
            to={v.path}
            style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 'var(--text-sm)', fontWeight: 600,
              textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap',
              background: location.pathname === v.path ? 'var(--primary-600)' : 'transparent',
              color: location.pathname === v.path ? 'white' : 'var(--text-secondary)',
            }}
          >
            {v.label}
          </Link>
        ))}
      </div>
      )}
      <div className="landing-page">
      {/* ===================== HERO SECTION ===================== */}
      <section className="landing-hero">
        <div className="landing-hero__media" aria-hidden="true"></div>
        <FloatingIcons variant="hero" />

        <div className="container px-4">
          <div className="row align-items-center g-5 min-vh-75">
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="landing-kicker">
                  <span className="d-inline-block rounded-circle bg-primary" style={{ width: 6, height: 6 }}></span>
                  Device ownership registry · Nigeria
                </div>

                <h1 className="landing-hero__title">
                  Ownership you can prove.
                  <span className="landing-hero__accent">Devices you can recover.</span>
                </h1>

                <p className="landing-hero__lede">
                  Register the devices that matter to you, link them to a verified identity, and keep a permanent ownership record that works when it matters most.
                </p>

                <div className="d-flex flex-column flex-sm-row gap-3">
                  {user ? (
                    <Link to="/dashboard" className="landing-btn landing-btn--primary">
                      Go to Dashboard <ArrowRight size={19} />
                    </Link>
                  ) : (
                    <>
                      <Link to="/register" className="landing-btn landing-btn--primary">
                        Register a device <ArrowRight size={19} />
                      </Link>
                      <button onClick={() => {
                        document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
                      }} className="landing-btn landing-btn--quiet">
                        See how it works
                      </button>
                    </>
                  )}
                </div>

                <div className="landing-hero__proof">
                  <span><ShieldCheck size={16} style={{ color: 'var(--lp-accent)' }} /> Bank-grade security</span>
                  <span><Award size={16} style={{ color: 'var(--lp-accent)' }} /> LEA database verified</span>
                  <span><Zap size={16} style={{ color: 'var(--lp-accent)' }} /> Real-time sync</span>
                </div>
              </motion.div>
            </div>

            <div className="col-lg-6 position-relative">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.18 }}
                className="landing-hero__visual"
              >
                <div className="landing-phone">
                  <div className="landing-phone__status">
                    <span>9:41</span>
                    <div className="landing-phone__status-icons" aria-hidden="true">
                      <span></span>
                      <span></span>
                      <span className="landing-phone__battery"><i></i></span>
                    </div>
                  </div>

                  <div className="landing-phone__screen">
                    <div className="landing-phone__head">
                      <span>My Devices</span>
                      <span className="landing-phone__shield"><Shield size={14} /></span>
                    </div>

                    <div className="landing-phone__device is-active">
                      <span className="landing-phone__device-icon"><Phone size={22} /></span>
                      <div className="landing-phone__device-info">
                        <strong>iPhone 14 Pro</strong>
                        <span><CheckCircle size={10} /> Protected</span>
                      </div>
                      <em>Live</em>
                    </div>

                    <div className="landing-phone__device">
                      <span className="landing-phone__device-icon"><Laptop size={22} /></span>
                      <div className="landing-phone__device-info">
                        <strong>MacBook Air</strong>
                        <span><CheckCircle size={10} /> Protected</span>
                      </div>
                    </div>

                    <div className="landing-phone__alert">
                      <AlertTriangle size={16} />
                      <div>
                        <strong>Stolen alert</strong>
                        <span>1 device in your area reported stolen recently.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="landing-float-card landing-float-card--verified d-none d-lg-flex"
                >
                  <span className="landing-float-card__icon landing-float-card__icon--green">
                    <CheckCircle size={20} />
                  </span>
                  <div>
                    <strong>Device Verified</strong>
                    <span>IMEI: 3546810...</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="landing-float-card landing-float-card--registry d-none d-lg-flex"
                >
                  <span className="landing-float-card__icon landing-float-card__icon--blue">
                    <Database size={20} />
                  </span>
                  <div>
                    <strong>Registry Updated</strong>
                    <span>Real-time sync</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="landing-float-card landing-float-card--recovered d-none d-xl-flex"
                >
                  <MapPin size={14} /> 12 Recovered This Week
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== MARQUEE STATS ===================== */}
      <section className="landing-stats py-4">
        <div className="container">
          <div className="row g-4">
            <div className="col-6 col-lg-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-3"
              >
                <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                  <Users size={20} className="text-primary" />
                  <span className="landing-stat__value">
                    {stats.users.toLocaleString()}
                  </span>
                </div>
                <div className="text-uppercase fw-semibold" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)' }}>Users</div>
              </motion.div>
            </div>
            <div className="col-6 col-lg-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center p-3"
              >
                <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                  <Smartphone size={20} style={{ color: 'var(--text-primary)' }} />
                  <span className="landing-stat__value">
                    {stats.devices.toLocaleString()}
                  </span>
                </div>
                <div className="text-uppercase fw-semibold" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)' }}>Devices</div>
              </motion.div>
            </div>
            <div className="col-6 col-lg-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center p-3"
              >
                <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                  <ShieldCheck size={20} className="text-success" />
                  <span className="landing-stat__value">
                    {stats.verified_devices.toLocaleString()}
                  </span>
                </div>
                <div className="text-uppercase fw-semibold" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)' }}>Verified</div>
              </motion.div>
            </div>
            <div className="col-6 col-lg-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center p-3"
              >
                <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                  <RefreshCw size={20} className="text-warning" />
                  <span className="landing-stat__value">
                    {stats.recovered_devices.toLocaleString()}
                  </span>
                </div>
                <div className="text-uppercase fw-semibold" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)' }}>Recovered</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURES SECTION ===================== */}
      <section id="features-section" className="landing-section landing-features">
        <div className="landing-features__media" aria-hidden="true"></div>
        <FloatingIcons variant="features" />
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <div className="landing-kicker">Why Prove Ownership</div>
            <h2 className="landing-section__title">A record that speaks for you.</h2>
            <p className="landing-section__lede">
              One place to register your devices, prove ownership, and act quickly when something goes missing.
            </p>
          </motion.div>

          <div className="row g-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.07 }}
                  className="col-lg-4 col-md-6"
                >
                  <div className="landing-feature-card">
                    <div className="landing-feature-card__head">
                      <span className="landing-feature-card__index">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="landing-feature-card__icon"><Icon size={21} /></span>
                    </div>
                    <h5>{feature.title}</h5>
                    <p>{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="landing-image-band">
            <img src="/images/features-bg.png" alt="Secure device registration and recovery" loading="lazy" />
            <div className="landing-image-band__content">
              <div className="landing-kicker">From registration to recovery</div>
              <h3>One record. Every handoff covered.</h3>
              <p>
                Your ownership record stays with the device through resale, repair, loss, and recovery, so the right person can always be identified.
              </p>
            </div>
          </div>

          {/* Mid-section CTA: checking is for signed-in people only */}
          {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-5 pt-4"
          >
            <button
              onClick={() => navigate('/device-check')}
              className="landing-btn landing-btn--quiet"
            >
              <Search size={18} /> Check a device status
            </button>
          </motion.div>
          )}
        </div>
      </section>

      {/* ===================== ABOUT US SECTION ===================== */}
      <section id="about" className="landing-section" style={{ scrollMarginTop: '80px' }}>
        <FloatingIcons variant="about" />
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <div className="landing-kicker">About Prove Ownership</div>
            <h2 className="landing-section__title">Built around accountability.</h2>
          </motion.div>

          <div className="row g-4 align-items-center">
            <div className="col-lg-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <p style={{ color: 'var(--lp-muted)', fontSize: '1.04rem', lineHeight: '1.75' }}>
                  {companyInfo.description}
                </p>
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <span className="d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold" style={{ fontSize: '0.82rem', color: 'var(--lp-accent)', background: 'var(--lp-accent-soft)', borderRadius: 8 }}>
                    <ShieldCheck size={16} /> Owned &amp; operated by {companyInfo.name}
                  </span>
                  <span className="d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold" style={{ fontSize: '0.82rem', color: 'var(--lp-muted)', background: 'var(--lp-surface)', border: '1px solid var(--lp-line)', borderRadius: 8 }}>
                    <MapPin size={16} /> {companyInfo.address}
                  </span>
                </div>

                <div className="landing-about-visual">
                  <img
                    src="/images/hero-bg.png"
                    alt="Device ownership and recovery records"
                    loading="lazy"
                  />
                  <div className="landing-about-visual__caption">
                    <span>Always on record</span>
                    <strong>Ownership that follows the device, not the moment.</strong>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="col-lg-6 offset-lg-1">
              <div className="row g-3">
                {[
                  { icon: Database, title: 'Device Registration', desc: 'Register your devices and keep a permanent, verified record of ownership.' },
                  { icon: Fingerprint, title: 'Identity Verification', desc: 'Identity checks help prevent fraudulent registrations and protect genuine owners.' },
                  { icon: AlertTriangle, title: 'Loss & Theft Reports', desc: 'Report lost, stolen, or damaged assets so they can be flagged and protected.' },
                  { icon: ShieldCheck, title: 'Secure Payments', desc: 'An integrated online payment system securely processes payments for applicable services.' }
                ].map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.07 }}
                      className="col-sm-6"
                    >
                      <div className="landing-info-card">
                        <span className="landing-info-card__icon"><Icon size={20} /></span>
                        <h6>{item.title}</h6>
                        <p>{item.desc}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TEAM SECTION ===================== */}
      <section className="landing-section">
        <FloatingIcons variant="about" />
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <div className="landing-kicker">Our team</div>
            <h2 className="landing-section__title">Real people behind the record.</h2>
            <p className="landing-section__lede">
              A small team of builders and problem solvers creating a more accountable way to own and recover devices.
            </p>
          </motion.div>

          <div className="row g-4 justify-content-center">
            {displayTeam.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="col-lg-4 col-md-6"
              >
                <div
                  className="landing-info-card p-0 overflow-hidden"
                  onClick={() => setSelectedMember(member)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="position-relative overflow-hidden" style={{ height: '300px' }}>
                    <img
                      src={getTeamPhoto(member)}
                      alt={member.name}
                      className="w-100 h-100 object-fit-cover"
                      style={{ transition: 'transform 0.5s ease' }}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                    <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.72))'
                    }}>
                      <div className="text-white fw-bold">{member.name}</div>
                      <div className="text-white-50" style={{ fontSize: 'var(--text-sm)' }}>{member.role}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="mb-0" style={{ color: 'var(--lp-muted)', lineHeight: '1.65', fontSize: '0.86rem' }}>
                      {member.content || member.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS SECTION ===================== */}
      <section className="landing-section">
        <FloatingIcons variant="community" />
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <div className="landing-kicker">From the community</div>
            <h2 className="landing-section__title">Trusted across Nigeria.</h2>
            <p className="landing-section__lede">
              What device owners say after putting their records in one place.
            </p>
          </motion.div>

          <div className="row g-4">
            {displayTestimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="col-md-6 col-lg-3"
              >
                <div className="landing-testimonial">
                  <div className="landing-testimonial__stars">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={13} fill="currentColor" />)}
                  </div>
                  <p>"{testimonial.content || testimonial.quote}"</p>
                  <div className="landing-testimonial__author">
                    <img
                      src={getTestimonialPhoto(testimonial)}
                      alt={testimonial.name}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                    />
                    <div>
                      <strong>{testimonial.name}</strong>
                      <span>{testimonial.role}{testimonial.location ? ` \u2022 ${testimonial.location}` : ''}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="landing-image-band landing-image-band--compact">
            <img src="/images/cta-bg.png" alt="Verified recovery across Nigeria" loading="lazy" />
            <div className="landing-image-band__content">
              <div className="landing-kicker">A shared record</div>
              <h3>Recovery works when everyone can verify.</h3>
              <p>
                Owners, buyers, and recovery teams can all work from the same trusted ownership record.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CTA SECTION ===================== */}
      <section className="landing-cta-section">
        <div className="container">
          <div className="landing-cta">
            <div className="landing-cta__media" aria-hidden="true"></div>
            <FloatingIcons variant="cta" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="py-4"
            >
              <h2 className="mb-3">Ready to protect what matters?</h2>
              <p className="mb-5">
                Create your ownership record before you need it. It takes less time than finding a missing device.
              </p>

              {!user && (
                <div className="d-flex justify-content-center gap-3 flex-column flex-sm-row">
                  <Link to="/register" className="landing-btn landing-btn--primary">
                    Create free account <ChevronRight size={19} />
                  </Link>
                  <Link to="/login" className="landing-btn landing-btn--quiet">
                    Sign in
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===================== CONTACT / COMPANY INFO SECTION ===================== */}
      <section id="contact" className="landing-contact">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <div className="landing-kicker">Contact</div>
            <h2 className="landing-section__title">Talk to the people behind it.</h2>
            <p className="landing-section__lede">
              Reach the team that owns and operates {companyInfo.product}. We can answer questions about your account, your devices, or this platform.
            </p>
          </motion.div>

          <div className="row g-4">
            {[
              { icon: Building2, label: 'Company Name', value: companyInfo.name, sub: `Operator of ${companyInfo.product}` },
              { icon: UserSquare2, label: 'Company Owner', value: companyInfo.owner, sub: companyInfo.ownerTitle },
              { icon: MapPin, label: 'Operational Address', value: companyInfo.address, sub: 'Registered office' },
              { icon: Mail, label: 'Email', value: companyInfo.emails[0], sub: companyInfo.emails[1], href: `mailto:${companyInfo.emails[0]}`, hrefSub: `mailto:${companyInfo.emails[1]}` },
              { icon: Phone, label: 'Phone Number', value: companyInfo.phones[0], sub: companyInfo.phones[1], href: `tel:${companyInfo.phones[0]}`, hrefSub: `tel:${companyInfo.phones[1]}` },
              { icon: Globe, label: 'Website', value: companyInfo.website, sub: 'Online support 24/7', href: `https://${companyInfo.website}` }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 }}
                  className="col-md-6 col-lg-4"
                >
                  <div className="landing-info-card">
                    <div className="d-flex align-items-start gap-3">
                      <span className="landing-info-card__icon flex-shrink-0" style={{ marginBottom: 0 }}>
                        <Icon size={20} />
                      </span>
                      <div className="min-w-0">
                        <div className="text-uppercase fw-semibold mb-1" style={{ color: 'var(--lp-faint)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>
                          {item.label}
                        </div>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="d-inline-block fw-bold text-decoration-none"
                            style={{ color: 'var(--lp-ink)', fontSize: '0.92rem', wordBreak: 'break-word' }}
                          >
                            {item.value}
                          </a>
                        ) : (
                          <div className="fw-bold" style={{ color: 'var(--lp-ink)', fontSize: '0.92rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
                            {item.value}
                          </div>
                        )}
                        {item.sub && (
                          item.hrefSub ? (
                            <a href={item.hrefSub} className="d-block text-decoration-none mt-1" style={{ color: 'var(--lp-muted)', fontSize: '0.79rem' }}>
                              {item.sub}
                            </a>
                          ) : (
                            <div className="mt-1" style={{ color: 'var(--lp-muted)', fontSize: '0.79rem' }}>{item.sub}</div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="landing-footer py-5">
        <div className="container px-4">
          <div className="row g-4 pb-4">
            <div className="col-lg-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <img src="/logo1.png" alt={`${companyInfo.product} Logo`} style={{ height: 32, objectFit: 'contain' }} />
                <span className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: 'var(--text-lg)' }}>{companyInfo.product}</span>
              </div>
              <p style={{ color: 'var(--text-tertiary)', lineHeight: 'var(--leading-relaxed)' }}>
                Empowering ownership, preventing theft, and enabling recovery through technology.
              </p>
              <div className="d-flex flex-column gap-2 mt-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                <div className="d-flex align-items-start gap-2">
                  <Building2 size={15} className="flex-shrink-0 mt-1" style={{ color: 'var(--primary-600)' }} />
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{companyInfo.name}</span>
                </div>
                <div className="d-flex align-items-start gap-2">
                  <UserSquare2 size={15} className="flex-shrink-0 mt-1" style={{ color: 'var(--primary-600)' }} />
                  <span>{companyInfo.owner} &mdash; {companyInfo.ownerTitle}</span>
                </div>
                <div className="d-flex align-items-start gap-2">
                  <MapPin size={15} className="flex-shrink-0 mt-1" style={{ color: 'var(--primary-600)' }} />
                  <span>{companyInfo.address}</span>
                </div>
                <div className="d-flex align-items-start gap-2">
                  <Mail size={15} className="flex-shrink-0 mt-1" style={{ color: 'var(--primary-600)' }} />
                  <span className="d-flex flex-column">
                    {companyInfo.emails.map((email) => (
                      <a key={email} href={`mailto:${email}`} className="text-decoration-none" style={{ color: 'var(--text-tertiary)' }}>{email}</a>
                    ))}
                  </span>
                </div>
                <div className="d-flex align-items-start gap-2">
                  <Phone size={15} className="flex-shrink-0 mt-1" style={{ color: 'var(--primary-600)' }} />
                  <span className="d-flex flex-column">
                    {companyInfo.phones.map((phone) => (
                      <a key={phone} href={`tel:${phone}`} className="text-decoration-none" style={{ color: 'var(--text-tertiary)' }}>{phone}</a>
                    ))}
                  </span>
                </div>
              </div>
              <div className="d-flex gap-3 mt-3">
                {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                  <a key={social} href={`#${social}`} className="d-inline-flex align-items-center justify-content-center rounded-circle text-decoration-none" style={{
                    width: 36, height: 36,
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-tertiary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}>
                    {social[0].toUpperCase()}
                  </a>
                ))}
              </div>
            </div>
            <div className="col-6 col-lg-2 offset-lg-1">
              <h6 className="fw-bold mb-3 text-uppercase" style={{ color: 'var(--text-primary)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)' }}>Platform</h6>
              <ul className="list-unstyled d-flex flex-column gap-2">
                {user && <li><Link to="/device-check" className="text-decoration-none" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Check an item</Link></li>}
                {marketOn && <li><Link to="/marketplace/browse" className="text-decoration-none" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Marketplace</Link></li>}
                <li><Link to="/found-device" className="text-decoration-none" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Report Found</Link></li>
              </ul>
            </div>
            <div className="col-6 col-lg-2">
              <h6 className="fw-bold mb-3 text-uppercase" style={{ color: 'var(--text-primary)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)' }}>Company</h6>
              <ul className="list-unstyled d-flex flex-column gap-2">
                <li><a href="#about" className="text-decoration-none" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>About Us</a></li>
                <li><a href="#contact" className="text-decoration-none" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Contact</a></li>
                <li><Link to="/privacy" className="text-decoration-none" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Privacy</Link></li>
              </ul>
            </div>
            <div className="col-lg-3">
              <h6 className="fw-bold mb-3 text-uppercase" style={{ color: 'var(--text-primary)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)' }}>Stay Updated</h6>
              <div className="d-flex gap-2">
                <input type="text" className="form-control" placeholder="Enter your email" aria-label="Email" style={{ borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }} />
                <button className="btn btn-primary flex-shrink-0" type="button" style={{ borderRadius: 12, whiteSpace: 'nowrap', padding: '10px 20px' }}>Subscribe</button>
              </div>
              <small className="d-block mt-2" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                Latest security alerts and feature updates.
              </small>
            </div>
          </div>
          <div className="pt-4 mt-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
              &copy; {new Date().getFullYear()} {companyInfo.name} &mdash; {companyInfo.product}. All rights reserved.
            </span>
            <div className="d-flex gap-3">
              <a href="#terms" className="text-decoration-none" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Terms</a>
              <Link to="/privacy" className="text-decoration-none" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Privacy</Link>
              <a href="#cookies" className="text-decoration-none" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ===================== TEAM MEMBER MODAL ===================== */}
      <AnimatePresence>
        {selectedMember && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, padding: '20px', backdropFilter: 'blur(4px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ maxWidth: '800px', width: '100%' }}
            >
              <div className="overflow-hidden border-0 rounded-4 shadow-lg" style={{ background: 'var(--bg-primary)' }}>
                <div className="row g-0">
                  <div className="col-md-5 position-relative" style={{ minHeight: '300px' }}>
                    <img
                      src={getTeamPhoto(selectedMember)}
                      alt={selectedMember.name}
                      className="w-100 h-100 object-fit-cover position-absolute"
                      onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                    />
                  </div>
                  <div className="col-md-7">
                    <div className="p-4 d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{selectedMember.name}</h5>
                        <div className="fw-semibold" style={{ color: 'var(--primary-600)', fontSize: 'var(--text-sm)' }}>{selectedMember.role}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedMember(null)}
                        className="btn p-2 border-0 rounded-2 d-flex align-items-center justify-content-center"
                        style={{ color: 'var(--text-tertiary)', background: 'var(--bg-tertiary)', width: 36, height: 36 }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="px-4 pb-4">
                      <p className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                        {selectedMember.content || selectedMember.desc}
                      </p>
                      <button className="btn btn-outline-primary rounded-pill px-4 fw-semibold" onClick={() => setSelectedMember(null)}>Close Profile</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  </>
  );
}