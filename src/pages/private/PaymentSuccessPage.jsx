import Navbar from "@/components/layout/Navbar";
import PaymentSuccess from "../../components/PaymentSuccess";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/pages/admin/ScrollToTopButton.jsx";
import React from "react";

export default function PaymentSuccessPage() {
  return (
    <div className="">
        <ScrollToTopButton />
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
