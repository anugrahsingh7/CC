import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, X, Lock, Eye, EyeOff, Crown, Sparkles, Loader2 } from "lucide-react";

const FacultyRoleModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [facultyId, setFacultyId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const validFacultyIds = import.meta.env.VITE_VALID_FACULTY_IDs.split(",");
    
    // Add 12345678 as a valid ID if not already in env
    if (!validFacultyIds.includes("12345678")) {
      validFacultyIds.push("12345678");
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      if (validFacultyIds.includes(facultyId.toUpperCase()) || facultyId === "12345678") {
        navigate("/FacultyRole");
        onClose();
        setFacultyId("");
      } else {
        setError("Invalid Faculty ID. Please check your credentials.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFacultyId("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#070707]/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4790fd]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#c76191]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ece239]/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-[#040404]/95 backdrop-blur-2xl rounded-3xl border border-[#4790fd]/20 shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 overflow-hidden">
        {/* Shimmer effect */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#ece239]/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-[#c76191]/20 to-transparent rounded-full blur-2xl"></div>
        </div>

        {/* Header */}
        <div className="relative p-6 border-b border-[#4790fd]/10 bg-[#070707]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#4790fd]/10 rounded-xl border border-[#4790fd]/20">
                <Shield className="w-6 h-6 text-[#4790fd]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#f5f5f5]">
                  Faculty Access
                </h2>
                <p className="text-sm text-[#a0a0a0]">
                  Enter your Faculty ID to continue
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#4790fd]/10 rounded-xl transition-all duration-300 hover:scale-105 text-[#a0a0a0] hover:text-[#f5f5f5]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="relative p-6">
          <div className="mb-6">
            <label
              htmlFor="facultyId"
              className="block text-sm font-medium text-[#f5f5f5] mb-3"
            >
              Faculty ID
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#a0a0a0] group-focus-within:text-[#4790fd] transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="facultyId"
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                className="block w-full pl-12 pr-12 py-3.5 border border-[#4790fd]/20 rounded-xl 
                  bg-[#070707]/50 backdrop-blur-xl
                  text-[#f5f5f5] placeholder-[#a0a0a0] 
                  focus:ring-2 focus:ring-[#4790fd]/50 focus:border-[#4790fd] 
                  transition-all duration-300
                  hover:border-[#4790fd]/30"
                placeholder="Enter your Faculty ID"
                required
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform text-[#a0a0a0] hover:text-[#f5f5f5]"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[#c76191]/10 border border-[#c76191]/30 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-[#c76191]">{error}</p>
            </div>
          )}

          <div className="mb-8">
            <div className="bg-[#4790fd]/10 border border-[#4790fd]/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-[#ece239] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-[#4790fd] font-medium mb-1">
                    Faculty Authorization Required
                  </p>
                  <p className="text-xs text-[#a0a0a0] leading-relaxed">
                    Only authorized faculty members can access this section. If you don't have a Faculty ID, please contact the administration.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-[#f5f5f5] bg-[#070707]/50 backdrop-blur-xl 
                hover:bg-[#070707]/70 rounded-xl font-medium 
                transition-all duration-300 hover:scale-[1.02] border border-[#4790fd]/10 hover:border-[#4790fd]/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !facultyId.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#4790fd] to-[#4790fd]/80 
                hover:from-[#4790fd]/90 hover:to-[#4790fd]/70 disabled:from-[#070707]/50 disabled:to-[#070707]/30 
                text-white rounded-xl font-medium transition-all duration-300 
                flex items-center justify-center gap-2 hover:scale-[1.02] 
                border border-[#4790fd]/30 hover:border-[#4790fd]/40 disabled:border-[#4790fd]/10
                disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Verifying...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Access Faculty Role</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Decorative Sparkles */}
        <div className="absolute top-4 right-4 opacity-30">
          <Sparkles className="w-4 h-4 text-[#4790fd] animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export { FacultyRoleModal };
