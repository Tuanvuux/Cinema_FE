import { Routes, Route } from "react-router-dom";
import AddCategory from "../pages/admin/AddCategory.jsx";
import AddMovie from "@/pages/admin/AddMovie.jsx";
import RoomManagement from "@/pages/admin/RoomManagement.jsx";
import ShowTimeManagement from "@/pages/admin/ShowTimeManagement.jsx";
import MovieManagement from "@/pages/admin/MovieManagement.jsx";
import AccountManagement from "@/pages/admin/AccountManagement.jsx";

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="addcategory" element={<AddCategory />} />
            <Route path="addmovie" element={<AddMovie />} />
            <Route path="roommanagement" element={<RoomManagement/>}/>
            <Route path="showtimemanagement" element={<ShowTimeManagement/>}/>
            <Route path="moviemanagement" element={<MovieManagement/>}/>
            <Route path="accountmanagement" element={<AccountManagement/>}/>
        </Routes>
    );
};

export default AdminRoutes;
