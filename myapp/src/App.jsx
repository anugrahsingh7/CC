import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import AppLayout from "./ui/AppLayout";
import NoNavFooterLayout from "./ui/NoNavFooterLayout";
import Loader from "./components/Loader";
import Preloader from "./components/Preloader"; // Import Preloader
import { ThemeProvider } from "./context/ThemeContext"; // Import ThemeProvider
import { useState, useEffect } from "react"; // Import React hooks

import Notice from "./pages/Notice";
import Post from "./pages/Post";
import FacultyPost from "./pages/FacultyPost";
import Events from "./pages/Events";
import Network from "./pages/Network";
import Chats from "./pages/Chats";
import SignUpPage from "./pages/SignUp";
import Login from "./pages/Login";

import YourAccount from "./pages/YourAccount";
import PostProject from "./pages/PostProject";
import ClassRoom from "./pages/ClassRoom";
import CompleteYourProfile from "./pages/CompleteYourProfile";
import YourProfile from "./pages/YourProfile";
import NetworkProfile from "./pages/NetworkProfile";
import { ToastContainer } from "react-toastify";
import FacultyRole from "./pages/FacultyRole";
import Account from './pages/Account';
import Search from './pages/Search';
import HelpSupport from './pages/HelpSupport';
import ScrollManager from './components/ScrollManager';
import NoticeDetail from './pages/NoticeDetail'; // New component for notice details
import EventDetail from './pages/EventDetail'; // New component for event details
import PostDetail from './pages/PostDetail'; // New component for post details
import ProjectDetail from './pages/ProjectDetail'; // New component for project details

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// 🔒 Protected Route Component
function ProtectedRoute({ children }) {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center fixed inset-0">
        <Loader />
      </div>
    );
  }

  if (!userId) {
    return <Navigate to="/Login" />;
  }

  return children;
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Preloader />;
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider>
        <BrowserRouter>
          <ScrollManager />
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
          {/* Public Routes */}
          <Route element={<NoNavFooterLayout />}>
            <Route path="/SignUp" element={<SignUpPage />} />
            <Route path="/Login" element={<Login />} />

            <Route
              path="/Chats"
              element={
                <ProtectedRoute>
                  <Chats />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/Network" replace />} />
            <Route path="/Notice" element={<Notice />} />
            <Route path="/notice/:id" element={<NoticeDetail />} />
            <Route path="/Events" element={<Events />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/Network" element={<Network />} />
            <Route path="/Account" element={<Account />} />
            <Route path="/FacultyPost" element={<FacultyPost />} />
            <Route path="/Search" element={<Search />} />
            <Route
              path="/Post"
              element={
                <ProtectedRoute>
                  <Post />
                </ProtectedRoute>
              }
            />
            <Route
              path="/FacultyRole"
              element={
                <ProtectedRoute>
                  <FacultyRole />
                </ProtectedRoute>
              }
            />
            <Route
              path="/CompleteYourProfile"
              element={
                <ProtectedRoute>
                  <CompleteYourProfile />
                </ProtectedRoute>
              }
            />
             <Route
              path="/NetworkProfile/:name/:userId"
              element={
                <ProtectedRoute>
                  <NetworkProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/NetworkProfile/:userId"
              element={
                <ProtectedRoute>
                  <NetworkProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/NetworkProfile"
              element={
                <ProtectedRoute>
                  <NetworkProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/YourProfile"
              element={
                <ProtectedRoute>
                  <YourProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/PostProject"
              element={
                <ProtectedRoute>
                  <PostProject />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
              path="/YourAccount"
              element={
                <ProtectedRoute>
                  <YourAccount />
                </ProtectedRoute>
              }
            />
             <Route path="/ClassRoom" element={<ClassRoom />} />
            <Route path="/help-support" element={<HelpSupport />} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/Login" />} />
        </Routes>
      </BrowserRouter>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
