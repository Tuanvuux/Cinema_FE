import Navbar from "@/components/layout/Navbar";
import Showtime from "../../components/Showtime";
import Footer from "@/components/layout/Footer";

export default function ShowTimePage() {
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
