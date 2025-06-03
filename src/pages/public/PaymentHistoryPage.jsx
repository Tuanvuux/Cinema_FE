import Navbar from "@/components/layout/Navbar";
import PaymentHistory from "../../components/PaymentHistory";
import Footer from "@/components/layout/Footer";
import { useEffect } from "react";

export default function PaymentHistoryPage() {
  useEffect(() => {
    document.title = "Lịch sử giao dịch";
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative z-10">
        <Navbar />
      </div>
      <div className="justify-center">
        <PaymentHistory />
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
