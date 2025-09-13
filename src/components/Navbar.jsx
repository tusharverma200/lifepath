// components/Navbar.jsx
import { Link } from "react-router-dom";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";

export default function Navbar({ user, onLogout, setAuthMode }) {
  const handleLogout = async () => {
    await signOut(auth);
    onLogout(); // clear user state in App.jsx
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-indigo-600">
        MyApp
      </Link>

      {/* Auth Buttons */}
      <div>
        {!user ? (
          <>
            <button
              className="mr-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              onClick={() => setAuthMode("login")}
            >
              Log In
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => setAuthMode("signup")}
            >
              Sign Up
            </button>
          </>
        ) : (
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
