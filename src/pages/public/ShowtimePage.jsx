import Navbar from "@/components/layout/Navbar";
import Showtime from "../../components/Showtime";
import Footer from "@/components/layout/Footer";
import {useEffect} from "react";

export default function ShowTimePage() {
    useEffect(() => {
        document.title = 'Xem lịch chiếu';
    }, []);
  return (
    <div className="">
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
