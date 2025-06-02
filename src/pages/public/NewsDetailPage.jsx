import Navbar from "@/components/layout/Navbar";
import NewsDetail from "../../components/NewsDetail";
import Footer from "@/components/layout/Footer";
import { useEffect } from "react";

export default function NewsDetailPage() {
  useEffect(() => {
    document.title = "Tin tức phim";
  }, []);
  return (
    <div className="">
      <div className="">
        <Navbar />
      </div>
      <div className="mt-1.5">
        <NewsDetail />
      </div>
      <div className="mt-1.5">
        <Footer />
      </div>
    </div>
  );
}
