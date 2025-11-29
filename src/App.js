import React, { useState, useEffect,useMemo } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoutes";
import routes from "./routes/routes";
import "./components/sidebar/sidebar.css";
import "./components/components.css";
import { LanguageProvider } from "./components/LanguageContext";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { themeA, themeB, themeC, themeD, themeMap } from './theme';
const App = () => {
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem("loggedIn") === "true";
  });

  const handleLogin = () => {
    setLoggedIn(true);
    localStorage.setItem("loggedIn", "true");
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem("loggedIn");
  };

  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "A";
  });

  const setTheme = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem("appTheme", themeId);
  };
  const toggleTheme = () => {
    const newTheme = currentTheme === "A" ? "B" : "A";
    setTheme(newTheme); 
  };
  
 const appliedTheme = useMemo(() => {
      return themeMap[currentTheme] || themeA;
  }, [currentTheme]);
 
 

useEffect(() => {
    document.body.classList.remove('theme-a', 'theme-b', 'theme-c', 'theme-d');
    document.body.classList.add(`theme-${currentTheme.toLowerCase()}`);
    localStorage.setItem("appTheme", currentTheme);
}, [currentTheme]);

  return (
    <LanguageProvider>
    <ThemeProvider theme={appliedTheme}>
      <CssBaseline />
      <div className="App">
        <BrowserRouter basename="/">
          <Routes>
            <Route
              path="/"
              element={
                loggedIn ? (
                  <Navigate to="/console/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route
              element={
                <ProtectedRoute 
                 loggedIn={loggedIn} 
                  onLogout={handleLogout} 
                  currentTheme={currentTheme} 
                  toggleTheme={toggleTheme}   
                  setTheme={setTheme} 
                  
                />
              }
            >
              {routes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;