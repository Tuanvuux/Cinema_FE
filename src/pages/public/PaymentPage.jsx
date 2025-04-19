import Navbar from "@/components/layout/Navbar";
import Payment from "../../components/Payment";
import Footer from "@/components/layout/Footer";

export default function PaymentPage() {
  return (
    <div className="">
      <div className="">
        <Navbar />
      </div>
      <div className="mt-1.5">
        <Payment />
      </div>
      <div className="mt-1.5">
        <Footer />
      </div>
    </div>
  );
}
