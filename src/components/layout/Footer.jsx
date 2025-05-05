import GoogleMapLogo from "/src/assets/logoGoogleMap.png";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-900 py-10">
      <hr />
      <div className="container mx-auto px-6 lg:px-20 mt-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Cột 1 */}
          <div>
            <h2 className="text-3xl font-bold">
              CineX <span className="text-gray-900">Cinema</span>
            </h2>
            <p className="mt-4 text-gray-900">
              71 Ngũ Hành Sơn, Bắc Mỹ An, Ngũ Hành Sơn, Đà Nẵng
            </p>
            <div className="flex items-center mt-4 space-x-2">
              <img
                src={GoogleMapLogo}
                alt="Google Maps"
                className="w-20 h-18"
              />
              <a
                href="https://maps.app.goo.gl/3Hgzkqfi5FujTt7r5"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Xem Bản Đồ
              </a>
            </div>
          </div>

          {/* Cột 2 */}
          <div>
            <h3 className="font-bold uppercase">CineX</h3>
            <ul className="mt-4 space-y-2 text-gray-900">
              <li>
                <a href="#" className="hover:text-black">
                  Giới Thiệu
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Tuyển Dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Liên Hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3 */}
          <div>
            <h3 className="font-bold uppercase">Thông Tin Chung</h3>
            <ul className="mt-4 space-y-2 text-gray-900">
              <li>
                <a href="#" className="hover:text-black">
                  Điều Khoản Chung
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Câu Hỏi Thường Gặp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
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
            className="w-10 h-10 flex items-center justify-center border rounded-full hover:bg-gray-900"
          >
            <i className="fab fa-facebook-f"></i>
          </a>
          <a
            href="#"
            className="w-10 h-10 flex items-center justify-center border rounded-full hover:bg-gray-900"
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a
            href="#"
            className="w-10 h-10 flex items-center justify-center border rounded-full hover:bg-gray-900"
          >
            <i className="fab fa-youtube"></i>
          </a>
        </div>

        {/* Bản quyền */}
        <div className="mt-8 text-center text-gray-900">
          <p>Bản quyền © 2025 CineX Cinema</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
