import { Suspense } from "react";
import PasswordResetPage from "@/components/PasswordResetPage";

export default function AccountPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-600">Loading...</p>
        </div>
      }
    >
      <PasswordResetPage />
    </Suspense>
  );
}
