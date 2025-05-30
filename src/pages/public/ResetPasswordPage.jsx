import Navbar from "@/components/layout/Navbar";
import ResetPassword from "../../components/ResetPassword";
import Footer from "@/components/layout/Footer";
import {useEffect} from "react";

export default function ResetPasswordPage() {
    useEffect(() => {
        document.title = 'Đặt lại mật khẩu';
    }, []);
  return (
    <div className="">
      <div className="">
        <Navbar />
      </div>
      <div className="mt-1.5">
        <ResetPassword />
      </div>
      <div className="mt-1.5">
        <Footer />
      </div>
    </div>
  );
}
