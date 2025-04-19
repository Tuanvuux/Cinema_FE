const Footer = () => {
  return (
    <footer className="bg-[#0a192f] text-white py-10">
      <div className="container mx-auto px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Cột 1 */}
          <div>
            <h2 className="text-3xl font-bold">
              metiz <span className="text-gray-300">CINEMA</span>
            </h2>
            <p className="mt-4 text-gray-400">
              Tầng 1 HELIO CENTER, Đường 2/9, Hải Châu, Đà Nẵng
            </p>
            <div className="flex items-center mt-4 space-x-2">
              <img
                src="/google-maps.png"
                alt="Google Maps"
                className="w-8 h-8"
              />
              <a href="#" className="text-blue-400 hover:underline">
                Xem Bản Đồ
              </a>
            </div>
          </div>

          {/* Cột 2 */}
          <div>
            <h3 className="font-bold uppercase">Metiz Cinema</h3>
            <ul className="mt-4 space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Giới Thiệu
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Tuyển Dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Liên Hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3 */}
          <div>
            <h3 className="font-bold uppercase">Thông Tin Chung</h3>
            <ul className="mt-4 space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Điều Khoản Chung
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Câu Hỏi Thường Gặp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
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
            className="w-10 h-10 flex items-center justify-center border rounded-full hover:bg-gray-700"
          >
            <i className="fab fa-facebook-f"></i>
          </a>
          <a
            href="#"
            className="w-10 h-10 flex items-center justify-center border rounded-full hover:bg-gray-700"
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a
            href="#"
            className="w-10 h-10 flex items-center justify-center border rounded-full hover:bg-gray-700"
          >
            <i className="fab fa-youtube"></i>
          </a>
        </div>

        {/* Bản quyền */}
        <div className="mt-8 text-center text-gray-500">
          <p>Bản quyền © 2017 Metiz Cinema</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
