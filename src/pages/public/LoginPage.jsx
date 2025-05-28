import Navbar from "@/components/layout/Navbar";
import Login from "../../components/Login";
import Footer from "@/components/layout/Footer";
import {useEffect} from "react";

export default function LoginPage() {
    useEffect(() => {
        document.title = "Đăng nhập";
    }, []);
  return (
    <div className="">
      <div className="">
        <Navbar />
      </div>
      <div className="mt-1.5">
        <Login />
      </div>
      <div className="mt-1.5">
        <Footer />
      </div>
    </div>
  );
}
