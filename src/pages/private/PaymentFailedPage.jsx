import Navbar from "@/components/layout/Navbar";
import PaymentFailed from "../../components/PaymentFailed";
import Footer from "@/components/layout/Footer";

export default function PaymentFailedPage() {
  return (
    <div className="">
      <div className="">
        <Navbar />
      </div>
      <div className="mt-1.5">
        <PaymentFailed />
      </div>
      <div className="mt-1.5">
        <Footer />
      </div>
    </div>
  );
}
