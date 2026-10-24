"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar, { type TestListTab } from "@/components/Navbar";
import Footer from "@/components/Footer";
import StudentProfile from "@/components/StudentProfile";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <ProtectedRoute role="STUDENT" loginPath="/login">
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar
          onTabChange={(tab: TestListTab) => router.push(`/?tab=${tab}`)}
        />
        <StudentProfile />
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
