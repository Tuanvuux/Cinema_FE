import { Routes, Route } from "react-router-dom";
import ProtectAdminRoute from "./ProtectAdminRoute";
import AddCategory from "../pages/admin/AddCategory.jsx";
import AddMovie from "@/pages/admin/AddMovie.jsx";
import RoomManagement from "@/pages/admin/RoomManagement.jsx";
import ShowTimeManagement from "@/pages/admin/ShowTimeManagement.jsx";
import MovieManagement from "@/pages/admin/MovieManagement.jsx";
import AdminPage from "../pages/admin/AdminPage.jsx";
import AccountManagement from "@/pages/admin/AccountManagement.jsx";
import SeatManagement from "@/pages/admin/SeatManagement.jsx";
import { Outlet } from "react-router-dom";
import DashBoard from "@/pages/admin/DashBoard.jsx"
import AdminLayout from "@/pages/admin/AdminLayout.jsx";

const AdminOutlet  = () => (
  <ProtectAdminRoute>
    <Outlet />
  </ProtectAdminRoute>
);

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminOutlet  />}>
          <Route path="/" element={<AdminLayout />} />
        <Route path="/" element={<AdminPage />} />
        <Route path="addcategory" element={<AddCategory />} />
        <Route path="addmovie" element={<AddMovie />} />
        {/*<Route path="roommanagement" element={<RoomManagement />} />*/}
        {/*<Route path="showtimemanagement" element={<ShowTimeManagement />} />*/}
        {/*<Route path="moviemanagement" element={<MovieManagement />} />*/}
        {/*<Route path="accountmanagement" element={<AccountManagement />} />*/}
        {/*<Route path="seatmanagement" element={<SeatManagement />} />*/}
        {/*  <Route path="dashboard" element={<DashBoard />} />*/}
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
