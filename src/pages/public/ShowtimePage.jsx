import Navbar from "@/components/layout/Navbar";
import Showtime from "../../components/Showtime";
import Footer from "@/components/layout/Footer";
import React, {useEffect} from "react";
import ScrollToTopButton from "@/pages/admin/ScrollToTopButton.jsx";

export default function ShowTimePage() {
    useEffect(() => {
        document.title = 'Xem lịch chiếu';
    }, []);
  return (
    <div className="">
        <ScrollToTopButton />
        <div className="">
        <Navbar />
      </div>
      <div className="mt-1.5">
        <Showtime />
      </div>
      <div className="mt-1.5">
        <Footer />
      </div>
    </div>
  );
}
