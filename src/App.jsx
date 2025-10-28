import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import AIMcqgenerator from "./components/AIMcqgenerator/AIMcqgenerator.jsx";
import Signup from "./components/Auth/Signup.jsx";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = () => setIsAuthenticated(true);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" />} />
      <Route
        path="/signup"
        element={<Signup onAuthSuccess={handleAuthSuccess} />}
      />
      <Route
        path="/aimcq"
        element={
          isAuthenticated ? <AIMcqgenerator /> : <Navigate to="/signup" replace />
        }
      />
    </Routes>
  );
}

export default App;
