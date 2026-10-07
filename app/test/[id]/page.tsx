import { Suspense } from "react";
import TestAttemptClient from "@/components/TestAttemptClient";

export const dynamic = "force-dynamic";

export default function TestAttemptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-600 font-medium">Loading test...</p>
        </div>
      }
    >
      <TestAttemptClient />
    </Suspense>
  );
}
