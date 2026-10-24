"use client";

import { useEffect, useRef, useState } from "react";
import { User, LogOut, Menu, X, KeyRound, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export type TestListTab = "all" | "active" | "attempted" | "unattempted";

interface NavbarProps {
  activeTab?: TestListTab | null;
  onTabChange: (tab: TestListTab) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showProfileMenu) return;
    const onPointer = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [showProfileMenu]);

  const tabs = [
    { id: "all" as const, label: "All Tests" },
    { id: "active" as const, label: "Active Tests" },
    { id: "attempted" as const, label: "Attempted" },
    { id: "unattempted" as const, label: "Unattempted" },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Kinematics Classes"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">
                Kinematics Classes
              </h1>
              <p className="text-xs text-gray-500">Student Portal</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://kinematicsclasses.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Coaching site
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-all"
              >
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.fullName || "Student"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.rollNumber}</p>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.rollNumber}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push("/profile");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push("/account/password?portal=student");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Change password</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <a
                href="https://kinematicsclasses.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg font-medium text-sm text-blue-600 hover:bg-gray-100"
              >
                Coaching site
              </a>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all text-left ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
