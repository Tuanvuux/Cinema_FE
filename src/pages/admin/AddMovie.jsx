import Navbar from "@/components/layout/Navbar.jsx";
import AddMovieForm from "@/components/AddMovieForm.jsx";
import Footer from "@/components/layout/Footer.jsx";
import {useEffect} from "react";

export default function AddMovie(){
    useEffect(() => {
        document.title = 'Thêm Phim Mới';
    }, []);
    return (
        <div className="">
            <div className="">
                <Navbar/>
            </div>
            <div className="mt-1.5">
                <AddMovieForm/>
            </div>
            <div className="mt-1.5">
                <Footer/>
            </div>
        </div>
    );
}