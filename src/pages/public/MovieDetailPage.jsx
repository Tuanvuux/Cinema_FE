import Navbar from "@/components/layout/Navbar";
import MovieDetail from "../../components/MovieDetail";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/pages/admin/ScrollToTopButton.jsx";

export default function MovieDetailPage() {
  return (
    <div className="">
        <ScrollToTopButton/>
        <div className="">
        <Navbar />
      </div>
      <div className="mt-1.5">
        <MovieDetail />
      </div>
      <div className="mt-1.5">
        <Footer />
      </div>
    </div>
  );
}
