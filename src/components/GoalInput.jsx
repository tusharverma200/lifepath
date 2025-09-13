import { useState } from "react";

export default function GoalInput({ onAdd }) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !duration) return;
    onAdd({ title, duration: parseInt(duration, 10) });
    setTitle("");
    setDuration("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
      <input
        type="text"
        placeholder="Enter your goal (e.g. Learn React)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
      />
      <input
        type="number"
        placeholder="Duration (days)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="w-40 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
      >
        Add
      </button>
    </form>
  );
}
