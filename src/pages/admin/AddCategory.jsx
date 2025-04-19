import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AddMovieForm from "../../components/AddMovieForm";
import AddCategoryForm from "../../components/AddCategoryForm";
import {useEffect} from "react";

export default function AddCategory() {
    useEffect(() => {
        document.title = 'Thêm Danh Mục Mới';
    }, []);
  return (
    <div className="">
      <div className="">
        <Navbar />
      </div>
      <div className="mt-1.5">
        <AddCategoryForm />
      </div>
      <div className="mt-1.5">
        <Footer />
      </div>
    </div>
  );
}
