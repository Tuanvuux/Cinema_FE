import Navbar from "@/components/layout/Navbar";
import PaymentSuccess from "../../components/PaymentSuccess";
import Footer from "@/components/layout/Footer";

export default function PaymentSuccessPage() {
  return (
    <div className="">
      <div className="">
        <Navbar />
      </div>
      <div className="mt-1.5">
        <PaymentSuccess />
      </div>
      <div className="mt-1.5">
        <Footer />
      </div>
    </div>
  );
}
