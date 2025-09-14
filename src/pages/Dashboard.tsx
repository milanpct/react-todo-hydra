import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import TodoList from "../components/TodoList";
import ProfileModal from "../components/ProfileModal";
import SDKTestPanel from "../components/SDKTestPanel";
import { Settings, BarChart3 } from "lucide-react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your todos and track your productivity
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowProfileModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Settings className="h-4 w-4 mr-2" />
              Profile Settings
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">
                  Analytics Tracking
                </p>
                <p className="text-xs text-blue-700">Powered by Hydra SDK</p>
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
                  User Events
                </p>
                <p className="text-xs text-green-700">
                  Signup, Signin, Updates tracked
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
