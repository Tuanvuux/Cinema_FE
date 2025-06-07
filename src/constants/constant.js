import { CreditCard, Smartphone, Globe } from "lucide-react";

export const BASE_URL = "http://localhost:8080";
// export const BASE_URL = "https://cinema-be-yaoa.onrender.com";
export const paymentOptions = [
  {
    id: "momo",
    name: "Thanh toán bằng Ví điện tử MoMo",
    icon: Smartphone,
    color: "from-pink-500 to-pink-600",
    description: "Thanh toán nhanh chóng và bảo mật",
  },
  {
    id: "helio",
    name: "Thanh toán bằng PayPal",
    icon: Globe,
    color: "from-blue-500 to-blue-600",
    description: "Thanh toán quốc tế an toàn",
  },
  {
    id: "visa",
    name: "Internet Banking/VISA",
    icon: CreditCard,
    color: "from-green-500 to-green-600",
    description: "Thanh toán qua thẻ ngân hàng",
  },
];
