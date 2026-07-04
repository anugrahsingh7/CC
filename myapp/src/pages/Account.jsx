import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import {
  User,
  Shield,
  LogOut,
  UserCircle,
  ChevronRight,
  Settings,
  Bell,
  Crown,
  Sun,
  Moon,
  CheckCircle,
  Sparkles,
  UserCog,
  UserPen,
  Users,
  LifeBuoy,
  Mail,
  Building2,
  Phone,
  Globe,
  Clock,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { ModalWindow } from "../components/ModalWindow";
import { FacultyRoleModal } from "../components/FacultyRoleModal";
import ConnectionRequestsModal from "../components/ConnectionRequestsModal";

const Account = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const [modal, setShowModal] = useState(false);
  const [mainUser, setMainUser] = useState();
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${user.id}`
      );
      setMainUser(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Removed toast.error to prevent spam
    }
  };

  const handleReject = async (reqId) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/connectionsRejected/${
          mainUser._id
        }`,
        { senderId: reqId }
      );
      toast.success("Connection rejected successfully.");
    } catch (error) {
      console.error("Error rejecting connection:", error);
      toast.error("Failed to reject connection.");
    }
  };

  const handleAccept = async (reqId) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/connectionsAccepted/${
          mainUser._id
        }`,
        { senderId: reqId }
      );
      toast.success("Connection accepted successfully.");
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast.error("Failed to accept connection.");
    }
  };

  const handleClick = async () => {
    setShowModal(true);
  };

  const MenuCard = ({
    icon: Icon,
    label,
    description,
    onClick,
    variant = "default",
    badge,
  }) => {
    const variants = {
      default: {
        bg: "from-[#4790fd]/10 via-[#c76191]/5 to-[#27dc66]/10",
        border: "border-[#4790fd]/20",
        hoverBorder: "hover:border-[#4790fd]/30",
        iconBg: "bg-[#4790fd]/10",
        iconColor: "text-[#4790fd]",
      },
      primary: {
        bg: "from-[#4790fd]/15 to-[#4790fd]/5",
        border: "border-[#4790fd]/25",
        hoverBorder: "hover:border-[#4790fd]/35",
        iconBg: "bg-[#4790fd]/15",
        iconColor: "text-[#4790fd]",
      },
      warning: {
        bg: "from-[#ece239]/15 to-[#ece239]/5",
        border: "border-[#ece239]/25",
        hoverBorder: "hover:border-[#ece239]/35",
        iconBg: "bg-[#ece239]/15",
        iconColor: "text-[#ece239]",
      },
      success: {
        bg: "from-[#27dc66]/15 to-[#27dc66]/5",
        border: "border-[#27dc66]/25",
        hoverBorder: "hover:border-[#27dc66]/35",
        iconBg: "bg-[#27dc66]/15",
        iconColor: "text-[#27dc66]",
      },
      premium: {
        bg: "from-[#c76191]/15 to-[#c76191]/5",
        border: "border-[#c76191]/25",
        hoverBorder: "hover:border-[#c76191]/35",
        iconBg: "bg-[#c76191]/15",
        iconColor: "text-[#c76191]",
      },
    };

    const style = variants[variant] || variants.default;

    return (
      <button
        onClick={onClick}
        className={`group w-full cursor-pointer p-5 rounded-2xl mb-3 transition-all duration-300 bg-gradient-to-br ${style.bg} border ${style.border} ${style.hoverBorder} backdrop-blur-xl hover:scale-[1.01] hover:shadow-lg relative overflow-hidden bg-white/50 dark:bg-transparent`}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${style.iconBg} ${style.iconColor} group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-[#f5f5f5] text-base group-hover:text-blue-600 dark:group-hover:text-white transition-colors">
                {label}
              </h3>
              {description && (
                <p className="text-gray-500 dark:text-[#a0a0a0] text-sm mt-0.5 group-hover:text-gray-700 dark:group-hover:text-[#c0c0c0] transition-colors">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {badge && (
              <span className="px-2.5 py-1 bg-[#ece239]/20 text-[#ece239] text-xs rounded-full font-medium border border-[#ece239]/30 animate-pulse">
                {badge}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-[#a0a0a0] group-hover:text-[#4790fd] group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070707] py-6 px-3 sm:py-8 sm:px-4 md:px-6 relative overflow-hidden transition-colors duration-300">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4790fd]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#c76191]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#27dc66]/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Profile Header Card */}
        <div className="relative group mb-6">
          {/* Gradient blur background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4790fd]/10 via-[#c76191]/5 to-[#27dc66]/10 rounded-3xl blur-xl opacity-50"></div>
          
          {/* Card */}
          <div className="relative bg-white/80 dark:bg-[#040404]/80 backdrop-blur-2xl rounded-3xl border border-gray-200 dark:border-[#4790fd]/20 p-6 sm:p-8 shadow-xl dark:shadow-none transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Profile Image */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-gray-100 dark:ring-[#4790fd]/30 shadow-lg shadow-[#4790fd]/20">
                  <img
                    src={user?.imageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#27dc66] rounded-full border-4 border-white dark:border-[#040404] shadow-lg flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                </div>
                {mainUser?.role === "faculty" && (
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-[#ece239]/20 rounded-full border-2 border-[#ece239]/40 flex items-center justify-center backdrop-blur-sm">
                    <Crown className="w-4 h-4 text-[#ece239]" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-[#f5f5f5]">
                    {user?.fullName}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <span className="px-3 py-1.5 bg-[#4790fd]/10 text-[#4790fd] border border-[#4790fd]/20 rounded-full text-sm font-medium">
                    {mainUser?.role
                      ? mainUser.role.slice(0, 1).toUpperCase() +
                        mainUser.role.slice(1)
                      : "Student"}
                  </span>
                  <span className="text-gray-500 dark:text-[#a0a0a0] text-sm flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Member since{" "}
                    {format(new Date(user?.createdAt || Date.now()), "MMM yyyy")}
                  </span>
                </div>
                {mainUser?.profileComplete && (
                  <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-[#27dc66] text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Profile Complete</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="relative group mb-6">
          {/* Gradient blur background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4790fd]/5 to-[#27dc66]/5 rounded-3xl blur-xl opacity-50"></div>
          
          {/* Card */}
          <div className="relative bg-white/80 dark:bg-[#040404]/80 backdrop-blur-2xl rounded-3xl border border-gray-200 dark:border-[#4790fd]/20 p-6 sm:p-8 shadow-xl dark:shadow-none transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-[#4790fd]/10 border border-[#4790fd]/20">
                <Settings className="w-5 h-5 text-[#4790fd]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-[#f5f5f5]">
                Account Settings
              </h2>
            </div>

            <div className="space-y-2">
              <MenuCard 
                icon={UserCog}
                label="Manage Account"
                description="Manage your account settings and preferences"
                onClick={() => navigate("/YourAccount")}
                variant="primary"
              />

              {mainUser?.role !== "faculty" && (
                !mainUser?.profileComplete ? (
                  <MenuCard
                    icon={UserPen}
                    label="Complete Your Profile"
                    description="Add information to complete your profile"
                    onClick={() => navigate("/CompleteYourProfile")}
                    variant="warning"
                    badge="Required"
                  />
                ) : (
                  <MenuCard
                    icon={UserPen}
                    label="Edit Profile"
                    description="Edit your profile information"
                    onClick={() => navigate("/YourProfile")}
                    variant="success"
                  />
                )
              )}

              <MenuCard
                icon={Shield}
                label="Faculty Role Management"
                description="Manage your faculty permissions and settings"
                onClick={() => setIsFacultyModalOpen(true)}
                variant="premium"
              />

              <MenuCard
                icon={Users}
                label="Connection Requests"
                description="Review and manage incoming connection requests"
                onClick={handleClick}
                variant="default"
              />

              <MenuCard
                icon={LifeBuoy}
                label="Help & Support"
                description="Get help and information about the platform"
                onClick={() => navigate('/help-support')}
                variant="warning"
              />

              {/* Theme toggle removed: app is always in dark mode */}
            </div>
          </div>
        </div>

        {/* College Details */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[#27dc66]/8 to-[#4790fd]/8 rounded-3xl blur-xl opacity-60" />
          <div className="relative bg-white/80 dark:bg-[#040404]/80 backdrop-blur-2xl rounded-3xl border border-gray-200 dark:border-white/10 p-6 sm:p-8 shadow-xl dark:shadow-none transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#27dc66]/15 to-[#4790fd]/15 border border-[#27dc66]/20">
                <svg className="w-6 h-6 text-[#27dc66]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-[#f5f5f5]">
                  College Information
                </h2>
                <p className="text-sm text-gray-600 dark:text-[#a0a0a0] mt-1">
                  Contact details and information about our institution
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-[#070707]/50 dark:to-[#070707]/70 border border-gray-200 dark:border-white/10">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#27dc66]" />
                    Institution Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-[#a0a0a0]">Name:</span>
                      <span className="text-gray-900 dark:text-white font-medium">Campus Connect University</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-[#a0a0a0]">Established:</span>
                      <span className="text-gray-900 dark:text-white font-medium">2010</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-[#a0a0a0]">Type:</span>
                      <span className="text-gray-900 dark:text-white font-medium">Private University</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-[#a0a0a0]">Accreditation:</span>
                      <span className="text-gray-900 dark:text-white font-medium">NAAC A+ Grade</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-[#070707]/50 dark:to-[#070707]/70 border border-gray-200 dark:border-white/10">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#4790fd]" />
                    Address
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-900 dark:text-white font-medium">
                      Main Campus:
                    </div>
                    <div className="text-gray-600 dark:text-[#a0a0a0]">
                      123 Education Street, Knowledge Park<br />
                      New Delhi, Delhi 110001<br />
                      India
                    </div>
                    <div className="pt-2">
                      <div className="text-gray-900 dark:text-white font-medium">
                        City Campus:
                      </div>
                      <div className="text-gray-600 dark:text-[#a0a0a0]">
                        456 Academic Avenue, University District<br />
                        New Delhi, Delhi 110002<br />
                        India
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-[#070707]/50 dark:to-[#070707]/70 border border-gray-200 dark:border-white/10">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-[#c76191]" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Phone className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-[#a0a0a0] uppercase tracking-wide">Phone Numbers</p>
                        <p className="text-gray-900 dark:text-white font-medium">+91 11 1234 5678</p>
                        <p className="text-sm text-gray-500 dark:text-[#a0a0a0]">Admissions: +91 11 1234 5679</p>
                        <p className="text-sm text-gray-500 dark:text-[#a0a0a0]">Emergency: +91 11 1234 5680</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-[#a0a0a0] uppercase tracking-wide">Email Addresses</p>
                        <p className="text-gray-900 dark:text-white font-medium">info@campusconnect.edu</p>
                        <p className="text-sm text-gray-500 dark:text-[#a0a0a0]">admissions@campusconnect.edu</p>
                        <p className="text-sm text-gray-500 dark:text-[#a0a0a0]">placement@campusconnect.edu</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-[#070707]/50 dark:to-[#070707]/70 border border-gray-200 dark:border-white/10">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#ece239]" />
                    Online Presence
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-[#a0a0a0]">Website:</span>
                      <a href="https://www.campusconnect.edu" className="text-[#4790fd] hover:underline font-medium">www.campusconnect.edu</a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-[#a0a0a0]">Student Portal:</span>
                      <a href="https://portal.campusconnect.edu" className="text-[#4790fd] hover:underline font-medium">portal.campusconnect.edu</a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-[#a0a0a0]">Library:</span>
                      <a href="https://library.campusconnect.edu" className="text-[#4790fd] hover:underline font-medium">library.campusconnect.edu</a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-[#a0a0a0]">Alumni Network:</span>
                      <a href="https://alumni.campusconnect.edu" className="text-[#4790fd] hover:underline font-medium">alumni.campusconnect.edu</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Campus Gallery */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">Campus Gallery</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 dark:bg-[#070707]/30">
                  <div className="text-center p-2">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-gray-500 dark:text-[#a0a0a0] text-center">Campus View</p>
                  </div>
                </div>
                <div className="aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 dark:bg-[#070707]/30">
                  <div className="text-center p-2">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-gray-500 dark:text-[#a0a0a0] text-center">Library</p>
                  </div>
                </div>
                <div className="aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 dark:bg-[#070707]/30">
                  <div className="text-center p-2">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-gray-500 dark:text-[#a0a0a0] text-center">Auditorium</p>
                  </div>
                </div>
                <div className="aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 dark:bg-[#070707]/30">
                  <div className="text-center p-2">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-gray-500 dark:text-[#a0a0a0] text-center">Sports</p>
                  </div>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-center flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Office Hours
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-[#070707]/50 border border-gray-200 dark:border-white/10">
                  <p className="text-gray-500 dark:text-[#a0a0a0] text-xs uppercase tracking-wide">Monday-Friday</p>
                  <p className="text-gray-900 dark:text-white font-medium">9:00 AM - 5:00 PM</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-[#070707]/50 border border-gray-200 dark:border-white/10">
                  <p className="text-gray-500 dark:text-[#a0a0a0] text-xs uppercase tracking-wide">Saturday</p>
                  <p className="text-gray-900 dark:text-white font-medium">10:00 AM - 2:00 PM</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-[#070707]/50 border border-gray-200 dark:border-white/10">
                  <p className="text-gray-500 dark:text-[#a0a0a0] text-xs uppercase tracking-wide">Sunday</p>
                  <p className="text-gray-900 dark:text-white font-medium">Closed</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-[#070707]/50 border border-gray-200 dark:border-white/10">
                  <p className="text-gray-500 dark:text-[#a0a0a0] text-xs uppercase tracking-wide">Holidays</p>
                  <p className="text-gray-900 dark:text-white font-medium">Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out Section */}
        <div className="relative group mb-6">
          {/* Gradient blur background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#c76191]/10 to-[#c76191]/5 rounded-2xl blur-xl opacity-50"></div>
          
          {/* Card */}
          <div className="relative bg-white/80 dark:bg-[#040404]/80 backdrop-blur-2xl rounded-2xl border border-gray-200 dark:border-[#c76191]/20 p-6 shadow-xl dark:shadow-none transition-all duration-300">
            <SignOutButton redirectUrl="/Signup">
              <button className="w-full group cursor-pointer p-4 rounded-xl bg-gradient-to-r from-[#c76191]/10 to-[#c76191]/5 border border-[#c76191]/20 hover:border-[#c76191]/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <LogOut className="w-5 h-5 text-[#c76191] group-hover:text-[#c76191] transition-colors" />
                  <span className="font-semibold text-[#c76191] group-hover:text-[#c76191] transition-colors">
                    Sign Out
                  </span>
                </div>
              </button>
            </SignOutButton>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4790fd]/5 to-[#27dc66]/5 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative bg-white/60 dark:bg-[#040404]/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#4790fd]/10 p-5 transition-all duration-300">
              <p className="text-gray-500 dark:text-[#a0a0a0] text-sm">
                © {format(new Date(), "yyyy")} Campus Connect
              </p>
              <p className="text-gray-400 dark:text-[#808080] text-xs mt-1">
                Version 1.0.0 • Built with ❤️
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Role Modal */}
      <FacultyRoleModal
        isOpen={isFacultyModalOpen}
        onClose={() => setIsFacultyModalOpen(false)}
      />

      {/* Connection Requests Modal */}
      <ConnectionRequestsModal
        isOpen={modal}
        onClose={() => setShowModal(false)}
        userId={mainUser?._id}
        navigate={navigate}
      />
    </div>
  );
};

export default Account;
