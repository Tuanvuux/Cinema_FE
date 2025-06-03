import Navbar from "@/components/layout/Navbar";
import HomeSlider from "@/components/HomeSlider"; // This was MovieBannerSlider in previous context
import MovieSlider from "@/components/MovieSlider";
import Footer from "@/components/layout/Footer";
import React, {useEffect} from "react";
import ScrollToTopButton from "@/pages/admin/ScrollToTopButton.jsx";

export default function HomePage() {
    useEffect(() => {
        document.title = 'Trang chủ';
    }, []);
    return (
        <div className="min-h-screen flex flex-col"> {/* Added min-h-screen and flex-col */}
            <ScrollToTopButton />
            <div className="flex-grow"> {/* Allows content to expand */}
                <Navbar />
                <div className="mt-1.5 md:mt-3 lg:mt-5"> {/* Adjusted top margin for responsiveness */}
                    <HomeSlider />
                </div>
                <div className="mt-1.5 md:mt-3 lg:mt-5"> {/* Adjusted top margin for responsiveness */}
                    <MovieSlider />
                </div>
            </div>
            <div className="mt-auto"> {/* Pushes footer to the bottom */}
                <Footer />
            </div>
        </div>
    );
}