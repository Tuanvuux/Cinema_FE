import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white py-4">
      <div className="container mx-auto flex justify-between items-center px-6">
        <h1 className="text-2xl font-bold">
          <Link to="/">Cinema Booking</Link>
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
        </ul>
        <div>
          <Link to="/login">Đăng nhập</Link> /{" "}
          <Link to="/register">Đăng ký</Link>
        </div>
      </div>
    </nav>
  );
}
