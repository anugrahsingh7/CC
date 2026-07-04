import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { ArrowLeft } from "lucide-react";

const UserProfile = () => {
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const [user2, setUser2] = useState();
  const [screenSize, setScreenSize] = useState("desktop");

  const [editMode, setEditMode] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user2 });
  const [newSkill, setNewSkill] = useState("");
  const [branch, setBranch] = useState("");
  const profilePicInputRef = useRef(null);
  const idCardInputRef = useRef(null);
  const allowedBranchCodes = {
    "027": "Computer Science Engineering",
    "031": "Information Technology",
    119: "Artificial Intelligence and Data Science",
    "049": "Electrical Engineering",
    "028": "Electronics and Communication Engineering",
    157: "Computer Science Engineering in Data Science",
  };
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

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

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${user.id}`
      );
      const data = response.data;
      setUser2(data);
      setBranch(allowedBranchCodes[data.enrollmentNumber.slice(6, 9)]);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Removed toast.error to prevent spam
    }
  };

  const handleInputChange = (field, value) => {
    setTempUser({ ...tempUser, [field]: value });
  };

  const handleSave = async () => {
    try {
      setEditMode(false);

      // Create FormData
      const formData = new FormData();
      formData.append("clerkId", tempUser.clerkId);
      formData.append("enrollmentNumber", tempUser.enrollmentNumber);
      if (tempUser.githubUrl) formData.append("githubUrl", tempUser.githubUrl);
      if (tempUser.linkedinUrl)
        formData.append("linkedinUrl", tempUser.linkedinUrl);
      if (tempUser.personalUrl)
        formData.append("personalUrl", tempUser.personalUrl);
      if (tempUser.collegeIDCard) {
        formData.append("collegeIDCard", tempUser.collegeIDCard);
      }
      if (tempUser.aboutMe) formData.append("aboutMe", tempUser.aboutMe);
      if (tempUser.skills)
        formData.append("skills", JSON.stringify(tempUser.skills));

      // Make API call
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/upload-profile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message
      );
      toast.error("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setTempUser({ ...user });
    setEditMode(false);
  };

  const handleSkillAdd = () => {
    if (newSkill.trim() !== "" && !tempUser.skills.includes(newSkill)) {
      setTempUser({
        ...tempUser,
        skills: [...tempUser.skills, newSkill],
      });
      setNewSkill("");
    }
  };

  const handleSkillRemove = (index) => {
    const updatedSkills = tempUser.skills.filter((_, i) => i !== index);
    setTempUser({ ...tempUser, skills: updatedSkills });
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempUser({
          ...tempUser,
          [field]: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = (ref) => {
    ref.current.click();
  };

  const handleClick = () => {
    setEditMode(true);
    setTempUser({ ...user2, imageUrl: user.imageUrl });
  };

  // Calculate responsive padding based on screen size
  const getResponsivePadding = () => {
    if (screenSize === "mobile") return "px-4 pb-20";
    if (screenSize === "tablet") return "p-8";
    return "p-8";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#000000] text-gray-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      {/* Responsive Header */}
      <div
        className={`fixed top-0 right-0 bg-white/95 dark:bg-[#000000]/95 backdrop-blur-md z-40 border-b border-gray-200 dark:border-gray-500/30 transition-all duration-300 ${
          screenSize === "mobile"
            ? "left-0"
            : screenSize === "tablet"
            ? "left-16"
            : "left-64"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white/80 dark:bg-[#232526]/80 backdrop-blur-sm border border-gray-200 dark:border-gray-500/30 hover:bg-gray-100 dark:hover:bg-[#2d2f30] transition-all duration-200 text-gray-700 dark:text-gray-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          </div>
        </div>
      </div>

      <div className={`pt-20 ${getResponsivePadding()}`}>
        {/* Profile Header Section */}
        <div className="bg-white dark:bg-[#232526] rounded-2xl overflow-hidden mb-6 shadow-xl w-full max-w-full transition-colors duration-300">
          <div className="relative h-48 sm:h-56 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-[#1a1a1a] dark:to-[#2d2f30]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
            <div className="absolute bottom-0 left-0 right-0 px-6 py-6 bg-gradient-to-t from-white dark:from-[#232526] to-transparent">
              <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                    <img
                      src={editMode ? tempUser.imageUrl : user?.imageUrl}
                      alt="Profile"
                      className="w-full h-full rounded-2xl border-4 border-white dark:border-[#2d2f30] object-cover shadow-2xl transition-colors duration-300"
                    />
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-1.5 rounded-full shadow-lg">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                    {editMode && (
                      <button
                        onClick={() => triggerFileInput(profilePicInputRef)}
                        className="absolute -top-3 left-1/2 -translate-x-1/2 p-2 bg-white text-gray-900 dark:text-[#232526] rounded-full shadow-lg hover:bg-gray-100 transition-all duration-200 group"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap transition-opacity duration-200">
                          Change Photo
                        </span>
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={profilePicInputRef}
                    onChange={(e) => handleImageUpload(e, "imageUrl")}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="flex-1 text-gray-900 dark:text-white">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {user?.fullName}
                    </h2>
                    <span className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-[#2d2f30] text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-500/30 w-fit transition-colors duration-300">
                      {user2?.role?.slice(0, 1).toUpperCase() +
                        user2?.role?.slice(1).toLowerCase() || "Student"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <p className="text-blue-600 dark:text-blue-300 font-medium">{branch}</p>
                    <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {user2?.status ? "Verified Account" : "Not Verified"}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {!editMode ? (
                    <button
                      onClick={handleClick}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-200 dark:bg-[#2d2f30] hover:bg-gray-300 dark:hover:bg-[#3a3c3d] text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-200"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* ID Card Section */}
            <div className="bg-white dark:bg-[#232526] rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-500/20 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
                University ID Card
              </h3>
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-500/30 transition-colors duration-300">
                <img
                  src={editMode ? tempUser.collegeIDCard : user2?.collegeIDCard}
                  alt="College ID"
                  className="w-full h-full object-cover"
                />
                {editMode && (
                  <>
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center group hover:bg-black/80 transition-all duration-200">
                      <button
                        onClick={() => triggerFileInput(idCardInputRef)}
                        className="p-3 bg-white/90 rounded-full transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200"
                      >
                        <svg
                          className="w-6 h-6 text-gray-900"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={idCardInputRef}
                      onChange={(e) => handleImageUpload(e, "collegeIdPhoto")}
                      accept="image/*"
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Social Links Section */}
            <div className="bg-white dark:bg-[#232526] rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-500/20 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Social Profiles
              </h3>
              <div className="space-y-4">
                {/* GitHub */}
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">
                    GitHub
                  </label>
                  {editMode ? (
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <input
                        type="url"
                        value={tempUser.githubUrl || ""}
                        onChange={(e) =>
                          handleInputChange("githubUrl", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 transition-colors duration-300"
                        placeholder="GitHub URL"
                      />
                    </div>
                  ) : (
                    <a
                      href={user2?.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-500/30 hover:bg-gray-100 dark:hover:bg-[#2d2f30] transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="truncate">
                        {user2?.githubUrl || "Not added yet"}
                      </span>
                    </a>
                  )}
                </div>

                {/* Personal URL */}
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">
                    Personal URL
                  </label>
                  {editMode ? (
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </span>
                      <input
                        type="url"
                        value={tempUser.personalUrl || ""}
                        onChange={(e) =>
                          handleInputChange("personalUrl", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 transition-colors duration-300"
                        placeholder="Personal portfolio URL"
                      />
                    </div>
                  ) : (
                    <a
                      href={user2?.personalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-500/30 hover:bg-gray-100 dark:hover:bg-[#2d2f30] transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className="truncate">
                        {user2?.personalUrl || "Not added yet"}
                      </span>
                    </a>
                  )}
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">
                    LinkedIn
                  </label>
                  {editMode ? (
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </span>
                      <input
                        type="url"
                        value={tempUser.linkedinUrl || ""}
                        onChange={(e) =>
                          handleInputChange("linkedinUrl", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 transition-colors duration-300"
                        placeholder="LinkedIn URL"
                      />
                    </div>
                  ) : (
                    <a
                      href={user2?.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-500/30 hover:bg-gray-100 dark:hover:bg-[#2d2f30] transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      <span className="truncate">
                        {user2?.linkedinUrl || "Not added yet"}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-[#232526] rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-500/20 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">
                    Email Address
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-500/30 transition-colors duration-300">
                    <p className="text-gray-900 dark:text-white">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">
                    Enrollment Number
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={tempUser.enrollmentNumber || ""}
                      onChange={(e) =>
                        handleInputChange("enrollmentNumber", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-colors duration-300"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-500/30 transition-colors duration-300">
                      <p className="text-gray-900 dark:text-white">{user2?.enrollmentNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white dark:bg-[#232526] rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-500/20 transition-colors duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Technical Skills
                </h3>
                {editMode && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {tempUser?.skills?.length || 0} skills added
                  </span>
                )}
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {tempUser?.skills?.map((skill, index) => (
                      <div
                        key={index}
                        className="group flex items-center bg-blue-50 dark:bg-gradient-to-r dark:from-blue-600/20 dark:to-purple-600/20 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-500/30"
                      >
                        <span className="text-sm font-medium">{skill}</span>
                        <button
                          onClick={() => handleSkillRemove(index)}
                          className="ml-2 text-blue-400 hover:text-red-400 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSkillAdd()}
                      placeholder="Type a skill and press Enter"
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-500/30 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 transition-colors duration-300"
                    />
                    <button
                      onClick={handleSkillAdd}
                      className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-r-lg transition-all duration-200"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user2?.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-200 dark:border-gray-600"
                    >
                      {skill}
                    </span>
                  ))}
                  {(!user2?.skills || user2?.skills?.length === 0) && (
                    <p className="text-gray-500 dark:text-gray-400 italic">No skills added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* About Me Section */}
            <div className="bg-white dark:bg-[#232526] rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-500/20 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                About Me
              </h3>
              {editMode ? (
                <textarea
                  value={tempUser.aboutMe || ""}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    const wordCount = inputValue.trim() ? inputValue.trim().split(/\s+/).length : 0;
                    if (wordCount <= 10) {
                      handleInputChange("aboutMe", inputValue);
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 min-h-[150px] resize-none transition-colors duration-300"
                  placeholder="Tell us about yourself... (max 10 words)"
                />
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-500/30 min-h-[150px] transition-colors duration-300">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {user2?.aboutMe ? user2.aboutMe.split(' ').slice(0, 10).join(' ') + (user2.aboutMe.split(' ').length > 10 ? '...' : '') : "No description added yet"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;