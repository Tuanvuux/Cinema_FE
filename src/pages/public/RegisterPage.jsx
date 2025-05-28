import Navbar from "@/components/layout/Navbar";
import Register from "../../components/Register";
import Footer from "@/components/layout/Footer";
import {useEffect} from "react";

export default function RegisterPage() {
    useEffect(() => {
        document.title = "Đăng ký";
    }, []);
  return (
    <div className="">
      <div className="">
        <Navbar />
      </div>
      <div className="mt-1.5">
        <Register />
      </div>
      <div className="mt-1.5">
        <Footer />
      </div>
    </div>
  );
}
