import Navbar from "@/components/layout/Navbar";
import News from "../../components/News";
import Footer from "@/components/layout/Footer";
import { useEffect } from "react";

export default function NewsPage() {
  useEffect(() => {
    document.title = "Tin tức phim";
  }, []);
  return (
    <div className="">
      <div className="">
        <Navbar />
      </div>
      <div className="mt-1.5">
        <News />
      </div>
      <div className="mt-1.5">
        <Footer />
      </div>
    </div>
  );
}
