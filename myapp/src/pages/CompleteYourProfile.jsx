import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import {
  X,
  UploadCloud,
  ArrowLeft,
  Github,
  Linkedin,
  BookOpen,
  Building,
  GraduationCap,
  User,
  Mail,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CompleteYourProfile = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [skillsInput, setSkillsInput] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [personalUrl, setPersonalUrl] = useState("");
  const [skills, setSkills] = useState([]);
  const [aboutMe, setAboutMe] = useState("");
  const [idCardPhoto, setIdCardPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(false);

  const allowedBranchCodes = {
    "027": "Computer Science Engineering",
    "031": "Information Technology",
    119: "Artificial Intelligence and Data Science",
    "049": "Electrical Engineering",
    "028": "Electronics and Communication Engineering",
    157: "Computer Science Engineering in Data Science",
  };

  const VALID_COLLEGE_CODE = "208";
  const COLLEGE_NAME = "Bhagwan Parshuram Institute of Technology";

  const handleEnrollmentChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setEnrollmentNumber(value);
      if (value.length === 11) {
        const college = value.substring(3, 6);
        const branch = value.substring(6, 9);

        if (college !== VALID_COLLEGE_CODE) {
          toast.error("Your college is not registered.");
          resetFields();
          return;
        }

        if (!allowedBranchCodes[branch]) {
          toast.error("Invalid branch code.");
          resetFields();
          return;
        }
      }
    }
  };

  const resetFields = () => {
    setEnrollmentNumber("");
  };

  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${user.id}`,
      );
      const data = response.data;
      setEnrollmentNumber(data.enrollmentNumber || "");
      setGithubUrl(data.githubUrl || "");
      setLinkedinUrl(data.linkedinUrl || "");
      setPersonalUrl(data.personalUrl || "");
      setSkills(data.skills || []);
      setAboutMe(data.aboutMe || "");
      if (data.collegeIDCard) {
        setIdCardPhoto(data.collegeIDCard);
      }
      setStatus(data.status);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Removed toast.error to prevent spam
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPG, JPEG, and PNG files are allowed.");
        return;
      }
      setIdCardPhoto(file);
    }
  };

  const removeImage = () => {
    setIdCardPhoto(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("clerkId", user?.id);
      if (enrollmentNumber)
        formData.append("enrollmentNumber", enrollmentNumber);

      if (githubUrl) formData.append("githubUrl", githubUrl);
      if (linkedinUrl) formData.append("linkedinUrl", linkedinUrl);
      if (personalUrl) formData.append("personalUrl", personalUrl);
      if (aboutMe) formData.append("aboutMe", aboutMe);
      if (skills.length) formData.append("skills", JSON.stringify(skills));
      if (idCardPhoto && typeof idCardPhoto !== "string")
        formData.append("idCardPhoto", idCardPhoto);

      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/upload-profile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success("Profile updated successfully!");

      // Navigate to home after profile update
      navigate("/");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = () => {
    let completed = 0;
    let total = 5;

    if (enrollmentNumber) completed++;
    if (githubUrl) completed++;
    if (linkedinUrl) completed++;
    if (skills.length > 0) completed++;
    if (idCardPhoto) completed++;

    return Math.round((completed / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070707] py-6 px-3 sm:py-8 sm:px-4 md:px-6 relative overflow-hidden transition-colors duration-300">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4790fd]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#c76191]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ece239]/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-white/80 dark:bg-[#040404]/80 backdrop-blur-xl border border-gray-200 dark:border-[#4790fd]/20 hover:border-[#4790fd]/50 dark:hover:border-[#4790fd]/30 transition-all duration-300 text-gray-700 dark:text-[#4790fd] shadow-sm dark:shadow-none"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-gray-200 dark:ring-[#4790fd]/30 shadow-lg shadow-gray-200/50 dark:shadow-[#4790fd]/20">
                  <img
                    src={user?.imageUrl}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#27dc66] rounded-full border-2 border-white dark:border-[#040404]"></div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-[#f5f5f5]">
                  Complete Your Profile
                </h1>
                <p className="text-sm text-gray-500 dark:text-[#a0a0a0]">
                  Set up your professional profile
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="relative group">
          {/* Gradient blur background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4790fd]/10 via-[#c76191]/5 to-[#27dc66]/10 rounded-3xl blur-xl opacity-50"></div>

          {/* Card */}
          <div className="relative bg-white/80 dark:bg-[#040404]/80 backdrop-blur-2xl rounded-3xl border border-gray-200 dark:border-[#4790fd]/20 shadow-xl overflow-hidden transition-colors duration-300">
            {/* Progress Bar */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-[#4790fd]/10 bg-gray-50/50 dark:bg-[#070707]/50">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-[#f5f5f5]">
                  Profile Completion
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#4790fd]">
                    {calculateProgress()}%
                  </span>
                  {calculateProgress() === 100 && (
                    <CheckCircle className="w-5 h-5 text-[#27dc66]" />
                  )}
                </div>
              </div>
              <div className="h-2.5 bg-gray-200 dark:bg-[#070707] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4790fd] via-[#c76191] to-[#27dc66] transition-all duration-700 ease-out shadow-lg"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-[#4790fd]/10 border border-[#4790fd]/20">
                            <User className="w-5 h-5 text-[#4790fd]" />
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f5f5f5]">
                            Personal Information
                          </h2>
                        </div>
                        <span className="px-2.5 py-1 bg-[#ece239]/10 text-[#ece239] text-xs font-medium rounded-full border border-[#ece239]/20">
                          Required
                        </span>
                      </div>

                      {/* Name and Email Card */}
                      <div className="bg-gray-50 dark:bg-[#070707]/50 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#4790fd]/10 p-5 transition-colors duration-300">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#4790fd]/10 rounded-lg">
                              <User className="w-4 h-4 text-[#4790fd]" />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-medium text-gray-500 dark:text-[#a0a0a0]">
                                Full Name
                              </label>
                              <p className="text-sm font-medium text-gray-900 dark:text-[#f5f5f5] mt-1">
                                {user?.fullName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#27dc66]/10 rounded-lg">
                              <Mail className="w-4 h-4 text-[#27dc66]" />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-medium text-gray-500 dark:text-[#a0a0a0]">
                                Email Address
                              </label>
                              <p className="text-sm font-medium text-gray-900 dark:text-[#f5f5f5] mt-1 break-all">
                                {user?.primaryEmailAddress?.emailAddress}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enrollment Section */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#f5f5f5]">
                          Enrollment Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            disabled={status}
                            value={enrollmentNumber}
                            required
                            onChange={(e) => {
                              if (e.target.value.length <= 11) {
                                handleEnrollmentChange(e);
                              }
                            }}
                            className={`w-full px-4 py-3 text-sm border rounded-xl bg-gray-50 dark:bg-[#070707]/50 backdrop-blur-xl border-gray-200 dark:border-[#4790fd]/20 focus:ring-2 focus:ring-[#4790fd]/50 focus:border-[#4790fd] transition-all duration-300 text-gray-900 dark:text-[#f5f5f5] placeholder-gray-400 dark:placeholder-[#a0a0a0] ${
                              status
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:border-[#4790fd]/30"
                            }`}
                            placeholder="Enter your 11-digit enrollment number"
                          />
                          {enrollmentNumber && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#27dc66] shadow-lg shadow-[#27dc66]/50"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {enrollmentNumber && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-gray-50 dark:bg-[#070707]/50 backdrop-blur-xl p-4 rounded-xl border border-gray-200 dark:border-[#4790fd]/10 hover:border-[#4790fd]/30 dark:hover:border-[#4790fd]/20 transition-colors">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-[#a0a0a0] mb-2">
                              <BookOpen size={14} />
                              <span className="text-xs font-medium">
                                Roll Number
                              </span>
                            </div>
                            <p className="text-base font-semibold text-gray-900 dark:text-[#f5f5f5]">
                              {enrollmentNumber.substring(0, 3)}
                            </p>
                          </div>

                          <div className="bg-gray-50 dark:bg-[#070707]/50 backdrop-blur-xl p-4 rounded-xl border border-gray-200 dark:border-[#27dc66]/10 hover:border-[#27dc66]/30 dark:hover:border-[#27dc66]/20 transition-colors">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-[#a0a0a0] mb-2">
                              <Building size={14} />
                              <span className="text-xs font-medium">
                                Batch Year
                              </span>
                            </div>
                            <p className="text-base font-semibold text-gray-900 dark:text-[#f5f5f5]">
                              {"20" + enrollmentNumber.substring(9, 11)}
                            </p>
                          </div>

                          <div className="col-span-1 sm:col-span-2 bg-gray-50 dark:bg-[#070707]/50 backdrop-blur-xl p-4 rounded-xl border border-gray-200 dark:border-[#c76191]/10 hover:border-[#c76191]/30 dark:hover:border-[#c76191]/20 transition-colors">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-[#a0a0a0] mb-2">
                              <GraduationCap size={14} />
                              <span className="text-xs font-medium">
                                Branch
                              </span>
                            </div>
                            <p className="text-base font-semibold text-gray-900 dark:text-[#f5f5f5]">
                              {allowedBranchCodes[
                                enrollmentNumber.substring(6, 9)
                              ] || ""}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#c76191]/10 border border-[#c76191]/20">
                          <Linkedin className="w-5 h-5 text-[#c76191]" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f5f5f5]">
                          Social Presence
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <LinkIcon className="w-5 h-5 text-gray-400 dark:text-[#a0a0a0]" />
                          </div>
                          <input
                            type="url"
                            disabled={status}
                            value={personalUrl}
                            onChange={(e) => setPersonalUrl(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 text-sm border rounded-xl bg-gray-50 dark:bg-[#070707]/50 backdrop-blur-xl border-gray-200 dark:border-[#4790fd]/20 focus:ring-2 focus:ring-[#4790fd]/50 focus:border-[#4790fd] transition-all duration-300 hover:border-[#4790fd]/30 text-gray-900 dark:text-[#f5f5f5] placeholder-gray-400 dark:placeholder-[#a0a0a0]"
                            placeholder="Your personal portfolio URL"
                          />
                        </div>

                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Github className="w-5 h-5 text-gray-400 dark:text-[#a0a0a0]" />
                          </div>
                          <input
                            type="url"
                            disabled={status}
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 text-sm border rounded-xl bg-gray-50 dark:bg-[#070707]/50 backdrop-blur-xl border-gray-200 dark:border-[#4790fd]/20 focus:ring-2 focus:ring-[#4790fd]/50 focus:border-[#4790fd] transition-all duration-300 hover:border-[#4790fd]/30 text-gray-900 dark:text-[#f5f5f5] placeholder-gray-400 dark:placeholder-[#a0a0a0]"
                            placeholder="Your GitHub profile URL"
                          />
                        </div>

                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Linkedin className="w-5 h-5 text-gray-400 dark:text-[#a0a0a0]" />
                          </div>
                          <input
                            type="url"
                            disabled={status}
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 text-sm border rounded-xl bg-gray-50 dark:bg-[#070707]/50 backdrop-blur-xl border-gray-200 dark:border-[#4790fd]/20 focus:ring-2 focus:ring-[#4790fd]/50 focus:border-[#4790fd] transition-all duration-300 hover:border-[#4790fd]/30 text-gray-900 dark:text-[#f5f5f5] placeholder-gray-400 dark:placeholder-[#a0a0a0]"
                            placeholder="Your LinkedIn profile URL"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Skills Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-[#ece239]/10 border border-[#ece239]/20">
                            <BookOpen className="w-5 h-5 text-[#ece239]" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f5f5f5]">
                            Skills & Expertise
                          </h3>
                        </div>
                        <span className="px-2.5 py-1 bg-[#4790fd]/10 text-[#4790fd] text-xs font-medium rounded-full border border-[#4790fd]/20">
                          {skills.length} Added
                        </span>
                      </div>

                      <div className="bg-gray-50 dark:bg-[#070707]/50 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#4790fd]/10 p-5 transition-colors duration-300">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {skills.map((skill, index) => (
                            <span
                              key={index}
                              className="group flex items-center bg-[#4790fd]/10 px-3 py-1.5 rounded-lg border border-[#4790fd]/20 hover:border-[#4790fd]/30 transition-all"
                            >
                              <span className="text-xs font-medium text-gray-900 dark:text-[#f5f5f5]">
                                {skill}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setSkills(skills.filter((s) => s !== skill))
                                }
                                className="ml-2 text-gray-400 dark:text-[#a0a0a0] hover:text-[#c76191] transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>

                        <div className="flex">
                          <input
                            type="text"
                            value={skillsInput}
                            onChange={(e) => setSkillsInput(e.target.value)}
                            className="flex-1 px-4 py-2.5 text-sm border rounded-l-xl bg-gray-50 dark:bg-[#070707]/50 backdrop-blur-xl border-gray-200 dark:border-[#4790fd]/20 focus:ring-2 focus:ring-[#4790fd]/50 focus:border-[#4790fd] transition-all text-gray-900 dark:text-[#f5f5f5] placeholder-gray-400 dark:placeholder-[#a0a0a0]"
                            placeholder="Type a skill and press Add"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                skillsInput.trim() &&
                                !skills.includes(
                                  skillsInput.trim().toLowerCase(),
                                )
                              ) {
                                setSkills([
                                  ...skills,
                                  skillsInput.trim().toLowerCase(),
                                ]);
                                setSkillsInput("");
                              }
                            }}
                            className="px-5 py-2.5 text-sm bg-gradient-to-r from-[#4790fd] to-[#4790fd]/80 text-white rounded-r-xl hover:from-[#4790fd]/90 hover:to-[#4790fd]/70 transition-all duration-300 font-medium"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* About Me Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#27dc66]/10 border border-[#27dc66]/20">
                          <User className="w-5 h-5 text-[#27dc66]" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f5f5f5]">
                          About Me
                        </h3>
                      </div>
                      <div className="relative">
                        <textarea
                          value={aboutMe}
                          disabled={status}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            const wordCount = inputValue.trim()
                              ? inputValue.trim().split(/\s+/).length
                              : 0;
                            if (wordCount <= 10) {
                              setAboutMe(inputValue);
                            }
                          }}
                          className="w-full px-4 py-3 text-sm border rounded-xl bg-gray-50 dark:bg-[#070707]/50 backdrop-blur-xl border-gray-200 dark:border-[#4790fd]/20 focus:ring-2 focus:ring-[#4790fd]/50 focus:border-[#4790fd] transition-all duration-300 h-32 resize-none text-gray-900 dark:text-[#f5f5f5] placeholder-gray-400 dark:placeholder-[#a0a0a0]"
                          placeholder="Share your story, interests, and what drives you... (max 10 words)"
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-[#a0a0a0]">
                          {aboutMe.trim()
                            ? aboutMe.trim().split(/\s+/).length
                            : 0}
                          /10 words
                        </div>
                      </div>
                    </div>

                    {/* ID Card Upload */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#c76191]/10 border border-[#c76191]/20">
                          <AlertCircle className="w-5 h-5 text-[#c76191]" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f5f5f5]">
                          College ID Card
                        </h3>
                      </div>
                      <div className="relative group">
                        <div className="relative w-full aspect-[16/10] rounded-xl bg-gray-50 dark:bg-[#070707]/50 backdrop-blur-xl border-2 border-dashed border-gray-200 dark:border-[#4790fd]/20 hover:border-[#4790fd]/30 transition-all duration-300 overflow-hidden">
                          <input
                            type="file"
                            accept="image/*"
                            required={!idCardPhoto}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={handleFileChange}
                          />
                          {idCardPhoto ? (
                            <div className="relative w-full h-full">
                              <img
                                src={
                                  typeof idCardPhoto === "string"
                                    ? idCardPhoto
                                    : URL.createObjectURL(idCardPhoto)
                                }
                                alt="ID Card"
                                className="w-full h-full object-contain"
                              />
                              <button
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-[#040404]/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-[#c76191] hover:text-white transition-all duration-300"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-[#a0a0a0] hover:text-[#4790fd] transition-colors duration-300 p-4">
                              <UploadCloud size={40} />
                              <p className="mt-3 text-sm font-medium text-center">
                                Click or drag to upload your ID card
                              </p>
                              <p className="text-xs text-gray-500 dark:text-[#808080] mt-1 text-center">
                                Supported formats: JPG, PNG
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="px-6 py-5 border-t border-gray-100 dark:border-[#4790fd]/10 bg-gray-50/50 dark:bg-[#070707]/50">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative px-8 py-3.5 text-sm bg-gradient-to-r from-[#4790fd] to-[#c76191] text-white rounded-xl hover:from-[#4790fd]/90 hover:to-[#c76191]/90 transition-all duration-300 font-medium shadow-lg hover:shadow-[#4790fd]/25 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Profile</span>
                          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        theme={isDarkMode ? "dark" : "light"}
        className="toast-container"
      />
    </div>
  );
};

export default CompleteYourProfile;
