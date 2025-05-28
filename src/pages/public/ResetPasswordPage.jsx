import Navbar from "@/components/layout/Navbar";
import ResetPassword from "../../components/ResetPassword";
import Footer from "@/components/layout/Footer";

export default function ResetPasswordPage() {
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
