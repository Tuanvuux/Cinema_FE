import Navbar from "@/components/layout/Navbar";
import MovieList from "../../components/MovieList";
import Footer from "@/components/layout/Footer";
import React, {useEffect} from "react";
import ScrollToTopButton from "@/pages/admin/ScrollToTopButton.jsx";

export default function MoviePage() {
    useEffect(() => {
        document.title = 'Danh sách phim';
    }, []);
  return (
    <div className="">
        <ScrollToTopButton />
        <div className="">
        <Navbar />
      </div>
      <div className="mt-1.5">
        <MovieList />
      </div>
      <div className="mt-1.5">
        <Footer />
      </div>
    </div>
  );
}
