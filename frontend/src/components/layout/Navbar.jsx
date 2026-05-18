import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Building2,
  Calculator,
  ChevronDown,
  ChevronRight,
  Droplets,
  HeartPulse,
  Menu,
  X,
} from 'lucide-react';
import '../../pages/home/HomePage.css';

const brand = {
  name: 'MediCare Pro',
  subtitle: 'Hospital Management + Telemedicine',
};

const navLinks = [
  { label: 'Home', href: '/#home' },
  { label: 'Features', href: '/#features' },
  { label: 'Roles', href: '/#roles' },
  { label: 'Workflow', href: '/#workflow' },
  { label: 'FAQ', href: '/#faq' },
];

const resourceLinks = [
  { label: 'BMI Calculator', to: '/bmi', icon: Calculator },
  { label: 'BMR Calculator', to: '/bmr', icon: Calculator },
  { label: 'Water Intake Calculator', to: '/water-intake', icon: Droplets },
  { label: 'Blood Pressure Guide', to: '/blood-pressure-guide', icon: HeartPulse },
  { label: 'Sugar Level Guide', to: '/sugar-level-guide', icon: Activity },
];

const authLinks = [
  { label: 'Login', to: '/auth?mode=login', className: 'home-btn home-btn-ghost' },
  { label: 'Get Started', to: '/auth?mode=register', className: 'home-btn home-btn-primary' },
];

const AppLink = ({ link, className, children, onClick }) => {
  if (link.to) {
    return (
      <Link className={className} to={link.to} onClick={onClick}>
        {children || link.label}
      </Link>
    );
  }

  return (
    <a className={className} href={link.href} onClick={onClick}>
      {children || link.label}
    </a>
  );
};

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const resourcesDropdownRef = useRef(null);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    // Sticky blur effect on scroll (premium glass feel).
    const onScroll = () => {
      setHeaderScrolled(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setResourcesOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Close menus when clicking outside (production behavior).
    const onPointerDown = (event) => {
      const dropdownNode = resourcesDropdownRef.current;
      if (dropdownNode && !dropdownNode.contains(event.target)) {
        setResourcesOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return (
    <header className={`home-header ${headerScrolled ? 'is-scrolled' : ''}`}>
      <Link className="home-brand home-brand-link" to="/">
        <div className="home-logo" aria-hidden>
          <Building2 size={22} />
        </div>
        <div className="home-brand-text">
          <div className="home-title">{brand.name}</div>
          <div className="home-subtitle">{brand.subtitle}</div>
        </div>
      </Link>

      <div className="home-header-right">
        <nav className="home-nav" aria-label="Primary">
          {navLinks.map((link) => (
            <AppLink
              key={link.label}
              link={link}
              className={`home-nav-link ${link.label === 'Home' ? 'active' : ''}`}
            />
          ))}

          <div
            className={`home-nav-dropdown ${resourcesOpen ? 'open' : ''}`}
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
            ref={resourcesDropdownRef}
          >
            <button
              className="home-nav-link home-nav-dropdown-btn"
              type="button"
              onClick={() => setResourcesOpen((open) => !open)}
              aria-expanded={resourcesOpen}
              aria-haspopup="menu"
            >
              Resources <ChevronDown size={14} />
            </button>
            <div className="home-nav-menu">
              {resourceLinks.map((link) => (
                <AppLink
                  key={link.label}
                  link={link}
                  className="home-nav-menu-link"
                  onClick={() => setResourcesOpen(false)}
                >
                  {link.icon ? React.createElement(link.icon, { size: 16 }) : null}
                  <span>{link.label}</span>
                  <ChevronRight size={14} className="home-nav-menu-arrow" />
                </AppLink>
              ))}
            </div>
          </div>
        </nav>

        <nav className="home-actions" aria-label="Authentication">
          {authLinks.map((link) => (
            <AppLink key={link.label} link={link} className={link.className} />
          ))}
        </nav>

        <button
          className="home-mobile-menu-btn"
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <nav className={`home-mobile-nav ${mobileMenuOpen ? 'open' : ''}`} aria-label="Mobile primary">
        {[...navLinks, ...resourceLinks, ...authLinks].map((link) => (
          <AppLink
            key={link.label}
            link={link}
            className={`home-mobile-nav-link ${link.label === 'Get Started' ? 'strong' : ''}`}
            onClick={closeMobileMenu}
          />
        ))}
      </nav>
    </header>
  );
}
