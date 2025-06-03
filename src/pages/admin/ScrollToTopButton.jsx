import React, { useEffect, useState } from 'react';

const ScrollToTopButton = ({ containerRef = null }) => {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            console.log("ScrollToTopButton mounted");

            // Nếu có containerRef, theo dõi scroll của container đó
            if (containerRef && containerRef.current) {
                setShowButton(containerRef.current.scrollTop > 100);
            } else {
                // Fallback: theo dõi scroll của window
                setShowButton(window.scrollY > 100);
            }
        };

        // Xác định element để theo dõi scroll
        const scrollElement = containerRef?.current || window;

        if (containerRef?.current) {
            containerRef.current.addEventListener('scroll', handleScroll);
        } else {
            window.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (containerRef?.current) {
                containerRef.current.removeEventListener('scroll', handleScroll);
            } else {
                window.removeEventListener('scroll', handleScroll);
            }
        };
    }, [containerRef]);

    const scrollToTop = () => {
        if (containerRef && containerRef.current) {
            // Scroll container về đầu
            containerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        } else {
            // Fallback: scroll window về đầu
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    };

    return (
        showButton && (
            <button
                onClick={scrollToTop}
                title="Lên đầu trang"
                className="fixed bottom-8 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 ease-out flex items-center justify-center border-2 border-white/20 backdrop-blur-sm group animate-bounce-in"
            >
                <svg
                    className="w-6 h-6 transform group-hover:-translate-y-0.5 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                </svg>
            </button>
        )
    );
};

export default ScrollToTopButton;