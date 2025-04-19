import Navbar from "@/components/layout/Navbar";
import MovieDetail from "../../components/MovieDetail";
import Footer from "@/components/layout/Footer";

export default function MovieDetailPage() {
  return (
    <div className="">
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
