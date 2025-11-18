import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import TodoList from "../components/TodoList";
import ProfileModal from "../components/ProfileModal";
import SDKTestPanel from "../components/SDKTestPanel";
import { Settings, BarChart3, UserPlus } from "lucide-react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user
                ? `Welcome back, ${user.firstName}!`
                : "Welcome to Todo App!"}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {user
                ? "Manage your todos and track your productivity"
                : "Start managing your todos - Sign up to sync across devices"}
            </p>
          </div>

          <div className="flex space-x-3">
            {user ? (
              <button
                onClick={() => setShowProfileModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Settings className="h-4 w-4 mr-2" />
                Profile Settings
              </button>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up / Login
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">
                  {user ? "Analytics Tracking" : "Anonymous Tracking"}
                </p>
                <p className="text-xs text-blue-700">
                  {user ? "Powered by Hydra SDK" : "Events tracked anonymously"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                ✓
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">
                  {user ? "User Events" : "Session Tracking"}
                </p>
                <p className="text-xs text-green-700">
                  {user
                    ? "Signup, Signin, Updates tracked"
                    : "Activity tracked per session"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                📊
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">
                  Behavioral Events
                </p>
                <p className="text-xs text-purple-700">Todo actions tracked</p>
              </div>
            </div>
          </div>
        </div>

        {!user && (
          <div className="mt-6 bg-indigo-50 border-l-4 border-indigo-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <UserPlus className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-indigo-700">
                  <strong className="font-medium">Tip:</strong> Sign up to save
                  your todos across devices and get personalized insights!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <TodoList />

      <SDKTestPanel />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default Dashboard;
