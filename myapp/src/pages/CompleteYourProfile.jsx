import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Added import for useNavigate

const CompleteYourProfile = () => {
  const { user } = useUser();
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [idCardPhoto, setIdCardPhoto] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [githubEmail, setGithubEmail] = useState(""); // State for GitHub email
  const [linkedinUrl, setLinkedinUrl] = useState(""); // State for LinkedIn URL

  const navigate = useNavigate();

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

  const handleFileChange = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPG, JPEG, and PNG files are allowed.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (setImage) => {
    setImage(null);
  };

  const validateForm = () => {
    if (
      !enrollmentNumber ||
      enrollmentNumber.length !== 11 ||
      !rollNumber ||
      !branchCode ||
      !batchYear ||
      !idCardPhoto ||
      !isChecked ||
      !githubEmail ||
      !linkedinUrl
    ) {
      toast.error("Please fill all required fields, upload your ID card, and agree to the terms.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log("Form data:", {
      rollNumber,
      collegeName: COLLEGE_NAME,
      branch: allowedBranchCodes[branchCode],
      batchYear,
      idCardPhoto,
      githubEmail,
      linkedinUrl,
    });

    toast.success("Profile saved successfully!");
  };

  // Function to handle the back button click
  const handleBack = () => {
    navigate(-1); // Goes back to the previous page
  };

  // Function to verify GitHub email
  const verifyGithubEmail = () => {
    // Add your verification logic here
    toast.success("GitHub email verified successfully!");
  };

  // Function to verify LinkedIn URL
  const verifyLinkedinUrl = () => {
    // Add your verification logic here
    toast.success("LinkedIn URL verified successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 text-3xl bg-gray-200 px-3 py-1 hover:cursor-pointer rounded-full text-gray-600 hover:text-gray-800"
      >
        &times; {/* "×" represents the cross sign */}
      </button>
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-10">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-8">
        Your Profile
        </h2>

        {user && (
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <img
                className="w-28 h-28 rounded-full"
                src={user?.imageUrl}
                alt="profile photo"
              />
            </div>
            <p className="text-lg font-medium">{user.fullName}</p>
            <p className="text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700">Enrollment Number *</label>
              <input
                type="text"
                value={enrollmentNumber}
                onChange={handleEnrollmentChange}
                maxLength="11"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                placeholder="11-digit enrollment number"
                required
              />
            </div>

            {rollNumber && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                  <input
                    type="text"
                    value={rollNumber}
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
                    value={allowedBranchCodes[branchCode] || ""}
                    readOnly
                    className="w-full p-3 bg-gray-100 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Batch Year</label>
                  <input
                    type="text"
                    value={batchYear}
                    readOnly
                    className="w-full p-3 bg-gray-100 rounded-lg"
                  />
                </div>
              </>
            )}
          </div>

          {/* ID Card Photo */}
          <div className="flex flex-col ">
            <label className="text-sm font-medium mb-2">College ID Card *</label>
            <div className="relative w-72 h-48 rounded-lg border-2 border-gray-300 hover:shadow-lg transition">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleFileChange(e, setIdCardPhoto)}
                required
              />
              {idCardPhoto ? (
                <img
                  src={idCardPhoto}
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
                  onClick={() => removeImage(setIdCardPhoto)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  style={{ transform: "translate(50%, -50%)" }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* GitHub Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">GitHub Email *</label>
            <div className="flex">
              <input
                type="email"
                value={githubEmail}
                onChange={(e) => setGithubEmail(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Enter your GitHub email"
                required
              />
              <button
                type="button"
                onClick={verifyGithubEmail}
                className="ml-2 bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600 transition"
              >
                Verify
              </button>
            </div>
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700">LinkedIn URL *</label>
            <div className="flex">
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Enter your LinkedIn URL"
                required
              />
              <button
                type="button"
                onClick={verifyLinkedinUrl}
                className="ml-2 bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600 transition"
              >
                Verify
              </button>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mr-2"
              required
            />
            <span className="text-sm text-gray-600">
              I agree to the <a href="" className="text-blue-500">terms and conditions</a>.
            </span>
          </div>

          {/* Submit Button */}
          <div className="text-center mt-8">
            <button
              type="submit"
              className="bg-blue-500 text-white text-xl px-8 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Save Profile
            </button>
          </div>
        </form>

        <ToastContainer />
      </div>
    </div>
  );
};

export default CompleteYourProfile;
