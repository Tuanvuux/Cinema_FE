import Navbar from "@/components/layout/Navbar";
import Register from "../../components/Register";
import Footer from "@/components/layout/Footer";

export default function RegisterPage() {
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
