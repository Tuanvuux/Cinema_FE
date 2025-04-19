import Navbar from "@/components/layout/Navbar";
import Login from "../../components/Login";
import Footer from "@/components/layout/Footer";

export default function LoginPage() {
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
