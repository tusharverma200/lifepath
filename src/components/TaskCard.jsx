import { Link } from "react-router-dom";

export default function TaskCard({ task }) {
  const completedCount = task.subtasks.filter((s) => s.completed).length;
  const totalCount = task.subtasks.length;

  return (
    <Link
      to={`/task/${task.id}`}
      state={task}
      className="block bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-5 hover:shadow-2xl border border-gray-100 transition"
    >
      <h2 className="text-lg font-semibold text-gray-800">{task.title}</h2>
      <p className="text-sm text-gray-500">
        {completedCount}/{totalCount} subtasks done
      </p>
      <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
        <div
          className="bg-indigo-600 h-2 rounded-full"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        ></div>
      </div>
    </Link>
  );
}
