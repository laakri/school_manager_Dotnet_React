import { Link } from "react-router-dom";
import { School } from "lucide-react";

const Sidebar = () => {
  const navigation = [
    { name: "Dashboard", href: "/", icon: "HomeIcon" },
    { name: "Teachers", href: "/teachers", icon: "UserGroupIcon" },
    { name: "Students", href: "/students", icon: "AcademicCapIcon" },
    { name: "Classes", href: "/classes", icon: "BookOpenIcon" },
    { name: "Subjects", href: "/subjects", icon: "BookmarkIcon" },
    { name: "Absences", href: "/absences", icon: "CalendarIcon" },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <School />
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
