import Navbar from "@/components/layout/Navbar";
import News from "../../components/News";
import Footer from "@/components/layout/Footer";
import React, { useEffect } from "react";
import ScrollToTopButton from "@/pages/admin/ScrollToTopButton.jsx";

export default function NewsPage() {
  useEffect(() => {
    document.title = "Tin tức phim";
  }, []);
  return (
    <div className="">
        <ScrollToTopButton />
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
