
import Navbar from "@/components/layout/Navbar"
import Login from "../../components/Login"
import Footer from "@/components/layout/Footer"
import { useEffect } from "react"

export default function LoginPage() {
    useEffect(() => {
        document.title = "Đăng nhập"
    }, [])

    return (
        <div className="min-h-screen flex flex-col">
            <div className="relative z-10">
                <Navbar />
            </div>
            <div className="justify-center">
                <Login />
            </div>
            <div className="relative z-10">
                <Footer />
            </div>
        </div>
    )
}
