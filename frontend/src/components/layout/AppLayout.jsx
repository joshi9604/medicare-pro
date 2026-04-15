// import React, { useEffect, useState } from 'react';
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// import {
//   Activity,
//   CalendarDays,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   CircleDollarSign,
//   ClipboardList,
//   CreditCard,
//   FileText,
//   LayoutDashboard,
//   Menu,
//   MessageCircle,
//   Moon,
//   Building2,
//   Search,
//   ShieldCheck,
//   Stethoscope,
//   SunMedium,
//   User,
//   Users,
//   X,
//   LogOut,
// } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { useTheme } from '../../context/ThemeContext';
// import NotificationBell from '../notifications/NotificationBell';
// import ChatWindow from '../chat/ChatWindow';
// import './AppLayout.css';

// const NAV_ITEMS = {
//   patient: [
//     { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
//     { to: '/patient/find-doctors', icon: Search, label: 'Find Doctors' },
//     { to: '/patient/appointments', icon: CalendarDays, label: 'My Appointments' },
//     { to: '/patient/prescriptions', icon: FileText, label: 'Prescriptions' },
//     { to: '/patient/records', icon: ClipboardList, label: 'Medical Records' },
//   ],
//   doctor: [
//     { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
//     { to: '/doctor/appointments', icon: CalendarDays, label: 'Appointments' },
//     { to: '/doctor/patients', icon: Users, label: 'My Patients', state: { filter: 'completed' } },
//     { to: '/doctor/prescriptions', icon: FileText, label: 'Prescriptions' },
//   ],
//   admin: [
//     { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
//     { to: '/admin/users', icon: Users, label: 'Users' },
//     { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
//     { to: '/admin/appointments', icon: CalendarDays, label: 'Appointments' },
//     { to: '/admin/payments', icon: CircleDollarSign, label: 'Revenue' },
//   ]
// };

// const ROLE_META = {
//   patient: { color: '#1565c0', label: 'Patient Portal', icon: User },
//   doctor: { color: '#10b981', label: 'Doctor Portal', icon: Stethoscope },
//   admin: { color: '#7c3aed', label: 'Admin Control', icon: ShieldCheck },
// };

// const PROFILE_MENU_ITEMS = {
//   patient: [
//     { to: '/patient/profile', icon: User, label: 'My Profile' },
//     { to: '/patient/payments', icon: CreditCard, label: 'Payment History' },
//   ],
//   doctor: [
//     { to: '/doctor/profile', icon: Stethoscope, label: 'Professional Profile' },
//     { to: '/doctor/payments', icon: CircleDollarSign, label: 'Payment History' },
//   ],
//   admin: [
//     { to: '/admin/dashboard', icon: Activity, label: 'Admin Panel' },
//   ]
// };

// export default function AppLayout({ children }) {
//   const [collapsed, setCollapsed] = useState(false);
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);
//   const { user, logout } = useAuth();
//   const { darkMode, toggleDarkMode } = useTheme();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const navItems = NAV_ITEMS[user?.role] || [];
//   const roleMeta = ROLE_META[user?.role] || ROLE_META.patient;
//   const RoleIcon = roleMeta.icon;
//   const currentProfileMenu = PROFILE_MENU_ITEMS[user?.role] || [];
//   const sidebarWidth = collapsed ? 82 : 264;

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth <= 900;
//       setIsMobile(mobile);
//       if (!mobile) {
//         setMobileSidebarOpen(false);
//       } else {
//         setCollapsed(false);
//       }
//     };

//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     setMobileSidebarOpen(false);
//     setShowUserMenu(false);
//   }, [location.pathname]);

//   const handleLogout = () => {
//     logout();
//     navigate('/auth');
//   };

//   const isNavActive = (item) => {
//     if (item.end) return location.pathname === item.to;
//     return location.pathname === item.to || location.pathname.startsWith(item.to + '/');
//   };

//   const closeMobileSidebar = () => {
//     if (isMobile) {
//       setMobileSidebarOpen(false);
//     }
//   };

//   return (
//     <div className="layout">
//       {isMobile && mobileSidebarOpen && (
//         <button
//           className="layout-overlay"
//           type="button"
//           aria-label="Close sidebar"
//           onClick={closeMobileSidebar}
//         />
//       )}

//       <aside
//         className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${isMobile ? 'sidebar-mobile' : ''} ${mobileSidebarOpen ? 'sidebar-open' : ''}`}
//         style={{ width: isMobile ? undefined : `${sidebarWidth}px` }}
//       >
//         <div className="logo">
//             <div className="logo-mark" style={{ background: `${roleMeta.color}18`, color: roleMeta.color }}>
//             <Building2 size={22} />
//           </div>
//           {!collapsed && (
//             <div className="logo-copy">
//               <span className="logo-text">MediCare Pro</span>
//               <span className="logo-tagline">Connected care workspace</span>
//             </div>
//           )}
//           {isMobile && (
//             <button className="mobile-close-btn" type="button" onClick={closeMobileSidebar} aria-label="Close sidebar">
//               <X size={18} />
//             </button>
//           )}
//         </div>

//         {!collapsed && (
//           <div className="role-badge" style={{ background: `${roleMeta.color}14`, color: roleMeta.color, borderColor: `${roleMeta.color}2d` }}>
//             <RoleIcon size={16} />
//             <span>{roleMeta.label}</span>
//           </div>
//         )}

//         <nav className="nav">
//           {navItems.map((item) => {
//             const active = isNavActive(item);
//             const ItemIcon = item.icon;

//             return (
//               <NavLink
//                 key={item.to}
//                 to={item.to}
//                 state={item.state || undefined}
//                 className={`nav-item ${active ? 'active' : ''}`}
//                 style={{
//                   background: active ? `${roleMeta.color}14` : 'transparent',
//                   color: active ? roleMeta.color : (darkMode ? '#94a3b8' : '#64748b'),
//                   borderColor: active ? `${roleMeta.color}2d` : 'transparent',
//                 }}
//                 onClick={closeMobileSidebar}
//               >
//                 <span className="nav-icon">
//                   <ItemIcon size={19} />
//                 </span>
//                 {!collapsed && <span>{item.label}</span>}
//               </NavLink>
//             );
//           })}
//         </nav>

//         <div className="bottom">
//           {!collapsed && (
//             <button className="user-card" type="button" onClick={() => setShowUserMenu((prev) => !prev)}>
//               <div className="avatar" style={{ background: `linear-gradient(135deg, ${roleMeta.color}, ${roleMeta.color}bb)` }}>
//                 {user?.name?.[0]?.toUpperCase()}
//               </div>
//               <div className="user-info">
//                 <div className="user-name">{user?.name?.split(' ')[0]}</div>
//                 <div className="user-role">{user?.role}</div>
//               </div>
//               <span className="user-arrow">
//                 <ChevronDown size={16} className={showUserMenu ? 'user-arrow-open' : ''} />
//               </span>
//             </button>
//           )}

//           {showUserMenu && !collapsed && (
//             <div className="user-menu">
//               {currentProfileMenu.map((item) => {
//                 const ItemIcon = item.icon;
//                 return (
//                   <NavLink
//                     key={item.to}
//                     to={item.to}
//                     className="user-menu-item"
//                     onClick={() => setShowUserMenu(false)}
//                   >
//                     <span className="menu-item-icon"><ItemIcon size={16} /></span>
//                     <span>{item.label}</span>
//                   </NavLink>
//                 );
//               })}
//               <div className="menu-divider" />
//             </div>
//           )}

//           <button className="logout-btn" type="button" onClick={handleLogout}>
//             <LogOut size={16} />
//             {!collapsed && <span>Logout</span>}
//           </button>

//           {!isMobile && (
//             <button className="collapse-btn" type="button" onClick={() => setCollapsed((prev) => !prev)}>
//               {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
//               <span>{collapsed ? 'Expand' : 'Collapse'}</span>
//             </button>
//           )}
//         </div>
//       </aside>

//       <main className="main" style={{ marginLeft: isMobile ? 0 : `${sidebarWidth}px` }}>
//         <div className="top-bar">
//           <div className="top-bar-left">
//             {isMobile && (
//               <button className="mobile-menu-btn" type="button" onClick={() => setMobileSidebarOpen(true)} aria-label="Open sidebar">
//                 <Menu size={18} />
//               </button>
//             )}
//             <div className="breadcrumb">
//               <RoleIcon size={18} />
//               <span>{roleMeta.label}</span>
//             </div>
//           </div>

//           <div className="top-right">
//             <button className="message-pill" type="button" onClick={() => window.dispatchEvent(new CustomEvent('medicare:toggle-chat'))}>
//               <MessageCircle size={17} />
//               <span>Messages</span>
//             </button>
//             <NotificationBell />
//             <button className="theme-btn" type="button" onClick={toggleDarkMode} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
//               {darkMode ? <SunMedium size={18} /> : <Moon size={18} />}
//             </button>
//             <div className="presence-pill">
//               <div className="online-dot" style={{ background: '#10b981' }} />
//               <span className="online-text">Online</span>
//             </div>
//           </div>
//         </div>
//         <div className="content">{children}</div>
//       </main>

//       <ChatWindow />
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  Menu,
  Building2,
  Search,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import './AppLayout.css';

const NAV_ITEMS = {
  patient: [
    { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/patient/find-doctors', icon: Search, label: 'Find Doctors' },
    { to: '/patient/appointments', icon: CalendarDays, label: 'My Appointments' },
    { to: '/patient/prescriptions', icon: FileText, label: 'Prescriptions' },
    { to: '/patient/records', icon: ClipboardList, label: 'Medical Records' },
  ],
  doctor: [
    { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/doctor/appointments', icon: CalendarDays, label: 'Appointments' },
    { to: '/doctor/patients', icon: Users, label: 'My Patients', state: { filter: 'completed' } },
    { to: '/doctor/prescriptions', icon: FileText, label: 'Prescriptions' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/admin/appointments', icon: CalendarDays, label: 'Appointments' },
    { to: '/admin/payments', icon: CircleDollarSign, label: 'Revenue' },
  ]
};

const ROLE_META = {
  patient: { color: '#1565c0', label: 'Patient Portal', icon: User },
  doctor: { color: '#10b981', label: 'Doctor Portal', icon: Stethoscope },
  admin: { color: '#7c3aed', label: 'Admin Control', icon: ShieldCheck },
};

const PROFILE_MENU_ITEMS = {
  patient: [
    { to: '/patient/profile', icon: User, label: 'My Profile' },
    { to: '/patient/payments', icon: CreditCard, label: 'Payment History' },
  ],
  doctor: [
    { to: '/doctor/profile', icon: Stethoscope, label: 'Professional Profile' },
    { to: '/doctor/payments', icon: CircleDollarSign, label: 'Payment History' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: Activity, label: 'Admin Panel' },
  ]
};

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = NAV_ITEMS[user?.role] || [];
  const roleMeta = ROLE_META[user?.role] || ROLE_META.patient;
  const RoleIcon = roleMeta.icon;
  const currentProfileMenu = PROFILE_MENU_ITEMS[user?.role] || [];
  const sidebarWidth = collapsed ? 82 : 264;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);

      if (!mobile) {
        setMobileSidebarOpen(false);
      } else {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isNavActive = (item) => {
    if (item.end) return location.pathname === item.to;
    return location.pathname === item.to || location.pathname.startsWith(item.to + '/');
  };

  const closeMobileSidebar = () => {
    if (isMobile) setMobileSidebarOpen(false);
  };

  return (
    <div className="layout">
      {isMobile && mobileSidebarOpen && (
        <button
          className="layout-overlay"
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${isMobile ? 'sidebar-mobile' : ''} ${mobileSidebarOpen ? 'sidebar-open' : ''}`}
        style={{ width: isMobile ? undefined : `${sidebarWidth}px` }}
      >
        <div className="logo">
          <div
            className="logo-mark"
            style={{ background: `${roleMeta.color}18`, color: roleMeta.color }}
          >
            <Building2 size={22} />
          </div>

          {!collapsed && (
            <div className="logo-copy">
              <span className="logo-text">MediCare Pro</span>
              <span className="logo-tagline">Connected care workspace</span>
            </div>
          )}

          {isMobile && (
            <button
              className="mobile-close-btn"
              type="button"
              onClick={closeMobileSidebar}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {!collapsed && (
          <div
            className="role-badge"
            style={{
              background: `${roleMeta.color}14`,
              color: roleMeta.color,
              borderColor: `${roleMeta.color}2d`,
            }}
          >
            <RoleIcon size={16} />
            <span>{roleMeta.label}</span>
          </div>
        )}

        <nav className="nav">
          {navItems.map((item) => {
            const active = isNavActive(item);
            const ItemIcon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                state={item.state || undefined}
                className={`nav-item ${active ? 'active' : ''}`}
                style={{
                  background: active ? `${roleMeta.color}14` : 'transparent',
                  color: active ? roleMeta.color : '#64748b',
                  borderColor: active ? `${roleMeta.color}2d` : 'transparent',
                }}
                onClick={closeMobileSidebar}
              >
                <span className="nav-icon">
                  <ItemIcon size={19} />
                </span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="bottom">
          {!collapsed && (
            <button
              className="user-card"
              type="button"
              onClick={() => setShowUserMenu((prev) => !prev)}
            >
              <div
                className="avatar"
                style={{
                  background: `linear-gradient(135deg, ${roleMeta.color}, ${roleMeta.color}bb)`,
                }}
              >
                {user?.name?.[0]?.toUpperCase()}
              </div>

              <div className="user-info">
                <div className="user-name">{user?.name?.split(' ')[0]}</div>
                <div className="user-role">{user?.role}</div>
              </div>

              <span className="user-arrow">
                <ChevronDown
                  size={16}
                  className={showUserMenu ? 'user-arrow-open' : ''}
                />
              </span>
            </button>
          )}

          {showUserMenu && !collapsed && (
            <div className="user-menu">
              {currentProfileMenu.map((item) => {
                const ItemIcon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="user-menu-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span className="menu-item-icon">
                      <ItemIcon size={16} />
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          )}

          <button className="logout-btn" type="button" onClick={handleLogout}>
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>

          {!isMobile && (
            <button
              className="collapse-btn"
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              <span>{collapsed ? 'Expand' : 'Collapse'}</span>
            </button>
          )}
        </div>
      </aside>

      <main
        className="main"
        style={{ marginLeft: isMobile ? 0 : `${sidebarWidth}px` }}
      >
        <div className="top-bar">
          <div className="top-bar-left">
            {isMobile && (
              <button
                className="mobile-menu-btn"
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu size={18} />
              </button>
            )}

            <div className="breadcrumb">
              <RoleIcon size={18} />
              <span>{roleMeta.label}</span>
            </div>
          </div>

          <div className="top-right">
            <NotificationBell />

            <div className="presence-pill">
              <div className="online-dot" style={{ background: '#10b981' }} />
              <span className="online-text">Online</span>
            </div>
          </div>
        </div>

        <div className="content">{children}</div>
      </main>
    </div>
  );
}