import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Form Builder</h1>
      <div className="flex gap-4">
        <Link
          to="/builder"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium"
        >
          Create New Form
        </Link>
        <Link
          to="/builder/1"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-medium"
        >
          Edit Existing Form
        </Link>
      </div>
    </div>
  );
}
