import Navbar from "@/components/layout/Navbar";
import SeatSelection from "@/components/SeatSelection";
import Footer from "@/components/layout/Footer";
import {useEffect} from "react";

export default function SeatSelectionPage() {
    useEffect(() => {
        document.title = 'Đặt ghế';
    }, []);
  return (
    <div className="">
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
