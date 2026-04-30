import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'MediCare Pro';
const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://medicare-pro-kappa.vercel.app';
const DEFAULT_IMAGE = `${SITE_URL}/favicon.svg`;

const ROUTE_META = {
  '/': {
    title: `${SITE_NAME} | Hospital Management & Telemedicine Platform`,
    description:
      'MediCare Pro helps patients, doctors, and admins manage appointments, telemedicine, prescriptions, payments, and medical records in one platform.',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/auth?mode=register`,
        'query-input': 'required name=service'
      }
    }
  },
  '/auth': {
    title: `${SITE_NAME} Login & Signup`,
    description:
      'Sign in or create your MediCare Pro account to access appointments, consultations, prescriptions, payments, and healthcare dashboards.',
    robots: 'noindex, follow'
  }
};

const ensureMetaTag = (selector, attributes) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    document.head.appendChild(tag);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    tag.setAttribute(key, value);
  });
};

const ensureLinkTag = (selector, attributes) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('link');
    document.head.appendChild(tag);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    tag.setAttribute(key, value);
  });
};

export default function RouteSeo() {
  const location = useLocation();

  useEffect(() => {
    const meta = ROUTE_META[location.pathname] || {
      title: `${SITE_NAME} App`,
      description:
        'MediCare Pro healthcare platform for appointments, telemedicine, prescriptions, records, and payments.',
      robots: 'noindex, nofollow'
    };

    const canonicalUrl = `${SITE_URL}${location.pathname === '/' ? '/' : location.pathname}`;

    document.title = meta.title;

    ensureMetaTag('meta[name="description"]', { name: 'description', content: meta.description });
    ensureMetaTag('meta[name="robots"]', { name: 'robots', content: meta.robots });
    ensureMetaTag('meta[property="og:title"]', { property: 'og:title', content: meta.title });
    ensureMetaTag('meta[property="og:description"]', { property: 'og:description', content: meta.description });
    ensureMetaTag('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    ensureMetaTag('meta[property="og:image"]', { property: 'og:image', content: DEFAULT_IMAGE });
    ensureMetaTag('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.title });
    ensureMetaTag('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.description });
    ensureMetaTag('meta[name="twitter:image"]', { name: 'twitter:image', content: DEFAULT_IMAGE });
    ensureLinkTag('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });

    let schemaTag = document.head.querySelector('script[data-route-seo="true"]');
    if (meta.structuredData) {
      if (!schemaTag) {
        schemaTag = document.createElement('script');
        schemaTag.type = 'application/ld+json';
        schemaTag.setAttribute('data-route-seo', 'true');
        document.head.appendChild(schemaTag);
      }
      schemaTag.textContent = JSON.stringify(meta.structuredData);
    } else if (schemaTag) {
      schemaTag.remove();
    }
  }, [location.pathname]);

  return null;
}
