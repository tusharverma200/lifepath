import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home.jsx";
import TaskDetail from "./pages/TaskDetail.jsx";
import AuthForm from "./components/AuthForm.jsx";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/Navbar.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // "login" or "signup"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
     
      setUser(currentUser);
      setLoading(false);
    });

    console.log(import.meta.env.VITE_FIREBASE_API_KEY);
    console.log('unsubscribe:', unsubscribe);

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-center mt-20 text-gray-500">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-md w-full">
          <AuthForm
            mode={authMode}
            onSuccess={() => setUser(auth.currentUser)}
          />
          <p className="mt-4 text-center text-gray-600">
            {authMode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="text-indigo-600 font-semibold hover:underline"
              onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
            >
              {authMode === "login" ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
       {user && (
      <Navbar
        user={user}
        onLogout={() => setUser(null)}
        setAuthMode={setAuthMode}
      />
    )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/task/:id" element={<TaskDetail />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
