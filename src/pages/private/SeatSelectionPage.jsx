import Navbar from "@/components/layout/Navbar";
import SeatSelection from "@/components/SeatSelection";
import Footer from "@/components/layout/Footer";
import React, {useEffect} from "react";
import ScrollToTopButton from "@/pages/admin/ScrollToTopButton.jsx";

export default function SeatSelectionPage() {
    useEffect(() => {
        document.title = 'Đặt ghế';
    }, []);
  return (
    <div className="">
        <ScrollToTopButton />
        <div className="">
        <Navbar />
      </div>
      <div className="mt-1.5">
        <SeatSelection />
      </div>
      <div className="mt-1.5">
        <Footer />
      </div>
    </div>
  );
}
