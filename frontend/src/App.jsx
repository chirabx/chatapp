import Navbar from "./components/Navbar";
import BackgroundLayout from "./components/BackgroundLayout";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import AddFriend from "./pages/AddFriend";
import FriendRequests from "./pages/FriendRequests";
import BotChat from "./components/BotChat";
import AIGamesPage from "./pages/AIGamesPage";
import GroupSettings from "./pages/GroupSettings";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // 设置 DaisyUI 主题
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        {/* 登录和注册页面不使用背景 */}
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/login" />} />

        {/* 其他页面使用背景布局 */}
        <Route path="/" element={
          authUser ? (
            <BackgroundLayout>
              <HomePage />
            </BackgroundLayout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/settings" element={
          authUser ? (
            <BackgroundLayout>
              <SettingsPage />
            </BackgroundLayout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/profile" element={
          authUser ? (
            <BackgroundLayout>
              <ProfilePage />
            </BackgroundLayout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/add-friend" element={
          authUser ? (
            <BackgroundLayout>
              <AddFriend />
            </BackgroundLayout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/friend-requests" element={
          authUser ? (
            <BackgroundLayout>
              <FriendRequests />
            </BackgroundLayout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/bot" element={
          authUser ? (
            <BackgroundLayout>
              <BotChat />
            </BackgroundLayout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/ai-games" element={
          authUser ? (
            <BackgroundLayout>
              <AIGamesPage />
            </BackgroundLayout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/groups/:groupId/settings" element={
          authUser ? (
            <BackgroundLayout>
              <GroupSettings />
            </BackgroundLayout>
          ) : <Navigate to="/login" />
        } />
      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
