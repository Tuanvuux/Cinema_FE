import Navbar from "@/components/layout/Navbar";
import ForgotPassword from "../../components/ForgotPassword";
import Footer from "@/components/layout/Footer";
import {useEffect} from "react";

export default function ForgotPasswordPage() {
    useEffect(() => {
        document.title = 'Khôi phục mật khẩu';
    }, []);
  return (
    <div className="">
      <div className="">
        <Navbar />
      </div>
      <div className="mt-1.5">
        <ForgotPassword />
      </div>
      <div className="mt-1.5">
        <Footer />
      </div>
    </div>
  );
}
