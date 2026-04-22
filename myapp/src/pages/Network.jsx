// Network.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import PostCard from "../components/PostCard";
import axios from "axios";
import { format, parseISO } from "date-fns";
import ProjectCard from "../components/ProjectCard";
// import { showToast } from "../components/CustomToast"; // Component not found
import { useTheme } from "../context/ThemeContext";
import {
  Grid,
  Briefcase,
  Sparkles,
  Filter,
  RefreshCw,
  Plus,
  Search,
  Clock,
  TrendingUp,
  Calendar,
  X,
  Building,
  GraduationCap,
  Shield,
  School,
  User,
} from "lucide-react";

const Network = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const isLightMode = !isDarkMode; // Adapt existing logic to use context
  const [posts, setPost] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("recent"); // recent, popular, oldest
  const [searchQuery, setSearchQuery] = useState("");

  const [userProfile, setUserProfile] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    domain: "",
    branch: "",
    batch: "",
    skill: "",
    role: "",
    college: "",
  });

  const BRANCH_CODES = {
    "027": "CSE",
    "031": "IT",
    119: "AI-DS",
    "049": "EEE",
    "028": "ECE",
    157: "CSE-DS",
  };

  const DOMAIN_MAPPING = {
    "B.Tech": ["027", "031", "119", "049", "028", "157"],
    MBA: [], // Add MBA branch codes if available
    BBA: [], // Add BBA branch codes if available
    BCA: [], // Add BCA branch codes if available
  };

  const COLLEGE_CODES = {
    208: "Bhagwan Parshuram Institute of Technology",
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${user.id}`,
      );
      setUserProfile(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const getBranchFromEnrollment = (enrollment) => {
    if (!enrollment || enrollment.length !== 11) return null;
    return enrollment.substring(6, 9);
  };

  const getBatchFromEnrollment = (enrollment) => {
    if (!enrollment || enrollment.length !== 11) return null;
    return enrollment.substring(9, 11);
  };

  const filterPosts = (postsToFilter) => {
    let filtered = [...postsToFilter];

    if (selectedFilters.domain) {
      filtered = filtered.filter((post) => {
        const authorBranch = getBranchFromEnrollment(
          post.author?.enrollmentNumber,
        );
        const validBranches = DOMAIN_MAPPING[selectedFilters.domain] || [];
        return validBranches.includes(authorBranch);
      });
    }

    if (selectedFilters.role) {
      filtered = filtered.filter((post) => {
        const role = post.author?.role || "student";
        return role.toLowerCase() === selectedFilters.role.toLowerCase();
      });
    }

    if (selectedFilters.college) {
      filtered = filtered.filter((post) => {
        const enrollment = post.author?.enrollmentNumber;
        if (enrollment && enrollment.length === 11) {
          const collegeCode = enrollment.substring(3, 6);
          return collegeCode === selectedFilters.college;
        }
        if (post.author?.collegeId) {
          return post.author.collegeId === selectedFilters.college;
        }
        return false;
      });
    }

    if (selectedFilters.branch) {
      filtered = filtered.filter((post) => {
        const authorBranch = getBranchFromEnrollment(
          post.author?.enrollmentNumber,
        );
        return authorBranch === selectedFilters.branch;
      });
    }

    if (selectedFilters.batch) {
      filtered = filtered.filter((post) => {
        const authorBatch = getBatchFromEnrollment(
          post.author?.enrollmentNumber,
        );
        return authorBatch === selectedFilters.batch;
      });
    }

    if (selectedFilters.skill) {
      filtered = filtered.filter((post) => {
        const authorSkills = post.author?.skills || [];
        return authorSkills.some((skill) =>
          skill.toLowerCase().includes(selectedFilters.skill.toLowerCase()),
        );
      });
    }

    return filtered;
  };

  const displayedPosts = filterPosts(posts);

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const fetchPosts = async (pageNum) => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/post/getAll-post?page=${pageNum}`,
      );
      const newPost = res.data.post;
      if (newPost.length === 0) {
        setHasMore(false);
        return;
      }

      setPost((prev) => [...prev, ...newPost]);
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching notices:", err);
      toast.error("Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/project/get-projects`,
      );
      const data = res.data;
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      toast.error("Error fetching projects");
    }
  };

  return (
    <div
      className={`min-h-screen py-4 px-2 sm:py-6 sm:px-3 md:py-8 md:px-4 relative overflow-hidden transition-colors duration-300 ${
        isLightMode ? "bg-[#f5f5f5]" : "bg-[#070707]"
      }`}
    >
      {/* Subtle background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl ${
            isLightMode ? "bg-[#ece239]/10" : "bg-[#ece239]/5"
          }`}
        ></div>
        <div
          className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl ${
            isLightMode ? "bg-[#c76191]/10" : "bg-[#c76191]/5"
          }`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl ${
            isLightMode ? "bg-[#27dc66]/5" : "bg-[#27dc66]/3"
          }`}
        ></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* New Functional Header */}
        <div className="mb-6">
          {/* Main Toolbar */}
          <div
            className={`rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
              isLightMode
                ? "bg-white/90 border-[#e0e0e0] shadow-lg"
                : "bg-[#040404]/90 border-[#1a1a1a] shadow-xl"
            }`}
          >
            <div className="p-4 sm:p-5">
              {/* Top Row: Title & Quick Actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      isLightMode
                        ? "bg-[#ece239]/10"
                        : "bg-[#ece239]/10 border border-[#ece239]/20"
                    }`}
                  >
                    <Sparkles
                      className={`w-5 h-5 ${
                        isLightMode ? "text-[#ece239]" : "text-[#ece239]"
                      }`}
                    />
                  </div>
                  <div>
                    <h1
                      className={`text-xl sm:text-2xl font-bold ${
                        isLightMode ? "text-[#070707]" : "text-[#f5f5f5]"
                      }`}
                    >
                     Your Campus Feed
                    </h1>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (activeTab === "posts") {
                        fetchPosts(1);
                        setPost([]);
                        setPage(1);
                        setHasMore(true);
                      } else {
                        fetchProjects();
                      }
                    }}
                    className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
                      isLightMode
                        ? "bg-[#ece239] text-[#070707] hover:bg-[#ece239]/90"
                        : "bg-[#ece239] text-[#070707] hover:bg-[#ece239]/90"
                    }`}
                    title="Refresh"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                  </button>
                  
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"
                  }`}
                />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border transition-all duration-300 ${
                    isLightMode
                      ? "bg-[#f8f8f8] border-[#e0e0e0] text-[#070707] placeholder-[#4a4a4a] focus:border-[#ece239]"
                      : "bg-[#0a0a0a] border-[#1a1a1a] text-[#f5f5f5] placeholder-[#a0a0a0] focus:border-[#ece239]"
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-[#ece239]/10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Tab Switcher & Filter */}
              <div className="flex items-center gap-3">
                {/* Tab Switcher */}
                <div
                  className={`flex-1 flex items-center gap-2 rounded-xl p-1 border ${
                    isLightMode
                      ? "bg-[#f8f8f8] border-[#e0e0e0]"
                      : "bg-[#0a0a0a] border-[#1a1a1a]"
                  }`}
                >
                  <button
                    onClick={() => setActiveTab("posts")}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                      activeTab === "posts"
                        ? isLightMode
                          ? "bg-[#ece239] text-[#070707] shadow-md"
                          : "bg-[#ece239] text-[#070707] shadow-md"
                        : isLightMode
                          ? "text-[#4a4a4a] hover:text-[#070707]"
                          : "text-[#a0a0a0] hover:text-[#f5f5f5]"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    <span>Posts</span>
                    {activeTab === "posts" && (
                      <span className="ml-1 px-1.5 py-0.5 bg-[#070707]/20 rounded-full text-xs font-bold">
                        {posts.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("projects")}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                      activeTab === "projects"
                        ? isLightMode
                          ? "bg-[#27dc66] text-white shadow-md"
                          : "bg-[#27dc66] text-white shadow-md"
                        : isLightMode
                          ? "text-[#4a4a4a] hover:text-[#070707]"
                          : "text-[#a0a0a0] hover:text-[#f5f5f5]"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Projects</span>
                    {activeTab === "projects" && (
                      <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                        {projects?.length || 0}
                      </span>
                    )}
                  </button>
                </div>

                {/* Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-xl border font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                    showFilters
                      ? isLightMode
                        ? "bg-[#ece239] text-[#070707] border-[#ece239]"
                        : "bg-[#ece239] text-[#070707] border-[#ece239]"
                      : isLightMode
                        ? "bg-[#f8f8f8] text-[#070707] border-[#e0e0e0] hover:border-[#ece239]"
                        : "bg-[#0a0a0a] text-[#f5f5f5] border-[#1a1a1a] hover:border-[#ece239]"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div
                  className={`mt-4 p-4 rounded-xl border ${
                    isLightMode
                      ? "bg-[#f8f8f8] border-[#e0e0e0]"
                      : "bg-[#0a0a0a] border-[#1a1a1a]"
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    {/* Filter Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4 border-b border-gray-700/10">
                      {/* Domain Filter */}
                      <div className="space-y-1.5">
                        <label
                          className={`text-xs font-medium ${isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"}`}
                        >
                          Domain
                        </label>
                        <div className="relative">
                          <School
                            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"}`}
                          />
                          <select
                            value={selectedFilters.domain}
                            onChange={(e) =>
                              setSelectedFilters((prev) => ({
                                ...prev,
                                domain: e.target.value,
                              }))
                            }
                            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm appearance-none outline-none transition-all duration-300 ${
                              isLightMode
                                ? "bg-white border-[#e0e0e0] text-[#070707] focus:border-[#ece239]"
                                : "bg-[#040404] border-[#1a1a1a] text-[#f5f5f5] focus:border-[#ece239]"
                            }`}
                          >
                            <option value="">All Domains</option>
                            {Object.keys(DOMAIN_MAPPING).map((domain) => (
                              <option key={domain} value={domain}>
                                {domain}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Branch Filter */}
                      <div className="space-y-1.5">
                        <label
                          className={`text-xs font-medium ${isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"}`}
                        >
                          Branch
                        </label>
                        <div className="relative">
                          <Building
                            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"}`}
                          />
                          <select
                            value={selectedFilters.branch}
                            onChange={(e) =>
                              setSelectedFilters((prev) => ({
                                ...prev,
                                branch: e.target.value,
                              }))
                            }
                            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm appearance-none outline-none transition-all duration-300 ${
                              isLightMode
                                ? "bg-white border-[#e0e0e0] text-[#070707] focus:border-[#ece239]"
                                : "bg-[#040404] border-[#1a1a1a] text-[#f5f5f5] focus:border-[#ece239]"
                            }`}
                          >
                            <option value="">All Branches</option>
                            {Object.entries(BRANCH_CODES).map(
                              ([code, name]) => {
                                if (
                                  selectedFilters.domain &&
                                  !DOMAIN_MAPPING[
                                    selectedFilters.domain
                                  ]?.includes(code)
                                ) {
                                  return null;
                                }
                                return (
                                  <option key={code} value={code}>
                                    {name}
                                  </option>
                                );
                              },
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Role Filter */}
                      <div className="space-y-1.5">
                        <label
                          className={`text-xs font-medium ${isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"}`}
                        >
                          Role
                        </label>
                        <div className="relative">
                          <Shield
                            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"}`}
                          />
                          <select
                            value={selectedFilters.role}
                            onChange={(e) =>
                              setSelectedFilters((prev) => ({
                                ...prev,
                                role: e.target.value,
                              }))
                            }
                            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm appearance-none outline-none transition-all duration-300 ${
                              isLightMode
                                ? "bg-white border-[#e0e0e0] text-[#070707] focus:border-[#ece239]"
                                : "bg-[#040404] border-[#1a1a1a] text-[#f5f5f5] focus:border-[#ece239]"
                            }`}
                          >
                            <option value="">All Roles</option>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                          </select>
                        </div>
                      </div>

                      {/* College Filter */}
                      <div className="space-y-1.5">
                        <label
                          className={`text-xs font-medium ${isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"}`}
                        >
                          College
                        </label>
                        <div className="relative">
                          <School
                            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"}`}
                          />
                          <select
                            value={selectedFilters.college}
                            onChange={(e) =>
                              setSelectedFilters((prev) => ({
                                ...prev,
                                college: e.target.value,
                              }))
                            }
                            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm appearance-none outline-none transition-all duration-300 ${
                              isLightMode
                                ? "bg-white border-[#e0e0e0] text-[#070707] focus:border-[#ece239]"
                                : "bg-[#040404] border-[#1a1a1a] text-[#f5f5f5] focus:border-[#ece239]"
                            }`}
                          >
                            <option value="">All Colleges</option>
                            {Object.entries(COLLEGE_CODES).map(
                              ([code, name]) => (
                                <option key={code} value={code}>
                                  {name}
                                </option>
                              ),
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Batch Filter */}
                      <div className="space-y-1.5">
                        <label
                          className={`text-xs font-medium ${isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"}`}
                        >
                          Batch
                        </label>
                        <div className="relative">
                          <GraduationCap
                            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"}`}
                          />
                          <select
                            value={selectedFilters.batch}
                            onChange={(e) =>
                              setSelectedFilters((prev) => ({
                                ...prev,
                                batch: e.target.value,
                              }))
                            }
                            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm appearance-none outline-none transition-all duration-300 ${
                              isLightMode
                                ? "bg-white border-[#e0e0e0] text-[#070707] focus:border-[#ece239]"
                                : "bg-[#040404] border-[#1a1a1a] text-[#f5f5f5] focus:border-[#ece239]"
                            }`}
                          >
                            <option value="">All Batches</option>
                            {Array.from({ length: 7 }, (_, i) => {
                              const year = 21 + i; // 21 to 27
                              return (
                                <option key={year} value={year.toString()}>
                                  20{year}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      {/* Skills Filter */}
                      <div className="space-y-1.5">
                        <label
                          className={`text-xs font-medium ${isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"}`}
                        >
                          Tech Stack
                        </label>
                        <div className="relative">
                          <Briefcase
                            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"}`}
                          />
                          <input
                            type="text"
                            placeholder="e.g. React, Python"
                            value={selectedFilters.skill}
                            onChange={(e) =>
                              setSelectedFilters((prev) => ({
                                ...prev,
                                skill: e.target.value,
                              }))
                            }
                            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none transition-all duration-300 ${
                              isLightMode
                                ? "bg-white border-[#e0e0e0] text-[#070707] placeholder-[#a0a0a0] focus:border-[#ece239]"
                                : "bg-[#040404] border-[#1a1a1a] text-[#f5f5f5] placeholder-[#4a4a4a] focus:border-[#ece239]"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Clear Filters */}
                      <div className="flex items-end">
                        <button
                          onClick={() =>
                            setSelectedFilters({
                              domain: "",
                              branch: "",
                              batch: "",
                              skill: "",
                              role: "",
                              college: "",
                            })
                          }
                          className={`w-full py-2 px-4 rounded-xl text-sm font-medium border transition-all duration-300 ${
                            isLightMode
                              ? "bg-white border-[#e0e0e0] text-[#4a4a4a] hover:bg-[#ece239]/10 hover:text-[#070707]"
                              : "bg-[#040404] border-[#1a1a1a] text-[#a0a0a0] hover:bg-[#ece239]/10 hover:text-[#f5f5f5]"
                          }`}
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`text-sm font-medium ${
                          isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"
                        }`}
                      >
                        Sort by:
                      </span>
                      {["recent", "popular", "oldest"].map((option) => (
                        <button
                          key={option}
                          onClick={() => setSortBy(option)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                            sortBy === option
                              ? isLightMode
                                ? "bg-[#ece239] text-[#070707]"
                                : "bg-[#ece239] text-[#070707]"
                              : isLightMode
                                ? "bg-white text-[#4a4a4a] hover:bg-[#ece239]/10"
                                : "bg-[#040404] text-[#a0a0a0] hover:bg-[#ece239]/10"
                          }`}
                        >
                          {option === "recent" && (
                            <Clock className="w-3 h-3 inline mr-1" />
                          )}
                          {option === "popular" && (
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                          )}
                          {option === "oldest" && (
                            <Calendar className="w-3 h-3 inline mr-1" />
                          )}
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Feed */}
        <div className="space-y-4 sm:space-y-5">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="relative">
                <div
                  className={`w-12 h-12 border-4 rounded-full ${
                    isLightMode ? "border-[#ece239]/20" : "border-[#ece239]/20"
                  }`}
                ></div>
                <div className="w-12 h-12 border-4 border-t-[#ece239] border-r-[#27dc66] rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
            </div>
          )}

          {/* Empty States */}
          {!isLoading && activeTab === "posts" && posts.length === 0 && (
            <div
              className={`rounded-2xl p-12 text-center border ${
                isLightMode
                  ? "bg-white border-[#e0e0e0]"
                  : "bg-[#040404] border-[#1a1a1a]"
              }`}
            >
              <div
                className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isLightMode ? "bg-[#ece239]/10" : "bg-[#ece239]/10"
                }`}
              >
                <Grid className="w-10 h-10 text-[#ece239]" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  isLightMode ? "text-[#070707]" : "text-[#f5f5f5]"
                }`}
              >
                No Posts Yet
              </h3>
              <p
                className={`text-sm max-w-sm mx-auto ${
                  isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"
                }`}
              >
                Be the first to share something with your campus community!
              </p>
            </div>
          )}

          {!isLoading &&
            activeTab === "projects" &&
            (!projects || projects.length === 0) && (
              <div
                className={`rounded-2xl p-12 text-center border ${
                  isLightMode
                    ? "bg-white border-[#e0e0e0]"
                    : "bg-[#040404] border-[#1a1a1a]"
                }`}
              >
                <div
                  className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    isLightMode ? "bg-[#27dc66]/10" : "bg-[#27dc66]/10"
                  }`}
                >
                  <Briefcase className="w-10 h-10 text-[#27dc66]" />
                </div>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isLightMode ? "text-[#070707]" : "text-[#f5f5f5]"
                  }`}
                >
                  No Projects Yet
                </h3>
                <p
                  className={`text-sm max-w-sm mx-auto ${
                    isLightMode ? "text-[#4a4a4a]" : "text-[#a0a0a0]"
                  }`}
                >
                  Start showcasing your amazing projects to the community!
                </p>
              </div>
            )}

          {/* Posts Feed */}
          {activeTab === "posts" &&
            displayedPosts?.map((post, index) => (
              <div
                key={index}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PostCard
                  postId={post._id}
                  userId={post?.author?._id}
                  avatar={post.author.profileImage}
                  username={post?.author?.fullName}
                  time={format(
                    parseISO(post?.createdAt),
                    "dd MMM yyyy, hh:mm a",
                  )}
                  content={post.caption}
                  imageUrl={post.mediaUrl}
                  likes={post.likes}
                  comments={post.comments}
                />
              </div>
            ))}

          {/* Projects Feed */}
          {activeTab === "projects" &&
            projects?.map((project, index) => (
              <div
                key={index}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProjectCard
                  projectId={project._id}
                  userId={project?.userId?._id}
                  avatar={project?.userId?.profileImage}
                  username={project?.userId?.fullName}
                  time={project?.createdAt}
                  content={project?.description}
                  projectUrl={project?.projectUrl}
                  githubUrl={project?.githubUrl}
                  imageUrl={project?.mediaUrl}
                  skills={project?.TechStack}
                  likes={project?.likes}
                  comments={project?.comments}
                  contributors={project?.contributors}
                  projectName={project?.title}
                />
              </div>
            ))}
        </div>

        {/* Load More Button */}
        {hasMore && !isLoading && activeTab === "posts" && (
          <div className="mt-8 text-center">
            <button
              onClick={() => fetchPosts(page + 1)}
              className={`px-6 py-3 rounded-xl transition-all duration-300 font-semibold text-sm shadow-lg ${
                isLightMode
                  ? "bg-white border border-[#ece239]/30 text-[#ece239] hover:bg-[#ece239]/10 hover:border-[#ece239]/50 shadow-[#ece239]/10"
                  : "bg-[#040404] border border-[#ece239]/30 text-[#ece239] hover:bg-[#ece239]/10 hover:border-[#ece239]/50 shadow-[#ece239]/10"
              }`}
            >
              Load More Posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Network;
