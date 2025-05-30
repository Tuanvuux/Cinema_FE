import Navbar from "@/components/layout/Navbar";
import Payment from "../../components/Payment";
import Footer from "@/components/layout/Footer";
import {useEffect} from "react";

export default function PaymentPage() {
    useEffect(() => {
        document.title = 'Thanh toán';
    }, []);
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
