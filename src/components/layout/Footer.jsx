"use client"

import GoogleMapLogo from "/src/assets/logoGoogleMap.png"

const Footer = () => {
  return (
      <footer className="bg-gray-900 text-white py-10">
        <hr className="border-gray-700" />
        <div className="container mx-auto px-6 lg:px-20 mt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Cột 1 */}
            <div>
              <h2 className="text-3xl font-bold">
                CineX <span className="text-white">Cinema</span>
              </h2>
              <p className="mt-4 text-gray-300">71 Ngũ Hành Sơn, Bắc Mỹ An, Ngũ Hành Sơn, Đà Nẵng</p>
              <div className="flex items-center mt-4 space-x-2">
                <img src={GoogleMapLogo || "/placeholder.svg"} alt="Google Maps" className="w-20 h-18" />
                <a
                    href="https://maps.app.goo.gl/3Hgzkqfi5FujTt7r5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"
                >
                  Xem Bản Đồ
                </a>
              </div>
            </div>

            {/* Cột 2 */}
            <div>
              <h3 className="font-bold uppercase text-white">CineX</h3>
              <ul className="mt-4 space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    Giới Thiệu
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    Tuyển Dụng
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    Liên Hệ
                  </a>
                </li>
              </ul>
            </div>

            {/* Cột 3 */}
            <div>
              <h3 className="font-bold uppercase text-white">Thông Tin Chung</h3>
              <ul className="mt-4 space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    Điều Khoản Chung
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    Câu Hỏi Thường Gặp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    Điều Khoản Giao Dịch
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media */}
          <div className="mt-8 flex justify-center space-x-4">
            <a
                href="#"
                className="w-10 h-10 flex items-center justify-center border border-gray-600 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-200"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
                href="#"
                className="w-10 h-10 flex items-center justify-center border border-gray-600 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-200"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a
                href="#"
                className="w-10 h-10 flex items-center justify-center border border-gray-600 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-200"
            >
              <i className="fab fa-youtube"></i>
            </a>
          </div>

          {/* Bản quyền */}
          <div className="mt-8 text-center text-gray-400">
            <p>Bản quyền © 2025 CineX Cinema</p>
          </div>
        </div>
      </footer>
  )
}

export default Footer
