import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import GradientText from "../ui/GradientText";

export default function Navbar() {
  const { user, logout } = useAuth(); // Lấy thông tin user và logout từ context
  console.log("user", user);
  return (
    <nav className="bg-white text-gray-900 py-4">
      <div className="container mx-auto flex justify-between items-center px-6 font-medium">
        <h1 className="text-2xl font-bold">
          <Link to="/">
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={3}
              showBorder={false}
              className="custom-class"
            >
              CineX Cinema
            </GradientText>
          </Link>
        </h1>
        <ul className="flex space-x-6 text-lg">
          <li>
            <Link to="/showtime" className="hover:text-yellow-400">
              Lịch chiếu
            </Link>
          </li>
          <li>
            <Link to="/movie" className="hover:text-yellow-400">
              Phim
            </Link>
          </li>
          <li>
            <Link to="/promotion" className="hover:text-yellow-400">
              Ưu đãi
            </Link>
          </li>
          <li>
            <Link to="/news" className="hover:text-yellow-400">
              Tin tức phim
            </Link>
          </li>
          <li>
            <Link to="/member" className="hover:text-yellow-400">
              Thành viên
            </Link>
          </li>

          {/* Hiển thị mục "Trang quản lý" nếu người dùng có role "ADMIN" */}
          {user && (user.role === "ADMIN" || user.role === "EMPLOYEE") && (
            <li>
              <Link to="/admin" className="hover:text-yellow-400">
                Trang quản lý
              </Link>
            </li>
          )}
        </ul>

        <div className="text-lg">
          {user ? (
            <div className="flex items-center text-gray-900">
              <Link
                to="/user/userInfo"
                className="hover:text-yellow-400 font-semibold mx-1"
              >
                {user.fullName}
              </Link>
              <span className="mx-1">/</span>
              <button onClick={logout} className="hover:text-yellow-400 mx-1">
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center text-gray-900">
              <Link to="/login" className="hover:text-yellow-400 mx-1">
                Đăng nhập
              </Link>
              <span className="mx-1">/</span>
              <Link to="/register" className="hover:text-yellow-400 mx-1">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
      <hr />
    </nav>
  );
}
