import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { X, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";



const CompleteYourProfile = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [skillsInput, setSkillsInput] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [skills, setSkills] = useState([]);
  const [aboutMe, setAboutMe] = useState("");
  const [idCardPhoto, setIdCardPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status ,setStatus] = useState(false);

  const allowedBranchCodes = {
    "027": "Computer Science Engineering",
    "031": "Information Technology",
    "119": "Artificial Intelligence and Data Science",
    "049": "Electrical Engineering",
    "028": "Electronics and Communication Engineering",
    "157": "Computer Science Engineering in Data Science",
  };

  const VALID_COLLEGE_CODE = "208";
  const COLLEGE_NAME = "Bhagwan Parshuram Institute of Technology";


   const handleEnrollmentChange = (e) => {
      const value = e.target.value;
      if (/^\d*$/.test(value)) {
        setEnrollmentNumber(value);
        if (value.length === 11) {
          const roll = value.substring(0, 3);
          const college = value.substring(3, 6);
          const branch = value.substring(6, 9);
          const batch = value.substring(9, 11);
  
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
  
          setRollNumber(roll);
          setBranchCode(branch);
          setBatchYear(`20${batch}`);
        } else {
          resetFields();
        }
      }
    
    };

    const resetFields = () => {
      setRollNumber("");
      setBranchCode("");
      setBatchYear("");
    };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/user/profile/${user.id}`
      );
      const data = response.data;
      console.log(data);
      setEnrollmentNumber(data.enrollmentNumber || "");
      setGithubUrl(data.githubUrl || "");
      setLinkedinUrl(data.linkedinUrl || "");
      setSkills(data.skills || []);
      setAboutMe(data.aboutMe || "");
      if (data.collegeIDCard) {
        setIdCardPhoto(data.collegeIDCard);
      }
      setStatus(data.status);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile.");
    }
  };

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
      if (aboutMe) formData.append("aboutMe", aboutMe);
      if (skills.length) formData.append("skills", JSON.stringify(skills));
      if (idCardPhoto && typeof idCardPhoto !== "string")
        formData.append("idCardPhoto", idCardPhoto);

      const response = await axios.patch(
        "http://localhost:3000/api/user/upload-profile",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Profile updated successfully!");
      navigate("/");
      console.log("Updated User:", response.data.user);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <button
        onClick={() => navigate("/Home")}
        className="absolute top-4 left-4 text-3xl bg-gray-200 px-3 py-1 hover:cursor-pointer rounded-full text-gray-600 hover:text-gray-800"
      >
        &times;
      </button>
      <div className= "w-full max-w-4xl bg-white rounded-lg shadow-xl p-10">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-8">
          Your Profile
        </h2>


        {user && (
          <div className="text-center mb-8">
            <img
              className="w-28 h-28 rounded-full"
              src={user?.imageUrl}
              alt="profile"
            />
            <p className="text-lg font-medium">{user.fullName}</p>
            <p className="text-gray-600">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        )}

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Enrollment Number
          </label>
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
            className={`w-full p-3 border rounded-lg ${
              status ? "bg-gray-100" : "bg-white"
            }`}
            placeholder="Enter enrollment number"
          />
        </div>

           
          {enrollmentNumber && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                  <input
                    type="text"
                    value={enrollmentNumber.substring(0, 3)}
                    readOnly
                    className="w-full p-3 bg-gray-100 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">College</label>
                  <input
                    type="text"
                    value={COLLEGE_NAME}
                    readOnly
                    className="w-full p-3 bg-gray-100 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch</label>
                  <input
                    type="text"
                    value={allowedBranchCodes[enrollmentNumber.substring(6,9)] || ""}
                    readOnly
                    className="w-full p-3 bg-gray-100 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Batch Year</label>
                  <input
                    type="text"
                    value={"20" + enrollmentNumber.substring(9, 11)}
                    readOnly
                    className="w-full p-3 bg-gray-100 rounded-lg"
                  />
                </div>
              </>
            )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              GitHub URL
            </label>
            <input
              type="url"
              disabled={status}
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className={`w-full p-3 border rounded-lg ${
                status ? "bg-gray-100" : "bg-white"
              }`}
              placeholder="Enter GitHub URL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              LinkedIn URL
            </label>
            <input
              type="url"
              disabled={status}
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className={`w-full p-3 border rounded-lg ${
                status ? "bg-gray-100" : "bg-white"
              }`}
              placeholder="Enter LinkedIn URL"
            />
          </div>

          <div>
        <label className="block text-sm font-medium text-gray-700">Skills</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {skills.map((skill, index) => (
            <span key={index} className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {skill}
              <button 
                type="button"
                onClick={() => setSkills(skills.filter((s) => s !== skill))}
                className="ml-2 text-blue-500 hover:text-blue-700"
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
            className="w-full p-2 border rounded-l-lg"
            placeholder="Type a skill and press Add"
    />
    <button
      type="button"
      onClick={() => {
        if (skillsInput.trim() && !skills.includes(skillsInput.trim().toLowerCase())) {
          setSkills([...skills, skillsInput.trim().toLowerCase()]);
          setSkillsInput(""); // Clear input
        }
      }}
      className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600"
    >
      Add
    </button>
  </div>
</div>


          <div>
            <label className="block text-sm font-medium text-gray-700">
              About Me
            </label>
            <textarea
              value={aboutMe}
              disabled={status}
              onChange={(e) => setAboutMe(e.target.value)}
              className={`w-full p-3 border rounded-lg ${
                status ? "bg-gray-100" : "bg-white"
              }`}
              placeholder="Tell something about yourself"
            ></textarea>
          </div>

          {/* ID Card Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              College ID Card
            </label>
            <div className="relative w-72 h-48 border-2 border-gray-300 rounded-lg hover:shadow-lg transition">
              <input
                type="file"
                accept="image/*"
                required={!idCardPhoto}
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              {idCardPhoto ? (
                <img
                  src={
                    typeof idCardPhoto === "string"
                      ? idCardPhoto // If it's a URL, use it directly
                      : idCardPhoto
                      ? URL.createObjectURL(idCardPhoto) // If it's a file, create an object URL
                      : ""
                  }
                  alt="ID Card"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <UploadCloud size={40} />
                </div>
              )}
              {idCardPhoto && (
                <button
                  onClick={removeImage}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>

        <ToastContainer />
      </div>
    </div>
  );
};

export default CompleteYourProfile;
