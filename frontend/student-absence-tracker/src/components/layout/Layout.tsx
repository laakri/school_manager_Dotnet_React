import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const teacher = JSON.parse(localStorage.getItem("teacher") || "null");
  const isAdmin =
    teacher?.firstName?.toLowerCase() === "admin" &&
    teacher?.lastName?.toLowerCase() === "admin";

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        {isAdmin && <Sidebar />}
        <main className={`flex-1 p-8 ${isAdmin ? "ml-64" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
