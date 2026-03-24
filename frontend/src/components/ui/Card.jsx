import React from 'react';

export function Card({ children, style = {}, className = '', hover = true }) {
  return (
    <div 
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border-color)',
        transition: 'all 0.3s ease',
        ...(hover && {
          cursor: 'pointer',
          ':hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
          }
        }),
        ...style
      }}
      className={`animate-fadeIn ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({ icon, label, value, trend, color = '#1565c0' }) {
  return (
    <Card hover={true} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderRadius: '0 0 0 100%',
        zIndex: 0
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          marginBottom: '16px',
          border: `2px solid ${color}30`
        }}>
          {icon}
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: '800',
          color: 'var(--text-primary)',
          marginBottom: '4px',
          letterSpacing: '-0.5px'
        }}>
          {value}
        </div>
        <div style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          fontWeight: '600',
          marginBottom: trend ? '8px' : 0
        }}>
          {label}
        </div>
        {trend && (
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: trend > 0 ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
          </div>
        )}
      </div>
    </Card>
  );
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  style = {},
  icon = null
}) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #1565c0 0%, #0277bd 100%)',
      color: '#fff',
      border: 'none',
      boxShadow: '0 4px 14px rgba(21,101,192,0.35)'
    },
    secondary: {
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      border: '1.5px solid var(--border-color)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#fff',
      border: 'none',
      boxShadow: '0 4px 14px rgba(239,68,68,0.35)'
    },
    success: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#fff',
      border: 'none',
      boxShadow: '0 4px 14px rgba(16,185,129,0.35)'
    }
  };

  const sizes = {
    sm: { padding: '8px 16px', fontSize: '13px' },
    md: { padding: '12px 24px', fontSize: '14px' },
    lg: { padding: '16px 32px', fontSize: '16px' }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius: '12px',
        fontWeight: '700',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        ':hover': !disabled && {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
        },
        ...variants[variant],
        ...sizes[size],
        ...style
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

export function Badge({ children, color = '#1565c0', style = {} }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '700',
      background: `${color}15`,
      color: color,
      border: `1.5px solid ${color}30`,
      ...style
    }}>
      {children}
    </span>
  );
}

export function Skeleton({ width = '100%', height = '20px', style = {} }) {
  return (
    <div style={{
      width,
      height,
      borderRadius: '8px',
      background: 'linear-gradient(90deg, var(--border-color) 25%, var(--bg-primary) 50%, var(--border-color) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style
    }} />
  );
}
