import { useLocation } from "react-router-dom";
import { useState } from "react";
import { db } from "../services/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function TaskDetail() {
  const location = useLocation();
  const { id, subtasks } = location.state || {};
  const [items, setItems] = useState(subtasks);

  const toggleComplete = async (index) => {
    const updated = [...items];
    updated[index].completed = !updated[index].completed;
    setItems(updated);

    // Update Firestore
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, { subtasks: updated });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">{location.state.title}</h1>

        <div className="space-y-4">
          {items?.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-white/80 rounded-xl shadow-md p-4 border border-gray-100"
            >
              <div>
                <p className="font-medium text-gray-700">{s.name}</p>
                <p className="text-sm text-gray-500">{s.start} → {s.end}</p>
              </div>
              <input
                type="checkbox"
                checked={s.completed || false}
                onChange={() => toggleComplete(i)}
                className="w-5 h-5 accent-indigo-600"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
