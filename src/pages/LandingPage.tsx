import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Smartphone, 
  RefreshCw, 
  CheckCircle, 
  Search, 
  Lock, 
  Users, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Globe,
  Database,
  Cpu,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    devices: 0,
    verified_devices: 0,
    recovered_devices: 0
  });
  
  const [activeFeature, setActiveFeature] = useState(0);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  
  // Search Modal State
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchImei, setSearchImei] = useState('');
  const [searchSerial, setSearchSerial] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Extracted custom cursor state to global App component

  const handleSearchCheck = async () => {
    setSearchError(null);
    setSearchResult(null);
    if (!searchImei && !searchSerial) {
        setSearchError('Please enter IMEI or Serial Number');
        return;
    }

    try {
        setSearchLoading(true);
        const params = new URLSearchParams();
        if (searchImei) params.set('imei', searchImei);
        if (searchSerial) params.set('serial', searchSerial);

        const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';
        const API_URL = API_BASE ? `${API_BASE}/api` : (import.meta.env.VITE_API_URL || '/api');
        const res = await fetch(`${API_URL}/public-check?${params.toString()}`);
        if (!res.ok) throw new Error('Check failed');
        const data = await res.json();
        setSearchResult(data);
    } catch (err) {
        setSearchError('Failed to verify device. Please try again.');
    } finally {
        setSearchLoading(false);
    }
  };

  useEffect(() => {
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
                }
            }
        } catch (err) {
            console.error('Failed to load landing content', err);
        }
    };
    fetchLandingContent();

    const fetchStats = async () => {
      try {
        // @ts-ignore
        const data = await supabase.publicStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats', error);
      }
    };
    fetchStats();
    
    // Feature slider logic
    const interval = setInterval(() => {
        setActiveFeature((prev) => (prev + 1) % 3);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  const features = [
      {
          icon: <Database className="text-primary" size={32} />,
          title: "Your Digital Vault",
          desc: "We keep a safe, permanent record of your personal devices linked directly to you."
      },
      {
          icon: <Shield className="text-success" size={32} />,
          title: "Prove It's Yours",
          desc: "Selling your phone? Show buyers it's legally yours with instant, trusted verification."
      },
      {
          icon: <RefreshCw className="text-warning" size={32} />,
          title: "Find Missing Items",
          desc: "If you lose something, we instantly notify the police and block it from being resold."
      }
  ];

  return (
    <div className="landing-page overflow-x-hidden" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Background Elements */}
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-body-tertiary" style={{ zIndex: 0 }}></div>

      <div style={{ position: 'relative', zIndex: 1050 }}>
        <Navbar user={user} onLogout={logout} />
      </div>
      
      {/* Hero Section */}
      <section className="position-relative pt-5 pb-5 mt-5">
        <div className="container px-4 py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 z-2">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4 bg-primary bg-opacity-10 border border-primary border-opacity-25 text-primary fw-medium">
                    <span className="d-flex h-2 w-2 rounded-circle bg-primary"></span>
                    Now LIVE in Nigeria
                </div>
                <h1 className="display-3 fw-bold lh-1 mb-3" style={{ color: 'var(--text-primary)' }}>
                  Protect Your <br/><span className="text-primary">Devices Today</span>
                </h1>
                <p className="lead fs-4 mb-5" style={{ color: 'var(--text-secondary)', maxWidth: '540px', lineHeight: '1.6' }}>
                  Every day, thousands of phones and laptops go missing. We help you secure yours before it's too late. Register your gadgets, prove you own them, and get them back faster if they're ever lost.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3">
                  {user ? (
                    <Link to="/dashboard" className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm hover-scale">
                       Go to Dashboard <ArrowRight size={20} />
                    </Link>
                  ) : (
                    <>
                      <Link to="/register" className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm hover-scale">
                        Get Protected Free <ArrowRight size={20} />
                      </Link>
                      <button onClick={() => {
                          document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
                      }} className="btn btn-outline-secondary bg-body btn-lg px-5 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center hover-scale shadow-sm">
                        See How It Works
                      </button>
                    </>
                  )}
                </div>
                
                <div className="mt-5 d-flex align-items-center gap-4 text-muted small">
                    <div className="d-flex align-items-center gap-2">
                        <CheckCircle className="text-success" size={16} /> <span>Bank-Grade Security</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <CheckCircle className="text-success" size={16} /> <span>LEA Database Verified</span>
                    </div>
                </div>
              </motion.div>
            </div>
            
            <div className="col-lg-6 position-relative z-1">
               {/* Animated Hero Graphic */}
              <div className="position-relative" style={{ minHeight: '500px' }}>
                 {/* Floating Elements Animation */}
                 <motion.div 
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="position-absolute top-0 end-0 bg-body border border-light p-3 rounded-4 shadow-sm"
                    style={{ zIndex: 3, top: '10%', right: '10%' }}
                 >
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-success bg-opacity-20 p-2 rounded-circle">
                            <CheckCircle className="text-success" size={24} />
                        </div>
                        <div>
                            <div className="fw-bold fs-6">Device Verified</div>
                            <div className="text-muted small">IMEI: 3546810...</div>
                        </div>
                    </div>
                 </motion.div>

                 <motion.div 
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="position-absolute bg-body border border-light p-3 rounded-4 shadow-sm"
                    style={{ zIndex: 2, bottom: '20%', left: '0%' }}
                 >
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-20 p-2 rounded-circle">
                            <Database className="text-primary" size={24} />
                        </div>
                        <div>
                            <div className="fw-bold fs-6">Registry Updated</div>
                            <div className="text-muted small">Real-time sync</div>
                        </div>
                    </div>
                 </motion.div>

                 {/* Central Image/Phone Mockup */}
                 <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="position-absolute top-50 start-50 translate-middle d-flex justify-content-center w-100"
                 >
                     <div className="position-relative me-4 d-none d-xl-block" style={{ top: '80px', width: '250px', height: '450px', borderRadius: '30px', overflow: 'hidden', zIndex: 0, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                         <img src="https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=500&q=80" alt="Person using phone" className="w-100 h-100 object-fit-cover" />
                         <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-25" style={{ mixBlendMode: 'multiply' }}></div>
                     </div>
                     <div className="rounded-5 border border-4 border-dark shadow-lg overflow-hidden position-relative z-1" 
                          style={{ width: '300px', height: '600px', background: '#000', position: 'relative' }}>
                        {/* Status Bar */}
                        <div className="d-flex justify-content-between px-4 py-2 text-white small">
                             <span>9:41</span>
                             <div className="d-flex gap-1">
                                 <div className="bg-body rounded-circle" style={{width: 6, height: 6}}></div>
                                 <div className="bg-body rounded-circle" style={{width: 6, height: 6}}></div>
                                 <div className="bg-body rounded-pill" style={{width: 16, height: 6}}></div>
                             </div>
                        </div>
                        
                        {/* App UI Simulation */}
                        <div className="bg-body-tertiary h-100 rounded-top-4 pt-4 px-3" style={{background: 'var(--bg-secondary)'}}>
                             <div className="d-flex justify-content-between align-items-center mb-4">
                                 <div className="fw-bold fs-5 text-body-emphasis">My Devices</div>
                                 <div className="bg-primary rounded-circle p-1">
                                     <Users size={16} className="text-white" />
                                 </div>
                             </div>
                             
                             <div className="bg-body p-3 rounded-3 shadow-sm mb-3">
                                 <div className="d-flex gap-3">
                                     <div className="bg-secondary bg-opacity-10 rounded p-2 d-flex align-items-center justify-content-center" style={{width: 50, height: 50}}>
                                         <Smartphone size={24} className="text-body-emphasis" />
                                     </div>
                                     <div>
                                         <div className="fw-bold text-body-emphasis">iPhone 14 Pro</div>
                                         <div className="text-success small d-flex align-items-center gap-1">
                                             <CheckCircle size={10} /> Protected
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             <div className="bg-body p-3 rounded-3 shadow-sm mb-3 opacity-75">
                                 <div className="d-flex gap-3">
                                     <div className="bg-secondary bg-opacity-10 rounded p-2 d-flex align-items-center justify-content-center" style={{width: 50, height: 50}}>
                                         <Smartphone size={24} className="text-body-emphasis" />
                                     </div>
                                     <div>
                                         <div className="fw-bold text-body-emphasis">MacBook Air</div>
                                         <div className="text-success small d-flex align-items-center gap-1">
                                             <CheckCircle size={10} /> Protected
                                         </div>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="mt-4 p-3 bg-danger bg-opacity-10 rounded-3 text-danger border border-danger border-opacity-25">
                                 <div className="d-flex align-items-center gap-2 mb-1">
                                     <AlertTriangle size={16} />
                                     <span className="fw-bold small">Stolen Alert</span>
                                 </div>
                                 <div className="small opacity-75">1 Device in your area reported stolen recently.</div>
                             </div>
                        </div>
                     </div>
                     <div className="position-relative ms-4 d-none d-xl-block" style={{ top: '-40px', width: '220px', height: '350px', borderRadius: '30px', overflow: 'hidden', zIndex: 0, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                         <img src="https://images.unsplash.com/photo-1531297180b77-cf5113c25ead?auto=format&fit=crop&w=500&q=80" alt="Gadgets on desk" className="w-100 h-100 object-fit-cover" />
                     </div>
                 </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Ticker */}
      <section className="py-4 border-top border-bottom bg-body" style={{borderColor: 'var(--border-color)'}}>
          <div className="container">
              <div className="row text-center divide-x">
                  <div className="col-3">
                      <div className="fw-bold fs-3 text-primary">{stats.users.toLocaleString()}</div>
                      <div className="text-muted small text-uppercase fw-bold tracking-wider">Users</div>
                  </div>
                  <div className="col-3 border-start">
                      <div className="fw-bold fs-3 text-body-emphasis">{stats.devices.toLocaleString()}</div>
                      <div className="text-muted small text-uppercase fw-bold tracking-wider">Devices</div>
                  </div>
                  <div className="col-3 border-start">
                      <div className="fw-bold fs-3 text-success">{stats.verified_devices.toLocaleString()}</div>
                      <div className="text-muted small text-uppercase fw-bold tracking-wider">Verified</div>
                  </div>
                  <div className="col-3 border-start">
                      <div className="fw-bold fs-3 text-warning">{stats.recovered_devices.toLocaleString()}</div>
                      <div className="text-muted small text-uppercase fw-bold tracking-wider">Recovered</div>
                  </div>
              </div>
          </div>
      </section>

       {/* Interactive Features Demo Section */}
       <section id="demo-section" className="py-5 bg-gradient-to-b from-transparent to-gray-50">
           <div className="container py-5">
               <div className="text-center mb-5">
                   <h2 className="display-6 fw-bold mb-3 text-body-emphasis">Security Made Simple</h2>
                   <p className="text-muted mx-auto fs-5" style={{maxWidth: '650px'}}>We've removed all the technical jargon. Protecting your belongings is now as easy as taking a photo.</p>
               </div>
               
               <div className="row g-5 align-items-center">
                   <div className="col-lg-5 order-lg-1 order-2">
                       <div className="d-flex flex-column gap-4">
                           {features.map((feature, idx) => (
                               <motion.div 
                                    key={idx}
                                    className={`p-4 rounded-4 cursor-pointer transition-all ${activeFeature === idx ? 'bg-body shadow-lg border-primary' : 'bg-transparent border-transparent'}`}
                                    style={{ border: activeFeature === idx ? '1px solid var(--primary-200)' : '1px solid transparent' }}
                                    onClick={() => setActiveFeature(idx)}
                                    whileHover={{ scale: 1.02 }}
                               >
                                   <div className="d-flex gap-4">
                                       <div className={`p-3 rounded-circle d-flex align-items-center justify-content-center ${activeFeature === idx ? 'bg-primary bg-opacity-10' : 'bg-secondary bg-opacity-10'}`} style={{width: 60, height: 60}}>
                                           {feature.icon}
                                       </div>
                                       <div>
                                           <h4 className={`fw-bold mb-2 ${activeFeature === idx ? 'text-body-emphasis' : 'text-muted'}`}>{feature.title}</h4>
                                           <p className="mb-0 text-muted">{feature.desc}</p>
                                       </div>
                                   </div>
                               </motion.div>
                           ))}
                       </div>
                   </div>
                   <div className="col-lg-7 order-lg-2 order-1">
                       <div className="position-relative">
                           <AnimatePresence mode='wait'>
                                <motion.div
                                    key={activeFeature}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="rounded-5 overflow-hidden shadow-2xl"
                                    style={{ aspectRatio: '16/9', background: 'var(--bg-secondary)' }}
                                >
                                    {/* Mock UI for each feature */}
                                    {activeFeature === 0 && (
                                        <div className="w-100 h-100 position-relative p-4 d-flex align-items-center justify-content-center overflow-hidden">
                                            <img src="https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80" alt="Office workers" className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover opacity-50" />
                                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-75"></div>
                                            <div className="text-center z-1 text-white col-10">
                                                <Database size={64} className="mb-4 text-primary" />
                                                <h3 className="fw-bold">Your Devices, In One Place</h3>
                                                <p className="text-white-75 fs-5">We securely store your device records so you can easily access them whenever you need to prove ownership or report a loss.</p>
                                            </div>
                                        </div>
                                    )}
                                    {activeFeature === 1 && (
                                        <div className="w-100 h-100 position-relative p-5 d-flex flex-column align-items-center justify-content-center">
                                            <img src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=800&q=80" alt="Verification" className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover opacity-25" />
                                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-body opacity-75"></div>
                                            
                                            <div className="card w-100 shadow-lg border-0 mb-3 z-1 rounded-4" style={{ maxWidth: '400px' }}>
                                                <div className="card-body p-4 d-flex align-items-center gap-3">
                                                    <div className="bg-success text-white rounded-circle p-3 shadow-sm d-flex">
                                                        <CheckCircle size={32} />
                                                    </div>
                                                    <div>
                                                        <h5 className="mb-1 fw-bold text-body-emphasis">Verified Owner</h5>
                                                        <p className="mb-0 text-muted small">Buy and sell with confidence. We verify devices so you know they aren't stolen.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {activeFeature === 2 && (
                                        <div className="w-100 h-100 position-relative overflow-hidden p-5 d-flex align-items-center justify-content-center">
                                            <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80" alt="Happy confident people" className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover opacity-50" />
                                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-body-tertiary opacity-75"></div>
                                            
                                            <div className="z-1 bg-body p-4 rounded-4 shadow-lg text-center" style={{ maxWidth: '400px' }}>
                                                <div className="d-flex justify-content-center mb-3">
                                                    <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-circle d-flex align-items-center">
                                                        <AlertTriangle size={32} />
                                                    </div>
                                                </div>
                                                <h4 className="fw-bold text-body-emphasis mb-2">Flag as Missing</h4>
                                                <p className="text-muted small mb-0 lh-base">
                                                    If your device goes missing, one tap notifies the police and the national registry. We'll alert you the moment it's found.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                           </AnimatePresence>
                       </div>
                   </div>
               </div>
           </div>
       </section>

{/**/}

       {/* Team Section */}
       <section className="py-5 bg-body position-relative">
          <div className="container py-5">
              <div className="text-center mb-5">
                  <h2 className="display-6 fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Real People, Real Protection</h2>
                  <p className="lead text-muted mx-auto" style={{maxWidth: '700px'}}>
                      We're a team of everyday people, tech lovers, and problem solvers who were tired of losing our devices. We built this for you.
                  </p>
              </div>

              <div className="row g-4 justify-content-center">
                  {(teamMembers.length > 0 ? teamMembers : [
                      {
                          name: "Sarah Okonjo",
                          role: "Chief Executive Officer",
                          image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
                          content: "Former cybersecurity consultant with a vision to digitize asset protection in Africa."
                      },
                      {
                          name: "David Adeleke",
                          role: "Head of Engineering",
                          image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
                          content: "Systems architect ensuring our platform scales securely and reliably."
                      },
                      {
                          name: "Grace Ibrahim",
                          role: "Community Manager",
                          image_url: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
                          content: "Connecting users with law enforcement and ensuring smooth recovery processes."
                      }
                  ]).map((member, idx) => (
                      <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          className="col-lg-4 col-md-6"
                      >
                          <div 
                              className="card h-100 border-0 shadow-sm hover-shadow-lg transition-all overflow-hidden rounded-4 text-center group cursor-pointer"
                              onClick={() => setSelectedMember(member)}
                              style={{ cursor: 'pointer' }}
                          >
                              <div className="position-relative overflow-hidden" style={{height: '300px'}}>
                                  <img 
                                      src={member.image_url || member.image} 
                                      alt={member.name}
                                      className="w-100 h-100 object-fit-cover transition-transform duration-500 hover-scale-110" 
                                  />
                                  <div className="position-absolute bottom-0 start-0 w-100 bg-gradient-to-t from-black/70 to-transparent p-4 pt-5 text-white opacity-0 hover-opacity-100 transition-opacity">
                                      <div className="d-flex justify-content-center gap-3">
                                          <span className="btn btn-sm btn-light rounded-pill px-3">View Profile</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="card-body p-4 bg-body-tertiary">
                                  <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{member.name}</h4>
                                  <div className="text-primary fw-medium mb-3 text-uppercase small tracking-wide">{member.role}</div>
                                  <p className="text-muted small mb-0 line-clamp-2">
                                      {member.content || member.desc}
                                  </p>
                              </div>
                          </div>
                      </motion.div>
                  ))}
              </div>
          </div>
       </section>

       {/* Testimonials Section */}
       <section className="py-5 position-relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
           {/* Decorative elements */}
           <div className="position-absolute top-0 start-0 p-5 opacity-10">
               <div className="display-1 fw-bold text-primary">"</div>
           </div>
           
           <div className="container py-5">
               <div className="row justify-content-center mb-5">
                   <div className="col-lg-8 text-center">
                       <h2 className="display-6 fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Trusted by Users Nationwide</h2>
                       <p className="lead text-muted">
                           See what our community is saying about their experience with Check It Registry.
                       </p>
                   </div>
               </div>

               <div className="row g-4">
                   {(testimonials.length > 0 ? testimonials : [
                       {
                           name: "Emmanuel K.",
                           role: "Business Owner",
                           quote: "I got my stolen laptop back within 48 hours. The police scanned it, found my details, and called me immediately!",
                           location: "Lagos",
                           image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=150&q=80"
                       },
                       {
                           name: "TechVillage Ltd",
                           role: "Gadget Retailer",
                           quote: "We buy used phones, and this registry is a lifesaver. We can instantly check if a phone is stolen before paying for it.",
                           location: "Abuja",
                           image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80"
                       },
                       {
                           name: "Ngozi A.",
                           role: "Student",
                           quote: "It took just two minutes to register my new phone. Now I feel so much safer knowing it's officially linked to me.",
                           location: "Port Harcourt",
                           image: "https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&w=150&q=80"
                       }
                   ]).map((testimonial, idx) => (
                       <motion.div 
                           key={idx}
                           initial={{ opacity: 0, scale: 0.95 }}
                           whileInView={{ opacity: 1, scale: 1 }}
                           viewport={{ once: true }}
                           transition={{ delay: idx * 0.1 }}
                           className="col-md-4"
                       >
                           <div className="card h-100 border-0 shadow-sm p-4 rounded-4 bg-body position-relative">
                               <div className="position-absolute top-0 start-0 translate-middle p-3 rounded-circle bg-primary text-white" style={{marginLeft: '40px', marginTop: '0px'}}>
                                   <Shield size={20} fill="currentColor" />
                               </div>
                               <div className="card-body pt-4">
                                   <div className="mb-4 text-warning">
                                       {[1,2,3,4,5].map(i => <span key={i}>★</span>)}
                                   </div>
                                   <p className="text-body-emphasis fst-italic mb-4" style={{ minHeight: '80px' }}>"{testimonial.content || testimonial.quote}"</p>
                                   <div className="d-flex align-items-center gap-3 border-top pt-3">
                                       <img src={testimonial.image || `https://ui-avatars.com/api/?name=${testimonial.name}&background=random`} alt={testimonial.name} className="rounded-circle object-fit-cover shadow-sm" style={{width: 50, height: 50}} />
                                       <div>
                                           <h6 className="fw-bold mb-0 text-body-emphasis">{testimonial.name}</h6>
                                           <small className="text-muted">{testimonial.role} {testimonial.location ? `• ${testimonial.location}` : ''}</small>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       </motion.div>
                   ))}
               </div>
           </div>
       </section>

      {/* Team Member Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="modal-dialog modal-dialog-centered modal-lg"
            >
              <div className="modal-content overflow-hidden border-0 rounded-4 shadow-2xl">
                <div className="row g-0">
                    <div className="col-md-5 position-relative" style={{ minHeight: '300px' }}>
                        <img 
                            src={selectedMember.image_url || selectedMember.image} 
                            alt={selectedMember.name}
                            className="w-100 h-100 object-fit-cover position-absolute"
                        />
                    </div>
                    <div className="col-md-7">
                        <div className="modal-header border-0 p-4 pb-0">
                            <h5 className="modal-title fw-bold display-6 fs-3" style={{ color: 'var(--text-primary)' }}>{selectedMember.name}</h5>
                            <button 
                                type="button" 
                                className="btn-close" 
                                onClick={() => setSelectedMember(null)}
                                style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}
                            />
                        </div>
                        <div className="modal-body p-4">
                            <h6 className="text-primary text-uppercase tracking-wider fw-bold mb-4">{selectedMember.role}</h6>
                            <p className="text-muted lead fs-6 mb-4">
                                {selectedMember.content || selectedMember.desc}
                            </p>
                            
                            <div className="d-flex gap-2">
                                {/* Placeholder social links */}
                                <button className="btn btn-outline-secondary btn-sm rounded-circle p-2"><Globe size={16}/></button>
                            </div>
                        </div>
                        <div className="modal-footer border-0 p-4 pt-0 justify-content-start">
                             <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => setSelectedMember(null)}>Close Profile</button>
                        </div>
                    </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search/Verification Modal */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="modal-dialog modal-dialog-centered"
            >
              <div className="modal-content border-0 rounded-4 shadow-2xl overflow-hidden">
                <div className="modal-header border-0 p-4">
                  <h5 className="modal-title fw-bold" style={{ color: 'var(--text-primary)' }}>Verify Device Status</h5>
                  <button type="button" className="btn-close" onClick={() => { setIsSearchModalOpen(false); setSearchResult(null); setSearchImei(''); setSearchSerial(''); }}></button>
                </div>
                <div className="modal-body p-4 pt-0">
                  <p className="text-muted mb-4">Enter IMEI or Serial Number to check if a device has been reported stolen.</p>
                  
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">IMEI Number</label>
                    <input 
                        type="text" 
                        className="form-control form-control-lg bg-body-tertiary border-0" 
                        placeholder="e.g. 3546..." 
                        value={searchImei}
                        onChange={(e) => setSearchImei(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold">Serial Number</label>
                    <input 
                        type="text" 
                        className="form-control form-control-lg bg-body-tertiary border-0" 
                        placeholder="e.g. SN123..." 
                        value={searchSerial}
                        onChange={(e) => setSearchSerial(e.target.value)}
                    />
                  </div>

                  {searchError && (
                    <div className="alert alert-danger d-flex align-items-center mb-3">
                         <AlertTriangle size={16} className="me-2" />
                         {searchError}
                    </div>
                  )}

                  {searchResult && (
                      <div className={`alert ${searchResult.status === 'clean' ? 'alert-success' : 'alert-danger'} mb-4`}>
                          <div className="d-flex align-items-center gap-2 mb-2">
                              {searchResult.status === 'clean' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                              <h6 className="mb-0 fw-bold">{searchResult.message}</h6>
                          </div>
                          <p className="mb-0 small opacity-75">
                              {searchResult.status === 'clean' 
                                ? "No active reports found. Proceed with caution." 
                                : "Do not proceed. Contact authorities or the rightful owner."}
                          </p>
                      </div>
                  )}

                  <button 
                    onClick={handleSearchCheck} 
                    disabled={searchLoading || (!searchImei && !searchSerial)}
                    className="btn btn-primary w-100 btn-lg rounded-pill fw-bold"
                  >
                    {searchLoading ? 'Checking...' : 'Check Status'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
       <section className="py-5 position-relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
         <div className="container py-5">
            <div className="rounded-5 overflow-hidden position-relative text-white p-5 text-center shadow-2xl">
                 <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1500&q=80" alt="Data security" className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover opacity-20" />
                 <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-90"></div>
                 
                 <div className="position-relative z-1 py-4">
                     <h2 className="display-5 fw-bold mb-4">Ready to Protect What Matters?</h2>
                     <p className="lead mb-5 opacity-90 mx-auto" style={{maxWidth: '700px'}}>
                         Don't wait until it's too late. Join thousands of people who already trust Check It to keep their phones and laptops safe.
                     </p>
                     
                     {!user && (
                        <div className="d-flex justify-content-center gap-3 flex-column flex-sm-row">
                             <Link to="/register" className="btn btn-light btn-lg px-5 py-3 rounded-pill fw-bold text-primary shadow-lg hover-scale">
                                Create Free Account
                            </Link>
                            <button onClick={() => setIsSearchModalOpen(true)} className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill fw-bold hover-scale">
                                Check a Device
                            </button>
                        </div>
                     )}
                 </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-5 border-top bg-body-tertiary" style={{ borderColor: 'var(--border-color)' }}>
        <div className="container px-4">
            <div className="row g-4">
                <div className="col-md-4 text-center text-md-start">
                    <div className="d-flex align-items-center gap-2 justify-content-center justify-content-md-start mb-3">
                        <img src="/logo1.png" alt="Check It Logo" style={{ height: '32px', objectFit: 'contain' }} />
                        <h5 className="fw-bold fs-4 mb-0 text-body-emphasis">Check It</h5>
                    </div>
                    <p className="text-muted">
                        Empowering ownership, preventing theft, and enabling recovery through technology.
                    </p>
                    <div className="d-flex gap-3 justify-content-center justify-content-md-start mt-4">
                         {/* Social Icons Placeholder */}
                         <div className="bg-secondary bg-opacity-10 p-2 rounded-circle cursor-pointer hover-bg-primary hover-text-white transition-all"><Globe size={18}/></div>
                    </div>
                </div>
                <div className="col-md-2 col-6">
                    <h6 className="fw-bold mb-3 text-body-emphasis">Platform</h6>
                    <ul className="list-unstyled d-flex flex-column gap-2 text-muted small">
                        <li><Link to="/search" className="text-decoration-none text-muted hover-text-primary">Public Search</Link></li>
                        <li><Link to="/marketplace/browse" className="text-decoration-none text-muted hover-text-primary">Marketplace</Link></li>
                        <li><Link to="/found-device" className="text-decoration-none text-muted hover-text-primary">Report Found</Link></li>
                    </ul>
                </div>
                <div className="col-md-2 col-6">
                    <h6 className="fw-bold mb-3 text-body-emphasis">Company</h6>
                    <ul className="list-unstyled d-flex flex-column gap-2 text-muted small">
                        <li><Link to="/about" className="text-decoration-none text-muted hover-text-primary">About Us</Link></li>
                        <li><Link to="/contact" className="text-decoration-none text-muted hover-text-primary">Contact</Link></li>
                        <li><Link to="/privacy" className="text-decoration-none text-muted hover-text-primary">Privacy</Link></li>
                    </ul>
                </div>
                 <div className="col-md-4">
                     <h6 className="fw-bold mb-3 text-body-emphasis">Stay Updated</h6>
                     <div className="input-group mb-3">
                         <input type="text" className="form-control" placeholder="Enter your email" aria-label="Email" />
                         <button className="btn btn-primary" type="button">Subscribe</button>
                     </div>
                     <small className="text-muted">Latest security alerts and feature updates.</small>
                 </div>
            </div>
            <div className="mt-5 pt-4 border-top text-center text-muted small row" style={{ borderColor: 'var(--border-color)' }}>
                <div className="col-md-6 text-md-start">
                    © {new Date().getFullYear()} Check It Registry. All rights reserved.
                </div>
                <div className="col-md-6 text-md-end d-flex gap-3 justify-content-md-end justify-content-center mt-2 mt-md-0">
                    <Link to="/terms" className="text-muted text-decoration-none">Terms</Link>
                    <Link to="/privacy" className="text-muted text-decoration-none">Privacy</Link>
                    <Link to="/cookies" className="text-muted text-decoration-none">Cookies</Link>
                </div>
            </div>
        </div>
      </footer>

      {/* Check It Registry */}
    </div>
  );
}
