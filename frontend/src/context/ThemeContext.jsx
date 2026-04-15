// import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
// import { Moon, Sun } from 'lucide-react';

// const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [darkMode, setDarkMode] = useState(() => localStorage.getItem('medicare_darkmode') === 'true');

//   useEffect(() => {
//     localStorage.setItem('medicare_darkmode', darkMode);
//     document.body.classList.toggle('dark-mode', darkMode);
//   }, [darkMode]);

//   const toggleDarkMode = () => setDarkMode((prev) => !prev);

//   const themeMeta = useMemo(() => ({
//     label: darkMode ? 'Dark Mode' : 'Light Mode',
//     icon: darkMode ? Moon : Sun
//   }), [darkMode]);

//   const value = useMemo(() => ({
//     darkMode,
//     toggleDarkMode,
//     themeMeta
//   }), [darkMode, themeMeta]);

//   return (
//     <ThemeContext.Provider value={value}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => useContext(ThemeContext);

import React, { createContext, useContext, useMemo } from 'react';
import { Sun } from 'lucide-react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const value = useMemo(
    () => ({
      darkMode: false,
      toggleDarkMode: () => {},
      themeMeta: {
        label: 'Light Mode',
        icon: Sun
      }
    }),
    []
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);