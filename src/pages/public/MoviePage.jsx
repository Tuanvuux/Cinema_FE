import Navbar from "@/components/layout/Navbar";
import MovieList from "../../components/MovieList";
import Footer from "@/components/layout/Footer";

export default function MoviePage() {
  return (
    <div className="">
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
