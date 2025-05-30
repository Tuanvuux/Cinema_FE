import Navbar from "@/components/layout/Navbar";
import Register from "../../components/Register";
import Footer from "@/components/layout/Footer";
import {useEffect} from "react";

export default function RegisterPage() {
    useEffect(() => {
        document.title = "Đăng ký";
    }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative z-10">
        <Navbar />
      </div>
      <div className="justify-center">
        <Register />
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
