import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import GradientText from "../ui/GradientText"
import { useState } from "react"

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Danh sách các đường dẫn menu hợp lệ
  const menuPaths = [
    "/",
    "/showtime",
    "/movie",
    "/promotion",
    "/news",
    "/member",
    "/admin",
    "/user/userInfo",
    "/login",
    "/register",
  ]

  // Function to check if current path is a valid menu path
  const isValidMenuPath = () => {
    return menuPaths.some((validPath) => {
      if (validPath === "/") {
        return location.pathname === "/"
      }
      return location.pathname.startsWith(validPath)
    })
  }

  // Function to check if current path matches the link
  const isActive = (path) => {
    // Chỉ kiểm tra active nếu đang ở một trang menu hợp lệ
    if (!isValidMenuPath()) {
      return false
    }

    if (path === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(path)
  }

  // Common link classes
  const getLinkClasses = (path) => {
    const baseClasses = "relative px-3 py-2 rounded-lg transition-all duration-300 hover:text-yellow-400"
    const activeClasses = "text-yellow-400 bg-white/10 shadow-lg"
    const inactiveClasses = "text-white hover:bg-white/5"
    if (!isValidMenuPath()) {
      return `${baseClasses} ${inactiveClasses}`
    }
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`
  }

  // Mobile link classes
  const getMobileLinkClasses = (path) => {
    const baseClasses = "block px-4 py-3 rounded-lg transition-all duration-300 hover:text-yellow-400 hover:bg-white/5"
    const activeClasses = "text-yellow-400 bg-white/10"
    const inactiveClasses = "text-white"
    if (!isValidMenuPath()) {
      return `${baseClasses} ${inactiveClasses}`
    }
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  console.log("user", user)

  return (
      <nav className="bg-gray-900 text-white shadow-lg">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Desktop & Mobile Header */}
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <h1 className="text-xl sm:text-2xl font-bold">
              <Link to="/" className="block" onClick={closeMenu}>
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

            {/* Desktop Navigation */}
            <ul className="hidden lg:flex space-x-2 text-lg font-medium">
              <li>
                <Link to="/showtime" className={getLinkClasses("/showtime")}>
                  Lịch chiếu
                  {isActive("/showtime") && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-yellow-400 rounded-full"></div>
                  )}
                </Link>
              </li>
              <li>
                <Link to="/movie" className={getLinkClasses("/movie")}>
                  Phim
                  {isActive("/movie") && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-yellow-400 rounded-full"></div>
                  )}
                </Link>
              </li>
              <li>
                <Link to="/promotion" className={getLinkClasses("/promotion")}>
                  Ưu đãi
                  {isActive("/promotion") && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-yellow-400 rounded-full"></div>
                  )}
                </Link>
              </li>
              <li>
                <Link to="/news" className={getLinkClasses("/news")}>
                  Tin tức phim
                  {isActive("/news") && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-yellow-400 rounded-full"></div>
                  )}
                </Link>
              </li>
              <li>
                <Link to="/member" className={getLinkClasses("/member")}>
                  Thành viên
                  {isActive("/member") && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-yellow-400 rounded-full"></div>
                  )}
                </Link>
              </li>

              {/* Admin/Employee menu */}
              {user && (user.role === "ADMIN" || user.role === "EMPLOYEE") && (
                  <li>
                    <Link to="/admin" className={getLinkClasses("/admin")}>
                      Trang quản lý
                      {isActive("/admin") && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-yellow-400 rounded-full"></div>
                      )}
                    </Link>
                  </li>
              )}
            </ul>

            {/* Desktop User Menu */}
            <div className="hidden lg:block text-lg font-medium">
              {user ? (
                  <div className="flex items-center text-white space-x-1">
                    <Link
                        to="/user/userInfo"
                        className={`font-semibold px-3 py-2 rounded-lg transition-all duration-300 ${
                            isActive("/user") ? "text-yellow-400 bg-white/10" : "hover:text-yellow-400 hover:bg-white/5"
                        }`}
                    >
                      {user.fullName}
                    </Link>
                    <span className="text-gray-400">/</span>
                    <button
                        onClick={logout}
                        className="px-3 py-2 rounded-lg transition-all duration-300 hover:text-yellow-400 hover:bg-white/5"
                    >
                      Đăng xuất
                    </button>
                  </div>
              ) : (
                  <div className="flex items-center text-white space-x-1">
                    <Link
                        to="/login"
                        className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                            isActive("/login") ? "text-yellow-400 bg-white/10" : "hover:text-yellow-400 hover:bg-white/5"
                        }`}
                    >
                      Đăng nhập
                    </Link>
                    <span className="text-gray-400">/</span>
                    <Link
                        to="/register"
                        className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                            isActive("/register") ? "text-yellow-400 bg-white/10" : "hover:text-yellow-400 hover:bg-white/5"
                        }`}
                    >
                      Đăng ký
                    </Link>
                  </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
                onClick={toggleMenu}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
                aria-label="Toggle menu"
            >
              <svg
                  className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          <div
              className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                  isMenuOpen ? 'max-h-screen opacity-100 pb-4' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="space-y-1">
              {/* Navigation Links */}
              <Link to="/showtime" className={getMobileLinkClasses("/showtime")} onClick={closeMenu}>
                Lịch chiếu
              </Link>
              <Link to="/movie" className={getMobileLinkClasses("/movie")} onClick={closeMenu}>
                Phim
              </Link>
              <Link to="/promotion" className={getMobileLinkClasses("/promotion")} onClick={closeMenu}>
                Ưu đãi
              </Link>
              <Link to="/news" className={getMobileLinkClasses("/news")} onClick={closeMenu}>
                Tin tức phim
              </Link>
              <Link to="/member" className={getMobileLinkClasses("/member")} onClick={closeMenu}>
                Thành viên
              </Link>

              {/* Admin/Employee menu for mobile */}
              {user && (user.role === "ADMIN" || user.role === "EMPLOYEE") && (
                  <Link to="/admin" className={getMobileLinkClasses("/admin")} onClick={closeMenu}>
                    Trang quản lý
                  </Link>
              )}

              {/* Divider */}
              <div className="border-t border-gray-700 my-3"></div>

              {/* User Menu for Mobile */}
              {user ? (
                  <div className="space-y-1">
                    <Link
                        to="/user/userInfo"
                        className={`block px-4 py-3 rounded-lg transition-all duration-300 font-semibold ${
                            isActive("/user") ? "text-yellow-400 bg-white/10" : "text-white hover:text-yellow-400 hover:bg-white/5"
                        }`}
                        onClick={closeMenu}
                    >
                      {user.fullName}
                    </Link>
                    <button
                        onClick={() => {
                          logout()
                          closeMenu()
                        }}
                        className="block w-full text-left px-4 py-3 rounded-lg transition-all duration-300 text-white hover:text-yellow-400 hover:bg-white/5"
                    >
                      Đăng xuất
                    </button>
                  </div>
              ) : (
                  <div className="space-y-1">
                    <Link
                        to="/login"
                        className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                            isActive("/login") ? "text-yellow-400 bg-white/10" : "text-white hover:text-yellow-400 hover:bg-white/5"
                        }`}
                        onClick={closeMenu}
                    >
                      Đăng nhập
                    </Link>
                    <Link
                        to="/register"
                        className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                            isActive("/register") ? "text-yellow-400 bg-white/10" : "text-white hover:text-yellow-400 hover:bg-white/5"
                        }`}
                        onClick={closeMenu}
                    >
                      Đăng ký
                    </Link>
                  </div>
              )}
            </div>
          </div>
        </div>
      </nav>
  )
}