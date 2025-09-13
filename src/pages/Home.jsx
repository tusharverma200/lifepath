import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GoalInput from "../components/GoalInput";
import TaskCard from "../components/TaskCard";
import { generateRoadmap } from "../services/gemini";
import { db, auth } from "../services/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      setUser(currentUser || null);
      setLoading(false);

      // Clear any previous errors
      setError(null);

      if (currentUser) {
        try {
          const q = query(
            collection(db, "tasks"),
            where("userId", "==", currentUser.uid)
          );

          console.log('Setting up Firestore listener for user:', currentUser.uid);

          unsubscribeSnapshot = onSnapshot(
            q,
            (snapshot) => {
              const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              console.log("Fetched tasks:", data);
              setTasks(data);
              setError(null); // Clear error on successful fetch
            },
            (error) => {
              console.error("Firestore listener error:", error);
              setError(`Failed to load tasks: ${error.message}`);
              setTasks([]); // Clear tasks on error
            }
          );
        } catch (err) {
          console.error("Error setting up Firestore listener:", err);
          setError(`Setup error: ${err.message}`);
        }
      } else {
        setTasks([]);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
      }
    }, (error) => {
      console.error("Auth state change error:", error);
      setError(`Authentication error: ${error.message}`);
      setLoading(false);
    });

    // Clean up both listeners
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  // Add a new task
  const addTask = async (newTask) => {
    if (!user) {
      alert("Login required");
      return;
    }

    try {
      setError(null); // Clear any previous errors
      
      const roadmap = await generateRoadmap(newTask.title, newTask.duration);

      const task = {
        userId: user.uid,
        title: newTask.title,
        duration: newTask.duration,
        subtasks: roadmap,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "tasks"), task);
      navigate(`/task/${docRef.id}`, { state: task });
    } catch (err) {
      console.error("Error adding task:", err);
      setError(`Failed to generate roadmap: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-10">
          🌱 My Growth Goals
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Reload page
                </button>
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">Please log in to view and create goals.</p>
          </div>
        )}

        {user && (
          <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-6 mb-10 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Add a New Goal
            </h2>
            <GoalInput onAdd={addTask} />
          </div>
        )}

        <div className="space-y-5">
          {user && tasks.length === 0 && !error ? (
            <p className="text-center text-gray-500 text-lg">No goals yet.</p>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      </div>
    </div>
  );
}