import Navbar from "@/components/layout/Navbar";
import UserInfo from "@/components/UserInfo";
import Footer from "@/components/layout/Footer";
import React, {useEffect} from "react";
import ScrollToTopButton from "@/pages/admin/ScrollToTopButton.jsx";


export default function UserInfoPage() {
    useEffect(() => {
        document.title = 'Thông tin cá nhân';
    }, []);
  return (
    <div className="">
        <ScrollToTopButton />
        <div className="">
        <Navbar />
      </div>
      <div className="mt-1.5">
        <UserInfo />
      </div>
      <div className="mt-1.5">
        <Footer />
      </div>
    </div>
  );
}
