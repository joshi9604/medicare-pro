import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck } from 'lucide-react';
import '../../pages/home/HomePage.css';

const brand = {
  name: 'MediCare Pro',
  subtitle: 'Hospital Management + Telemedicine',
};

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Roles', href: '/#roles' },
      { label: 'Workflow', href: '/#workflow' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'BMI Calculator', to: '/bmi' },
      { label: 'BMR Calculator', to: '/bmr' },
      { label: 'Water Intake', to: '/water-intake' },
      { label: 'Health Guides', to: '/blood-pressure-guide' },
    ],
  },
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

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo-wrap">
            <div className="footer-logo" aria-hidden><Building2 size={20} /></div>
            <div>
              <div className="footer-title">{brand.name}</div>
              <div className="footer-sub">{brand.subtitle}</div>
            </div>
          </div>
          <p className="footer-desc">
            A modern medical management and telemedicine platform for patients, doctors, and admins.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div className="footer-col" key={column.title}>
            <h4>{column.title}</h4>
            {column.links.map((link) => (
              <AppLink key={link.label} link={link} />
            ))}
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <span>Copyright {new Date().getFullYear()} {brand.name}. All rights reserved.</span>
        <span><ShieldCheck size={14} /> Secure healthcare workflows</span>
      </div>
    </footer>
  );
}
