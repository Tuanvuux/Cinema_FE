import React, { useState,useMemo  } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import GradientText from "@/components/ui/GradientText.jsx";
import { Link } from "react-router-dom";

const navItems = [
  {
    key: "dashboard",
    icon: "assessment",
    label: "Báo cáo",
    hasSubmenu: true,
    submenu: [
      { key: "dashboard-time", icon: "watch_later", label: "Theo thời gian" },
      { key: "dashboard-movie", icon: "play_circle", label: "Theo phim" },
    ],
  },
  { key: "roommanagement", icon: "meeting_room", label: "Phòng chiếu" },
  { key: "showtimemanagement", icon: "calendar_month", label: "Lịch chiếu" },
  { key: "moviemanagement", icon: "movie", label: "Phim" },
  { key: "accountmanagement", icon: "account_circle", label: "Tài khoản" },
  {
    key: "seatmanagement",
    icon: "event_seat",
    label: "Ghế ngồi",
    hasSubmenu: true,
    submenu: [{ key: "seat-lock", icon: "lock", label: "Khóa ghế theo lịch" }],
  },
  { key: "post", icon: "article", label: "Bài viết" },
  // { key: 'newmanagement', icon: 'article', label: 'Quản lý bài viết' },
];

const NavbarAdminMenu = ({ currentPage, onNavigate }) => {
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState(null);
  const { user } = useAuth();

  const isEmployee = user?.role === "EMPLOYEE";

  // Kiểm tra xem menu item có bị disabled không
  const isDisabled = (key) => {
    if (isEmployee) {
      return key === "accountmanagement" || key === "dashboard";
    }
    return false;
  };
  const filteredNavItems = useMemo(() => {
    return navItems.filter(item => !isDisabled(item.key));
  }, [isEmployee]);
  // Kiểm tra xem menu item có đang active không (bao gồm cả trang con)
  const isActive = (item) => {
    if (item.key === "post") {
      // Với menu "post", kiểm tra cả các trang con
      return currentPage === "post" || currentPage === "preview" || currentPage === "create-post" || currentPage === "post-edit";
    }

    // Logic cũ cho các menu khác
    return currentPage === item.key || currentPage.startsWith(`${item.key}-`);
  };

  const handleItemClick = (item) => {
    // Nếu item bị disabled, không làm gì cả
    if (isDisabled(item.key)) {
      return;
    }

    if (item.hasSubmenu) {
      setExpandedItem(expandedItem === item.key ? null : item.key);
      if (["dashboard", "seatmanagement"].includes(item.key)) {
        onNavigate(item.key);
      }
    } else {
      onNavigate(item.key);
      setExpandedItem(null);
    }
  };

  const handleSubmenuClick = (parentKey, submenuKey) => {
    // Kiểm tra xem parent menu có bị disabled không
    if (isDisabled(parentKey)) {
      return;
    }
    onNavigate(submenuKey);
  };

  return (
      <div className="w-60 bg-gray-900 text-white p-4 flex flex-col h-screen">
        <h1
            className="mb-4 cursor-pointer text-2xl"
            onClick={() => navigate("/")}
        >
          <Link to="/" >
            <GradientText
                colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                animationSpeed={3}
                showBorder={false}
                className="custom-class"
            >
              CineX Cinema
            </GradientText>
          </Link>
          {/*<GradientText*/}
          {/*    colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}*/}
          {/*    animationSpeed={3}*/}
          {/*    showBorder={false}*/}
          {/*    className="custom-class"*/}
          {/*>*/}
          {/*  CineX Cinema*/}
          {/*</GradientText>*/}
        </h1>

        <nav className="space-y-2 flex-grow">
          {navItems.map((item) => {
            const itemDisabled = isDisabled(item.key);
            const itemActive = isActive(item);

            return (
                <div key={item.key} className="space-y-1">
                  <button
                      onClick={() => handleItemClick(item)}
                      disabled={itemDisabled}
                      className={`flex items-center justify-between w-full text-left gap-2 py-2 px-3 rounded transition ${
                          itemActive
                              ? "bg-gray-800 text-white"
                              : itemDisabled
                                  ? "text-gray-500 cursor-not-allowed opacity-50" // Mờ đi và không cho phép click
                                  : "hover:bg-gray-700 text-gray-300"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-icons">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.hasSubmenu && !itemDisabled && (
                        <span className="material-icons text-sm">
                    {expandedItem === item.key ? "expand_less" : "expand_more"}
                  </span>
                    )}
                  </button>

                  {item.hasSubmenu &&
                      expandedItem === item.key &&
                      !itemDisabled && (
                          <div className="pl-8 space-y-1 bg-gray-800 rounded">
                            {item.submenu.map((subItem) => (
                                <button
                                    key={subItem.key}
                                    onClick={() =>
                                        handleSubmenuClick(item.key, subItem.key)
                                    }
                                    className={`flex items-center w-full text-left py-2 px-3 rounded transition ${
                                        currentPage === subItem.key
                                            ? "bg-gray-700 text-white"
                                            : "hover:bg-gray-700 text-gray-300"
                                    }`}
                                >
                        <span className="material-icons mr-2 text-sm">
                          {subItem.icon}
                        </span>
                                  <span>{subItem.label}</span>
                                </button>
                            ))}
                          </div>
                      )}
                </div>
            );
          })}
        </nav>
      </div>
  );
};

export default NavbarAdminMenu;