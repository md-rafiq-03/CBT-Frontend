"use client";

import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Test, TestAttempt } from "../lib/Interface";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TestCard from "../components/TestCard";
import ProtectedRoute from "../components/ProtectedRoute";
import { getTests } from "../lib/testApi";
import { getSubmissionsByUserId } from "../lib/submissionApi";

export default function Home() {
  return (
    <ProtectedRoute role="STUDENT" loginPath="/login">
      <HomeContent />
    </ProtectedRoute>
  );
}

function HomeContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "all" | "active" | "attempted" | "previous"
  >("all");
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        const [testsData, submissions] = await Promise.all([
          getTests(),
          getSubmissionsByUserId(user.userId),
        ]);
        setTests(testsData || []);

        const mapped: TestAttempt[] = (submissions || []).map((s) => ({
          id: s.submissionId || s.id || "",
          student_id: s.userId,
          test_id: s.testId,
          score: s.score ?? 0,
          attempted_date: new Date(s.endTime || Date.now()).toISOString(),
          completed: true,
          created_at: new Date(s.startedAt || Date.now()).toISOString(),
        }));
        setAttempts(mapped);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setSearchQuery("");
      }
    };

    load();
  }, [user]);

  const getFilteredTests = () => {
    const now = new Date();
    let filtered = tests;

    switch (activeTab) {
      case "active":
        filtered = tests.filter((test) => {
          const start = new Date(Number(test.startAt));
          const end = new Date(Number(test.expireAt));
          return now >= start && now <= end && test.active;
        });
        break;
      case "attempted": {
        const attemptedTestIds = attempts.map((a) => a.test_id);
        filtered = tests.filter((test) =>
          attemptedTestIds.includes(test.testId || test.id)
        );
        break;
      }
      case "previous":
        filtered = tests.filter((test) => {
          const end = new Date(Number(test.expireAt));
          return now > end;
        });
        break;
      default:
        filtered = tests;
    }

    if (searchQuery) {
      filtered = filtered.filter((test) =>
        test?.testName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getAttemptForTest = (test: Test) => {
    const key = test.testId || test.id;
    return attempts.find((a) => a.test_id === key);
  };

  const filteredTests = getFilteredTests();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {activeTab === "all" && "All Tests"}
            {activeTab === "active" && "Active Tests"}
            {activeTab === "attempted" && "Attempted Tests"}
            {activeTab === "previous" && "Previous Tests"}
          </h2>
          <p className="text-gray-600">
            {activeTab === "all" && "Browse all available tests"}
            {activeTab === "active" && "Tests currently available for attempt"}
            {activeTab === "attempted" && "Tests you have already attempted"}
            {activeTab === "previous" && "Expired tests"}
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium text-gray-700 flex items-center justify-center space-x-2 transition-all">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tests found
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? "Try adjusting your search query"
                : "No tests available in this category"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <TestCard
                key={test.testId || test.id}
                test={test}
                attempt={getAttemptForTest(test)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
