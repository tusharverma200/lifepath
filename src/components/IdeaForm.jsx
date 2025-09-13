import React, { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, ensureAnon, serverTimestamp } from "../services/firebase";
import { getCareerSuggestions } from "../services/gemini";

export default function IdeaForm() {
  const [skills, setSkills] = useState("");
  const [passions, setPassions] = useState("");
  const [values, setValues] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  useEffect(() => {
    ensureAnon();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const suggested = await getCareerSuggestions({ skills, passions, values });
      setSuggestions(suggested);

      await addDoc(collection(db, "results"), {
        userId: (await (await import("firebase/auth")).getAuth()).currentUser?.uid || null,
        skills,
        passions,
        values,
        suggestions: suggested,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
      alert("Something went wrong — check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        LifePath — Career Suggestions
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Skills
          </label>
          <textarea
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            rows={3}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. coding, design, writing"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Passions
          </label>
          <textarea
            value={passions}
            onChange={(e) => setPassions(e.target.value)}
            rows={2}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. helping people, solving problems"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Values
          </label>
          <textarea
            value={values}
            onChange={(e) => setValues(e.target.value)}
            rows={2}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. innovation, teamwork, flexibility"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-semibold transition"
        >
          {loading ? "Generating..." : "Generate 3 Careers"}
        </button>
      </form>

      {suggestions && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Suggested Careers
          </h2>
          <div className="space-y-4">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-bold text-lg text-gray-700">{s.title}</h3>
                <p className="text-gray-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
