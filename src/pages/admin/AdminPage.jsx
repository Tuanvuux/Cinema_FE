import Navbar from "@/components/layout/Navbar.jsx";
import Footer from "@/components/layout/Footer.jsx";
import ShowtimeManagement from "@/pages/admin/ShowTimeManagement.jsx";
import NavbarAdminMenu from "@/components/layout/NavbarAdminMenu.jsx";

export default function AdminPage() {
  return (
      <div className="">
          <div className="flex">
              <div className="w-64 flex-shrink-0">
                  <NavbarAdminMenu/>
              </div>
              <div className="flex-1 p-6">
                  <ShowtimeManagement/>
              </div>
          </div>
          {/*<div className="mt-1.5">*/}
          {/*  <Footer />*/}
          {/*</div>*/}
      </div>
  );
}
