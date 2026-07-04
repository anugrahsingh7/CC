import { useEffect, useState } from "react";
import React from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import { showToast } from "../components/CustomToast"; // Component not found
import { FiEdit } from "react-icons/fi";
import {
  Upload,
  X,
  Camera,
  Building2,
  GraduationCap,
  UserCheck,
  Shield,
} from "lucide-react";

function FacultyRole() {
  const [collegeId, setCollegeId] = useState("");
  const [idCardPhoto, setidCardPhoto] = useState(null);
  const [designation, setDesignation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  const handleEditClick = () => {
    document.getElementById("idCardInput").click();
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${user.id}`
      );
      const data = response.data;
      setCollegeId(data?.collegeId);
      setDesignation(data?.designation);
      setidCardPhoto(data?.collegeIDCard);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const designations = ["Principal", "HOD", "Dean", "Teacher", "Faculty"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("clerkId", user.id);
      formData.append("collegeId", collegeId);
      formData.append("designation", designation);
      
      // Grant faculty role if specific ID is used
      if (collegeId === "12345678") {
        formData.append("role", "faculty");
      }

      if (idCardPhoto) {
        formData.append("idCardPhoto", idCardPhoto);
      }

      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/upload-profile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Authority registration completed successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to complete registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setidCardPhoto(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Header */}

      {/* Main Content */}
      <div className="pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full border border-blue-500/30 mb-4">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">
                Authority Verification
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Complete Your Faculty Profile
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Verify your identity and establish your authority within the
              campus community
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-[#111111] rounded-2xl p-6 border border-gray-500/20 sticky top-24">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <img
                      src={user?.imageUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-2xl border-2 border-blue-500/50 object-cover shadow-2xl"
                    />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-4">
                    {user?.fullName}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-xl border border-gray-500/20">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <Building2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">College ID</p>
                      <p className="text-sm font-medium text-white">
                        {collegeId || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-xl border border-gray-500/20">
                    <div className="p-2 bg-indigo-600/20 rounded-lg">
                      <GraduationCap className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Designation</p>
                      <p className="text-sm font-medium text-white">
                        {designation || "Not selected"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-[#111111] rounded-2xl border border-gray-500/20 overflow-hidden">
                <div className="p-6 border-b border-gray-500/20">
                  <h3 className="text-xl font-semibold text-white">
                    Registration Details
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Fill in your faculty information below
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* College ID Input */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      College ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={collegeId}
                        onChange={(e) => setCollegeId(e.target.value)}
                        placeholder="Enter your College ID"
                        className="w-full px-4 py-4 bg-[#1a1a1a] border border-gray-500/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* ID Card Upload */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-blue-400" />
                      College ID Card
                    </label>
                    <div className="relative group">
                      <div className="relative border-2 border-dashed border-gray-500/40 rounded-xl p-6 transition-all duration-200 hover:border-blue-500/50 bg-[#1a1a1a] hover:bg-[#1f1f1f]">
                        {idCardPhoto && typeof idCardPhoto === "string" ? (
                          <div className="relative aspect-video rounded-lg overflow-hidden">
                            <img
                              src={idCardPhoto}
                              alt="ID Card"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                document.getElementById("idCardInput").click()
                              }
                              className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-black/90 rounded-full text-white backdrop-blur-sm transition-all duration-200"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8">
                            <div className="p-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full mb-4">
                              <Upload className="w-8 h-8 text-blue-400" />
                            </div>
                            <p className="text-sm text-gray-300 text-center">
                              <span className="text-blue-400 hover:text-blue-300 cursor-pointer font-medium">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              PNG, JPG up to 2MB
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          id="idCardInput"
                          onChange={handleImageChange}
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Designation Select */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                      Designation
                    </label>
                    <div className="relative">
                      <select
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full px-4 py-4 bg-[#1a1a1a] border border-gray-500/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white appearance-none pr-10 transition-all duration-200"
                        required
                      >
                        <option value="" className="bg-[#1a1a1a] text-gray-400">
                          Select your designation
                        </option>
                        {designations.map((item) => (
                          <option
                            key={item}
                            value={item.toLowerCase()}
                            className="bg-[#1a1a1a] text-white"
                          >
                            {item}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            d="M7 7l3 3 3-3"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 group"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Complete Registration</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyRole;
