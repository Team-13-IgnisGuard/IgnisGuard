import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import redCylinderImg from '../../assets/red_cylinder_3d.png';
import deliveryAgentImg from '../../assets/delivery_agent_3d.jpg';

const Home = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);

  return (
    <div id="home" className="container py-1 mt-md-2 mb-md-5 animate-slide-up" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 1. HERO HEADER CONTAINER */}
      <div className="glass-panel p-4 p-md-5 mb-5 position-relative overflow-hidden" 
           style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="row align-items-center g-4">
          {/* Left Column: Headings & CTAs */}
          <div className="col-12 col-lg-6 text-start">
            <h1 className="fw-black mb-3" style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)', fontSize: 'calc(1.8rem + 1.8vw)', lineHeight: '1.2' }}>
              Trusted LPG Booking <br />
              <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Made Simple & Secure
              </span>
            </h1>
            <p className="text-secondary mb-4 fs-5" style={{ lineHeight: '1.6', maxWidth: '580px' }}>
              Book LPG cylinders, track deliveries in real-time, manage distributors and inventory – all in one powerful platform.
            </p>

            {/* CTA Buttons */}
            <div className="d-flex flex-wrap gap-3 mb-4">
              {user ? (
                <Link to={`/${user.role.toLowerCase()}/dashboard`} className="btn btn-gradient-primary rounded-pill px-4 py-2.5 display-font fw-semibold">
                  Go to Dashboard <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn btn-gradient-primary rounded-pill px-4 py-2.5 display-font fw-semibold">
                    Book Cylinder Now <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                  <Link to="/login" className="btn rounded-pill px-4 py-2.5 display-font fw-semibold btn-outline-custom"
                        style={{ border: '1px solid var(--primary-color)', color: 'var(--primary-color)', transition: 'all 0.3s' }}>
                    Track Delivery <i className="bi bi-geo-alt ms-1"></i>
                  </Link>
                </>
              )}
            </div>

            {/* Ratings & Avatars Row */}
            <div className="d-flex align-items-center flex-wrap gap-2 pt-2 border-top border-secondary-subtle">
              <div className="d-flex align-items-center" style={{ marginRight: '10px' }}>
                {['#ff5f25', '#f59e0b', '#8b5cf6', '#3b82f6'].map((bg, idx) => (
                  <div key={idx} className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white text-uppercase"
                       style={{ 
                         width: '32px', 
                         height: '32px', 
                         backgroundColor: bg, 
                         border: '2px solid var(--bg-secondary)', 
                         marginLeft: idx > 0 ? '-10px' : '0',
                         fontSize: '9px',
                         zIndex: 4 - idx
                       }}>
                    {['JD', 'MS', 'AK', 'RL'][idx]}
                  </div>
                ))}
              </div>
              <div>
                <div className="d-flex text-warning small mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="bi bi-star-fill me-0.5"></i>
                  ))}
                </div>
                <span className="text-secondary small fw-bold">Trusted by 15,000+ customers</span>
              </div>
            </div>
          </div>

          {/* Right Column: red cylinder & surrounding float items */}
          <div className="col-12 col-lg-6 mt-lg-0 mt-5">
            <div className="row align-items-center g-0">
              {/* Left Column Tags (Desktop Only) */}
              <div className="col-12 col-md-3 d-none d-md-flex flex-column gap-4 align-items-md-end text-end pe-md-2" style={{ zIndex: 2 }}>
                {/* 1. Safe & Secure */}
                <div className="shadow-sm border rounded-4 p-2 d-flex align-items-center gap-2"
                     style={{ maxWidth: '170px', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', transition: 'transform 0.2s' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <div className="rounded-circle p-2 d-flex align-items-center justify-content-center text-success flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: 'var(--bg-primary)' }}>
                    <i className="bi bi-shield-fill-check fs-5"></i>
                  </div>
                  <div className="lh-sm text-start">
                    <span className="fw-bold small d-block" style={{ fontSize: '0.8rem' }}>Safe & Secure</span>
                    <span className="text-muted" style={{ fontSize: '9px' }}>End-to-end safety in every delivery</span>
                  </div>
                </div>

                {/* 2. Fast Delivery */}
                <div className="shadow-sm border rounded-4 p-2 d-flex align-items-center gap-2"
                     style={{ maxWidth: '170px', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', transition: 'transform 0.2s' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <div className="rounded-circle p-2 d-flex align-items-center justify-content-center text-primary flex-shrink-0" style={{ width: '36px', height: '36px', color: 'var(--primary-color)', backgroundColor: 'var(--bg-primary)' }}>
                    <i className="bi bi-truck fs-5"></i>
                  </div>
                  <div className="lh-sm text-start">
                    <span className="fw-bold small d-block" style={{ fontSize: '0.8rem' }}>Fast Delivery</span>
                    <span className="text-muted" style={{ fontSize: '9px' }}>Timely deliveries at your doorstep</span>
                  </div>
                </div>
              </div>

              {/* Center Cylinder (All viewports) */}
              <div className="col-12 col-md-6 text-center position-relative">
                {/* Cylinder Background Circle Glow */}
                <div className="position-absolute rounded-circle top-50 start-50 translate-middle" 
                     style={{ 
                       width: '260px', 
                       height: '260px', 
                       background: 'radial-gradient(circle, rgba(255,95,37,0.06) 0%, rgba(255,95,37,0) 70%)',
                       zIndex: 0
                     }}></div>

                {/* Red Cylinder Image */}
                <img src={redCylinderImg} 
                     alt="IgnisGuard LPG Cylinder" 
                     className="img-fluid position-relative" 
                     style={{ maxHeight: '350px', objectFit: 'contain', zIndex: 1 }} 
                     onError={(e) => {
                       e.target.style.display = 'none';
                     }} />
              </div>

              {/* Right Column Tags (Desktop Only) */}
              <div className="col-12 col-md-3 d-none d-md-flex flex-column gap-4 align-items-md-start text-start ps-md-2" style={{ zIndex: 2 }}>
                {/* 3. Trusted Network */}
                <div className="shadow-sm border rounded-4 p-2 d-flex align-items-center gap-2"
                     style={{ maxWidth: '170px', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', transition: 'transform 0.2s' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <div className="rounded-circle p-2 d-flex align-items-center justify-content-center text-warning flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: 'var(--bg-primary)' }}>
                    <i className="bi bi-award-fill fs-5"></i>
                  </div>
                  <div className="lh-sm text-start">
                    <span className="fw-bold small d-block" style={{ fontSize: '0.8rem' }}>Trusted Network</span>
                    <span className="text-muted" style={{ fontSize: '9px' }}>Verified distributors across your area</span>
                  </div>
                </div>

                {/* 4. 24/7 Support */}
                <div className="shadow-sm border rounded-4 p-2 d-flex align-items-center gap-2"
                     style={{ maxWidth: '170px', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', transition: 'transform 0.2s' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <div className="rounded-circle p-2 d-flex align-items-center justify-content-center text-danger flex-shrink-0" style={{ width: '36px', height: '36px', backgroundColor: 'var(--bg-primary)' }}>
                    <i className="bi bi-headphones fs-5"></i>
                  </div>
                  <div className="lh-sm text-start">
                    <span className="fw-bold small d-block" style={{ fontSize: '0.8rem' }}>24/7 Support</span>
                    <span className="text-muted" style={{ fontSize: '9px' }}>We're always here to help you</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Tag Badges (Visible on mobile/tablet below md, hidden on desktop) */}
            <div className="d-flex d-md-none row g-3 mt-4 text-start justify-content-center px-2">
              {[
                { title: 'Safe & Secure', desc: 'End-to-end safety in every delivery', icon: 'bi-shield-fill-check', color: 'text-success' },
                { title: 'Fast Delivery', desc: 'Timely deliveries at your doorstep', icon: 'bi-truck', color: 'text-primary' },
                { title: 'Trusted Network', desc: 'Verified distributors across your area', icon: 'bi-award-fill', color: 'text-warning' },
                { title: '24/7 Support', desc: "We're always here to help you", icon: 'bi-headphones', color: 'text-danger' }
              ].map((t, idx) => (
                <div key={idx} className="col-6">
                  <div className="shadow-sm border rounded-4 p-2 d-flex align-items-center gap-2 h-100"
                       style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${t.color} flex-shrink-0`} style={{ width: '32px', height: '32px', backgroundColor: 'var(--bg-primary)' }}>
                      <i className={`bi ${t.icon}`}></i>
                    </div>
                    <div className="lh-sm">
                      <span className="fw-bold d-block" style={{ fontSize: '0.75rem' }}>{t.title}</span>
                      <span className="text-muted d-block" style={{ fontSize: '8px', lineHeight: '1.2' }}>{t.desc}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. POWERFUL FEATURES CONTAINER */}
      <div id="features" className="text-center mb-5 py-3">
        <span className="text-orange fw-bold small text-uppercase mb-2 d-block" style={{ color: 'var(--primary-color)', letterSpacing: '0.1em' }}>
          Powerful Features
        </span>
        <h2 className="fw-black mb-3 text-white" style={{ letterSpacing: '-0.02em', fontSize: '2.1rem' }}>
          Powerful Features for Seamless Operations
        </h2>
        <p className="text-secondary col-lg-7 mx-auto small" style={{ fontSize: '0.95rem' }}>
          Everything you need to manage LPG bookings and deliveries efficiently and transparently.
        </p>

        {/* Feature Cards Grid (4 Columns) */}
        <div className="row g-4 mt-3 text-start">
          {[
            { title: 'Instant Booking', desc: 'Place cylinder delivery requests in seconds with saved profiles and preferred dealers.', icon: 'bi-clock-history', bg: 'rgba(255, 95, 37, 0.08)', color: 'var(--primary-color)' },
            { title: 'Secure Payments', desc: 'Make secure payments online through trusted gateways with complete safety.', icon: 'bi-shield-fill-check', bg: 'rgba(22, 163, 74, 0.08)', color: '#16a34a' },
            { title: 'Inventory Management', desc: 'Distributors can manage stock levels, refills and supply chain with ease.', icon: 'bi-box-seam', bg: 'rgba(245, 158, 11, 0.08)', color: '#d97706' },
            { title: 'Role-based Access', desc: 'Secure dashboards for Admins, Distributors, Delivery Agents and Customers.', icon: 'bi-people-fill', bg: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }
          ].map((feat, idx) => (
            <div key={idx} className="col-12 col-md-6 col-lg-3">
              <div className="glass-card p-4 h-100 d-flex flex-column" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <div className="d-inline-flex align-items-center justify-content-center rounded-4 p-3 mb-3" 
                     style={{ color: feat.color, backgroundColor: feat.bg, width: '48px', height: '48px' }}>
                  <i className={`bi ${feat.icon} fs-4`}></i>
                </div>
                <h4 className="fs-5 fw-bold mb-2 text-white">{feat.title}</h4>
                <p className="small text-secondary mb-0" style={{ lineHeight: '1.6' }}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Link to="/login" className="btn rounded-pill px-4 py-2 fw-semibold btn-outline-custom"
                style={{ border: '1px solid var(--primary-color)', color: 'var(--primary-color)', transition: 'all 0.3s' }}>
            Explore All Features <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>
      </div>

      {/* 3. SPLIT TIMELINE & METRICS ROW */}
      <div id="how-it-works" className="row g-4 align-items-stretch">
        {/* Left Column: How It Works Timeline */}
        <div className="col-12 col-lg-6">
          <div className="glass-panel p-4 p-md-5 h-100 text-start" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="fw-black mb-1 text-white" style={{ letterSpacing: '-0.02em', fontSize: '1.75rem' }}>How It Works</h3>
            <p className="text-secondary small mb-4">Simple steps to get your LPG cylinder delivered</p>

            {/* Vertical timeline steps */}
            <div className="position-relative ps-4" style={{ borderLeft: '2px dashed var(--border-color)' }}>
              {[
                { step: '1', title: 'Register / Login', desc: 'Create your account or login to get started with IgnisGuard.', icon: 'bi-person-fill' },
                { step: '2', title: 'Book Cylinder', desc: 'Select cylinder type, quantity and preferred delivery address.', icon: 'bi-box-seam' },
                { step: '3', title: 'Make Payment', desc: 'Complete your payment securely through our trusted payment gateways.', icon: 'bi-credit-card-2-front-fill' },
                { step: '4', title: 'Track & Receive', desc: 'Track your delivery in real-time and receive it at your doorstep.', icon: 'bi-truck' }
              ].map((item, idx) => (
                <div key={idx} className="position-relative mb-4">
                  {/* Left Circle Number Icon */}
                  <span className="position-absolute d-flex align-items-center justify-content-center rounded-circle border shadow-sm"
                        style={{ 
                          left: '-41px', 
                          top: '0', 
                          width: '32px', 
                          height: '32px', 
                          backgroundColor: 'var(--bg-secondary)', 
                          color: 'var(--primary-color)', 
                          borderColor: 'var(--border-color)',
                          zIndex: 2 
                        }}>
                    <i className={`bi ${item.icon}`} style={{ fontSize: '14px' }}></i>
                  </span>

                  {/* Text Details */}
                  <div className="ms-2">
                    <h5 className="fs-6 fw-bold mb-1 text-white">
                      <span className="text-orange me-2" style={{ color: 'var(--primary-color)' }}>{item.step}</span>
                      {item.title}
                    </h5>
                    <p className="small text-secondary mb-0" style={{ fontSize: '0.825rem' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-2">
              <Link to="/login" className="btn btn-gradient-primary rounded-pill px-4 py-2 fw-semibold">
                Book Cylinder Now <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Why Choose IgnisGuard metrics & commitment */}
        <div className="col-12 col-lg-6">
          <div className="glass-panel p-4 p-md-5 h-100 d-flex flex-column justify-content-between text-start" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
            <div>
              <h3 className="fw-black mb-1 text-white" style={{ letterSpacing: '-0.02em', fontSize: '1.75rem' }}>
                Why Choose <span style={{ color: 'var(--primary-color)' }}>IgnisGuard?</span>
              </h3>
              <p className="text-secondary small mb-4">Reliable. Secure. Efficient.</p>

              {/* 2x2 Numeric stat boxes */}
              <div className="row g-3 mb-4">
                {[
                  { metric: '15K+', title: 'Happy Customers', icon: 'bi-people-fill', color: 'var(--primary-color)' },
                  { metric: '500+', title: 'Distributors', icon: 'bi-shop', color: '#fbbf24' },
                  { metric: '98%', title: 'Successful Deliveries', icon: 'bi-check-circle-fill', color: '#16a34a' },
                  { metric: '24/7', title: 'Customer Support', icon: 'bi-headphones', color: '#3b82f6' }
                ].map((stat, idx) => (
                  <div key={idx} className="col-6">
                    <div className="p-3 rounded-4 border text-center" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                      <i className={`bi ${stat.icon} fs-4 d-block mb-1`} style={{ color: stat.color }}></i>
                      <span className="fs-4 fw-black d-block text-white" style={{ letterSpacing: '-0.02em' }}>{stat.metric}</span>
                      <span className="text-secondary" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>{stat.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commitment Box with uploaded Image agent */}
            <div className="glass-card p-3 rounded-4" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div className="row align-items-center g-3">
                {/* Left side agent image */}
                <div className="col-12 col-sm-4 text-center">
                  <img src={deliveryAgentImg} 
                       alt="LPG Delivery Professional" 
                       className="img-fluid rounded-3" 
                       style={{ maxHeight: '140px', objectFit: 'cover' }}
                       onError={(e) => {
                         e.target.style.display = 'none';
                       }} />
                </div>
                {/* Right side text */}
                <div className="col-12 col-sm-8 text-start">
                  <h4 className="fs-6 fw-bold mb-1 text-white">Our Commitment</h4>
                  <p className="text-secondary" style={{ fontSize: '0.775rem', lineHeight: '1.5' }}>
                    We are committed to delivering safety, convenience and reliability in every LPG delivery. Your trust fuels our flame.
                  </p>
                  
                  {/* Inline micro points */}
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {[
                      { icon: 'bi-shield-fill-check', text: 'Safety First' },
                      { icon: 'bi-clock-fill', text: 'Timely Delivery' },
                      { icon: 'bi-person-fill-check', text: 'Customer Focused' }
                    ].map((pt, idx) => (
                      <span key={idx} className="d-inline-flex align-items-center gap-1 text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>
                        <i className={`bi ${pt.icon}`} style={{ color: 'var(--primary-color)' }}></i> {pt.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* 4. ABOUT US CONTAINER */}
        <div id="about-us" className="glass-panel p-4 p-md-5 mb-5 mt-5 text-start" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-6">
              <span className="text-orange fw-bold small text-uppercase mb-2 d-block" style={{ color: 'var(--primary-color)', letterSpacing: '0.1em' }}>About IgnisGuard</span>
              <h2 className="fw-black mb-3" style={{ letterSpacing: '-0.02em', fontSize: '2rem', color: 'var(--text-primary)' }}>Revolutionizing LPG Safety & Delivery Logistics</h2>
              <p className="text-secondary small mb-3" style={{ lineHeight: '1.7' }}>
                IgnisGuard was born out of a commitment to secure and simplify the LPG cylinder booking and distribution network. Our ecosystem brings state-of-the-art QR verification, automated transaction confirmations, and full chain-of-custody tracking.
              </p>
              <p className="text-secondary small mb-4" style={{ lineHeight: '1.7' }}>
                By empowering customers with real-time tracking, protecting distributors with precise stock levels, and certifying delivery integrity, we safeguard the fuel that powers millions of kitchens daily.
              </p>
              <div className="row g-2">
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2">
                     <i className="bi bi-shield-check text-success fs-4"></i>
                     <span className="small fw-bold" style={{ color: 'var(--text-primary)' }}>Verified QR Tokens</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2">
                     <i className="bi bi-shield-check text-success fs-4"></i>
                     <span className="small fw-bold" style={{ color: 'var(--text-primary)' }}>No-Leak Safety Checks</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6 text-center">
              <div className="p-4 rounded-4 border text-start" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <i className="bi bi-building fs-1 d-block mb-3 text-orange" style={{ color: 'var(--primary-color)' }}></i>
                <h4 className="fw-bold fs-5 mb-2" style={{ color: 'var(--text-primary)' }}>Our Operating Mission</h4>
                <p className="small text-secondary mb-0" style={{ lineHeight: '1.6' }}>
                  To create a unified digital infrastructure that enables zero-leak, secure, and authenticated supply logistics for gas connections nationwide.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 6. CONTACT CONTAINER */}
        <div id="contact" className="glass-panel p-4 p-md-5 mb-5 mt-5 text-start" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <div className="row g-4">
            <div className="col-12 col-lg-5">
              <span className="text-orange fw-bold small text-uppercase mb-2 d-block" style={{ color: 'var(--primary-color)', letterSpacing: '0.1em' }}>Contact Us</span>
               <h2 className="fw-black mb-3" style={{ letterSpacing: '-0.02em', fontSize: '2rem', color: 'var(--text-primary)' }}>Get in Touch with IgnisGuard</h2>
               <p className="text-secondary small mb-4" style={{ lineHeight: '1.6' }}>
                 Have questions about our security tokens, delivery network, or enterprise licensing? Send us a message and our team will get back to you shortly.
               </p>
               <div className="d-flex flex-column gap-3">
                 <div className="d-flex align-items-center gap-3">
                   <div className="rounded-circle p-2 d-flex align-items-center justify-content-center text-orange" style={{ width: '40px', height: '40px', color: 'var(--primary-color)', backgroundColor: 'var(--bg-primary)' }}>
                     <i className="bi bi-envelope-fill"></i>
                   </div>
                   <div>
                     <span className="small text-muted d-block">Support Email</span>
                     <span className="small fw-bold" style={{ color: 'var(--text-primary)' }}>support@ignisguard.com</span>
                   </div>
                 </div>
                 <div className="d-flex align-items-center gap-3">
                   <div className="rounded-circle p-2 d-flex align-items-center justify-content-center text-orange" style={{ width: '40px', height: '40px', color: 'var(--primary-color)', backgroundColor: 'var(--bg-primary)' }}>
                     <i className="bi bi-telephone-fill"></i>
                   </div>
                   <div>
                     <span className="small text-muted d-block">Support Hotline</span>
                     <span className="small fw-bold" style={{ color: 'var(--text-primary)' }}>+91 1800 233 4567</span>
                   </div>
                 </div>
                 <div className="d-flex align-items-center gap-3">
                   <div className="rounded-circle p-2 d-flex align-items-center justify-content-center text-orange" style={{ width: '40px', height: '40px', color: 'var(--primary-color)', backgroundColor: 'var(--bg-primary)' }}>
                     <i className="bi bi-geo-alt-fill"></i>
                   </div>
                   <div>
                     <span className="small text-muted d-block">Headquarters</span>
                     <span className="small fw-bold" style={{ color: 'var(--text-primary)' }}>CDAC DotNet MiniProj Complex, Pune, India</span>
                   </div>
                 </div>
               </div>
             </div>
             <div className="col-12 col-lg-7">
               <div className="p-4 rounded-4 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                 <form onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); e.target.reset(); }}>
                   <div className="row g-3">
                     <div className="col-6">
                       <label className="form-label form-label-custom">Your Name</label>
                       <input type="text" className="form-control text-white" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} placeholder="John Doe" required />
                     </div>
                     <div className="col-6">
                       <label className="form-label form-label-custom">Email Address</label>
                       <input type="email" className="form-control text-white" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} placeholder="john@example.com" required />
                     </div>
                     <div className="col-12">
                       <label className="form-label form-label-custom">Subject</label>
                       <input type="text" className="form-control text-white" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} placeholder="Inquiry about Distributor license" required />
                     </div>
                     <div className="col-12">
                       <label className="form-label form-label-custom">Your Message</label>
                       <textarea className="form-control text-white" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} rows="4" placeholder="Hi team, I would like to set up..." required></textarea>
                     </div>
                     <div className="col-12">
                       <button type="submit" className="btn btn-gradient-primary w-100 rounded-pill py-2.5 fw-semibold">
                         Send Message <i className="bi bi-send ms-1"></i>
                       </button>
                     </div>
                   </div>
                 </form>
               </div>
             </div>
           </div>
         </div>
       </div>
     );
};

export default Home;
