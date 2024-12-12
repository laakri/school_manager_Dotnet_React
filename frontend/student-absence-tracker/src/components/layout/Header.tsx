import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const teacher = JSON.parse(localStorage.getItem("teacher") || "null");
  const isAdmin =
    teacher?.firstName?.toLowerCase() === "admin" &&
    teacher?.lastName?.toLowerCase() === "admin";

  function handleSignOut() {
    localStorage.removeItem("teacher");
    navigate("/login");
  }

  // Only render header for admin
  if (!isAdmin) {
    return (
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-end items-center">
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Student Absence Tracker
          </h1>
          <div className="flex items-center space-x-4">
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
