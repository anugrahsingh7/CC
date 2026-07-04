import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RiHome5Fill } from "react-icons/ri";
import { RiSearch2Line } from "react-icons/ri";
import {
  MdOutlineExplore,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from "react-icons/md";
import { FaSquarePlus } from "react-icons/fa6";
import { useUser } from "@clerk/clerk-react";
import { MdManageAccounts } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
const Aside = () => {
  const [expanded, setExpanded] = useState(null);
  const [screenSize, setScreenSize] = useState("desktop");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [mainUser, setMainUser] = useState();
  const { isDarkMode } = useTheme();
  const isLightMode = !isDarkMode; // Adapt existing logic to use context
  const navItems = [
    { label: "Home", icon: <RiHome5Fill />, path: "/Network" },
    { label: "Search", icon: <RiSearch2Line />, path: "/Search" },
    {
      label: "Explore",
      icon: <MdOutlineExplore />,
      hasSubMenu: true,
      subMenuItems: [
        { label: "Notices", path: "/Notice", icon: "📢" },
        { label: "Events", path: "/Events", icon: "🎉" },
      ],
    },
    {
      label: "Create Post",
      icon: <FaSquarePlus />,
      hasSubMenu: true,
      subMenuItems: [
        { label: "General Post", path: "/Post", icon: "📝" },
        ...(mainUser?.role === "faculty"
          ? [{ label: "Faculty Post", path: "/FacultyPost", icon: "👨‍🏫" }]
          : []),
        { label: "Project Post", path: "/PostProject", icon: "💼" },
      ],
    },
    {
      label: user?.fullName || "My Profile",
      icon: (
        <img
          src={user?.imageUrl}
          alt="Profile"
          className="w-6 h-6 rounded-full border border-white object-cover shadow-lg"
        />
      ),
      path: "/NetworkProfile",
      isUserProfile: true,
    },
    { label: "Settings", icon: <MdManageAccounts />, path: "/Account" },
  ];

  // Check if a route is active
  const isActive = (path) => {
    if (!path) return false;
    return location.pathname === path;
  };

  // Check if any submenu item is active
  const isSubMenuActive = (subMenuItems) => {
    if (!subMenuItems) return false;
    return subMenuItems.some((item) => location.pathname === item.path);
  };

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${user.id}`,
      );
      const data = response.data;
      setMainUser(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Removed toast.error to prevent spam
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize("mobile");
      } else if (width >= 768 && width < 1024) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleNavClick = (item) => {
    if (item.hasSubMenu) {
      setExpanded(expanded === item.label ? null : item.label);
    } else {
      setExpanded(null);
      if (item.path) {
        if (item.isUserProfile && mainUser?._id) {
          // Navigate with ID first, URL will be updated automatically
          navigate(`/NetworkProfile/${mainUser._id}`);
        } else {
          navigate(item.path);
        }

        // Scroll to top for all navigations except Home
        if (item.label !== "Home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    }
  };

  // Mobile footer navigation
  if (screenSize === "mobile") {
    return (
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-[#040404]/95 backdrop-blur-xl border-t border-[#4790fd]/20 z-50 shadow-[0_-4px_20px_rgba(71,144,253,0.15)]">
        {/* Mobile Logo Header */}

        <div className="grid grid-cols-6 gap-1 items-center py-2.5 px-2 w-full">
          {navItems.map((item) => {
            const active =
              isActive(item.path) ||
              (item.hasSubMenu && isSubMenuActive(item.subMenuItems));
            return (
              <button
                key={item.label}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-full group relative ${
                  active
                    ? "bg-[#070707] scale-105 shadow-lg shadow-[#4790fd]/20"
                    : "hover:bg-[#232526]/60 hover:scale-105"
                }`}
                onClick={() => handleNavClick(item)}
                title={item.label}
              >
                <span
                  className={`text-xl transition-all duration-300 ${
                    active
                      ? "text-[#4790fd] scale-110"
                      : "text-gray-300 group-hover:text-[#4790fd] group-hover:scale-110"
                  }`}
                >
                  {item.icon}
                </span>
                {active && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#4790fd] rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>
        {/* Mobile submenu overlay */}
        {expanded && (
          <div className="absolute bottom-full left-0 right-0 bg-[#040404]/98 backdrop-blur-2xl border-t border-[#4790fd]/30 p-4 max-h-64 overflow-y-auto shadow-[0_-8px_30px_rgba(0,0,0,0.5)] animate-slideUp">
            {navItems
              .find((item) => item.label === expanded)
              ?.subMenuItems?.map((subItem) => (
                <button
                  key={subItem.path}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl text-left transition-all duration-300 group ${
                    isActive(subItem.path)
                      ? "bg-gradient-to-r from-[#070707] to-[#232526] text-white shadow-lg shadow-[#4790fd]/20 scale-[1.02]"
                      : "text-gray-300 hover:bg-[#232526]/60 hover:text-white hover:scale-[1.02]"
                  }`}
                  onClick={() => {
                    navigate(subItem.path);
                    setExpanded(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
                    {subItem.icon}
                  </span>
                  <span className="text-sm font-medium">{subItem.label}</span>
                  {isActive(subItem.path) && (
                    <div className="ml-auto w-2 h-2 bg-[#4790fd] rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
          </div>
        )}
      </nav>
    );
  }

  // Tablet sidebar navigation (icons only)
  if (screenSize === "tablet") {
    return (
      <aside className="bg-gradient-to-b from-[#040404] to-[#000000] text-white w-16 min-h-screen flex flex-col py-6 px-2 border-r border-[#4790fd]/20 relative shadow-[4px_0_20px_rgba(71,144,253,0.1)]">
        {/* Tablet Logo Section */}
        <div className="mb-8 flex flex-col items-center justify-center gap-2 group">
          <div className="relative">
            <img
              className="h-10 w-10 object-contain transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 drop-shadow-lg"
              src="/LOGO/CCLOGOTW.avif"
              alt="Campus Connect Logo"
            />
            <div className="absolute inset-0 bg-[#4790fd]/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 -z-10"></div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-[0.6rem] font-bold leading-tight tracking-tight drop-shadow-sm text-center">
              CAMPUS
            </div>
            <div className="text-[0.6rem] font-bold leading-tight tracking-tight drop-shadow-sm text-center">
              CONNECT
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-3 flex-1">
          {navItems.map((item) => {
            const active =
              isActive(item.path) ||
              (item.hasSubMenu &&
                expanded === item.label &&
                isSubMenuActive(item.subMenuItems));
            return (
              <React.Fragment key={item.label}>
                <button
                  className={`flex items-center justify-center py-3 px-2 rounded-xl cursor-pointer transition-all duration-300 text-left relative group ${
                    active
                      ? "bg-[#070707] shadow-lg shadow-[#4790fd]/30 scale-105"
                      : "hover:bg-[#232526]/60 hover:scale-105"
                  }`}
                  onClick={() => handleNavClick(item)}
                  title={item.label}
                >
                  <span
                    className={`text-2xl transition-all duration-300 ${
                      active
                        ? "text-[#4790fd] scale-110"
                        : "text-gray-300 group-hover:text-[#4790fd] group-hover:scale-110"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.hasSubMenu && (
                    <span className="absolute -top-1 -right-1 text-xs text-[#4790fd]">
                      {expanded === item.label ? (
                        <MdKeyboardArrowUp />
                      ) : (
                        <MdKeyboardArrowDown />
                      )}
                    </span>
                  )}
                  {active && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#4790fd] to-[#27dc66] rounded-r-full"></div>
                  )}
                  {/* Enhanced Tooltip */}
                  <div className="absolute left-full ml-3 px-3 py-2 bg-[#040404]/95 backdrop-blur-md text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none shadow-xl border border-[#4790fd]/20">
                    {item.label}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full w-0 h-0 border-t-4 border-r-4 border-b-4 border-transparent border-r-[#040404]"></div>
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Tablet submenu overlay - positioned outside the aside */}
        {expanded && (
          <div className="fixed left-16 top-0 h-full bg-gradient-to-b from-[#040404] to-[#000000] border-r border-[#4790fd]/20 p-6 min-w-56 z-40 shadow-[4px_0_30px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#4790fd]/20">
              <h3 className="text-xl font-bold bg-gradient-to-r from-[#4790fd] to-[#27dc66] bg-clip-text text-transparent">
                {expanded}
              </h3>
              <button
                onClick={() => setExpanded(null)}
                className="text-gray-400 hover:text-[#4790fd] text-2xl transition-all duration-300 hover:scale-110 hover:rotate-90"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {navItems
                .find((item) => item.label === expanded)
                ?.subMenuItems?.map((subItem) => (
                  <button
                    key={subItem.path}
                    className={`flex items-center gap-4 py-3.5 px-4 rounded-xl text-left transition-all duration-300 group ${
                      isActive(subItem.path)
                        ? "bg-gradient-to-r from-[#070707] to-[#232526] text-white shadow-lg shadow-[#4790fd]/20 scale-[1.02]"
                        : "text-gray-300 hover:bg-[#232526]/60 hover:text-white hover:scale-[1.02]"
                    }`}
                    onClick={() => {
                      navigate(subItem.path);
                      setExpanded(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
                      {subItem.icon}
                    </span>
                    <span className="text-base font-medium flex-1">
                      {subItem.label}
                    </span>
                    {isActive(subItem.path) && (
                      <div className="w-2 h-2 bg-[#4790fd] rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
            </div>
          </div>
        )}
      </aside>
    );
  }

  // Desktop sidebar navigation
  return (
    <aside
      className={`bg-[#070707]  text-white w-64 min-h-screen flex flex-col py-6 px-4 border-r border-[#4790fd]/30 relative shadow-[4px_0_30px_rgba(71,144,253,0.2)] overflow-hidden ${isLightMode ? "bg-[#f5f5f5]" : "bg-[#070707]"}`}
    >
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4790fd]/10 via-transparent to-[#27dc66]/5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#4790fd]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#27dc66]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      {/* Logo Section */}
      <a
        href="/"
        className="mb-8 flex items-center gap-3 relative z-10 group cursor-pointer"
      >
        <div className="relative flex items-center">
          <img
            className="h-14 w-14 object-contain drop-shadow-lg"
            src="/LOGO/CCLOGOTW.avif"
            alt="Campus Connect Logo"
          />
          <div className="absolute inset-0 bg-[#4790fd]/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 -z-10"></div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-md font-bold leading-tight tracking-tight drop-shadow-sm">
            CAMPUS CONNECT
          </div>
          <div className="text-[0.65rem] text-white/90 leading-tight font-medium">
            Unified Under One Connection
          </div>
        </div>
      </a>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1 relative z-10">
        {navItems.map((item) => {
          const active =
            isActive(item.path) ||
            (item.hasSubMenu &&
              expanded === item.label &&
              isSubMenuActive(item.subMenuItems));
          return (
            <React.Fragment key={item.label}>
              <button
                className={`group flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer transition-all duration-300 text-left relative overflow-hidden ${
                  active
                    ? "bg-[#070707] shadow-xl shadow-[#4790fd]/30 scale-[1.02]"
                    : "hover:bg-white/10 hover:scale-[1.01] hover:shadow-lg hover:shadow-[#4790fd]/20"
                }`}
                onClick={() => handleNavClick(item)}
              >
                {/* Active indicator bar */}

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                <span
                  className={`text-2xl flex-shrink-0 transition-all duration-300 relative z-10 ${
                    active
                      ? "text-white scale-110"
                      : "text-white/90 group-hover:text-white group-hover:scale-110"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-base font-semibold flex-1 relative z-10 transition-all duration-300 ${
                    active
                      ? "text-white"
                      : "text-white/95 group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
                {item.hasSubMenu && (
                  <span
                    className={`text-xl flex-shrink-0 transition-all duration-300 relative z-10 ${
                      expanded === item.label
                        ? "rotate-180 text-white"
                        : "text-white/70 group-hover:text-white"
                    }`}
                  >
                    <MdKeyboardArrowDown />
                  </span>
                )}

                {/* Active pulse effect */}
                {active && (
                  <div className="absolute inset-0 rounded-xl bg-[#4790fd]/10 animate-pulse"></div>
                )}
              </button>

              {/* Submenu */}
              {item.hasSubMenu && expanded === item.label && (
                <div className="flex flex-col pl-14 gap-2 mt-1 animate-fadeIn">
                  {item.subMenuItems?.map((subItem, index) => (
                    <button
                      key={subItem.path}
                      className={`group/sub relative py-2.5 px-4 rounded-lg text-left text-sm cursor-pointer transition-all duration-300 overflow-hidden ${
                        isActive(subItem.path)
                          ? "bg-[#070707] font-semibold text-white shadow-lg shadow-[#c76191]/20 scale-[1.02]"
                          : "text-white/80 hover:bg-white/10 hover:text-white hover:scale-[1.01]"
                      }`}
                      onClick={() => {
                        navigate(subItem.path);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Active indicator */}

                      {/* Hover shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/sub:translate-x-[100%] transition-transform duration-700"></div>

                      <span className="relative z-10 flex items-center gap-2">
                        <span className="text-base">{subItem.icon}</span>
                        <span>{subItem.label}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </aside>
  );
};

export default Aside;
