import React from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import NavbarAdminMenu from "@/components/layout/NavbarAdminMenu.jsx";
import Dashboard from "@/pages/admin/Dashboard";
import RoomManagement from "@/pages/admin/RoomManagement";
import ShowtimeManagement from "@/pages/admin/ShowtimeManagement";
import MovieManagement from "@/pages/admin/MovieManagement";
import AccountManagement from "@/pages/admin/AccountManagement";
import SeatManagement from "@/pages/admin/SeatManagement";
import DashboardByTime from "@/pages/admin/DashboardByTime";
import DashboardByMovie from "@/pages/admin/DashboardByMovie";
import { useAuth } from "../../contexts/AuthContext";
import AccessDenied from "@/pages/admin/AccessDenied.jsx";
import LockSeatByShowTime from "@/pages/admin/LockSeatByShowTime.jsx";
import PostManagement from "@/pages/admin/PostManagement.jsx";
import PreviewPostPage from "@/pages/admin/PreviewPostPage.jsx";
import PostForm from "@/components/PostForm.jsx";
import PostEdit from "@/components/PostEdit.jsx";

export default function AdminLayout() {
  const { user } = useAuth();
  const isEmployee = user?.role === "EMPLOYEE";
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = React.useState(false);

  const rawPage = searchParams.get("page");
  const currentPage = rawPage || (isEmployee ? "moviemanagement" : "dashboard");

  // Nếu trang bị cấm, tự động chuyển hướng (chỉ chạy khi URL thay đổi)
  React.useEffect(() => {
    if (
        isEmployee &&
        (currentPage === "dashboard" ||
            currentPage.startsWith("dashboard-") ||
            currentPage === "accountmanagement")
    ) {
      setSearchParams({ page: isEmployee ? "moviemanagement" : "dashboard" });
    }
  }, [currentPage, isEmployee]);

  const handleNavigate = (page) => {
    setSearchParams({ page });
    setShowSidebar(false);
  };

  const renderPage = () => {
    const postId = searchParams.get("postId");
    if (
        isEmployee &&
        (currentPage === "dashboard" ||
            currentPage.startsWith("dashboard-") ||
            currentPage === "accountmanagement")
    ) {
      return <AccessDenied />;
    }

    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "dashboard-time":
        return <DashboardByTime />;
      case "dashboard-movie":
        return <DashboardByMovie />;
      case "roommanagement":
        return <RoomManagement />;
      case "showtimemanagement":
        return <ShowtimeManagement />;
      case "moviemanagement":
        return <MovieManagement />;
      case "accountmanagement":
        return <AccountManagement />;
      case "seatmanagement":
        return <SeatManagement />;
      case "seat-lock":
        return <LockSeatByShowTime />;
      case "post":
        return <PostManagement onNavigate={handleNavigate} />;
      case "preview":
        return <PreviewPostPage onNavigate={handleNavigate}/>;
      case "create-post":
        return <PostForm onNavigate={handleNavigate}/>;
      case "post-edit":
        return <PostEdit onNavigate={handleNavigate} postId={postId}/>;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
      <div className="flex h-screen overflow-hidden relative">
        <div
            className={`fixed md:static top-0 left-0 z-40 h-full bg-white transition-transform duration-300
                            border-r w-60 ${
                showSidebar ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0`}
        >
          <NavbarAdminMenu
              currentPage={currentPage}
              onNavigate={handleNavigate}
          />
        </div>

        {showSidebar && (
            <div
                className="fixed inset-0 bg-opacity-50 z-30 md:hidden"
                onClick={() => setShowSidebar(false)}
            />
        )}

        <div className="flex-1 p-4 overflow-auto w-full">
          <button
              className="md:hidden mb-4 text-gray-700 flex items-center gap-2"
              onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <X size={24} /> : <Menu size={24} />}
            <span className="font-semibold">Menu</span>
          </button>

          {renderPage()}
        </div>
      </div>
  );
}
