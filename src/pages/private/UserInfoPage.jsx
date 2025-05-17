import Navbar from "@/components/layout/Navbar";
import UserInfo from "@/components/UserInfo";
import Footer from "@/components/layout/Footer";

export default function UserInfoPage() {
  return (
    <div className="">
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
