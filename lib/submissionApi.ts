import { apiClient } from "./apiClient";
import {
  AttemptAnalysis,
  Submission,
  SubmissionPayload,
} from "./Interface";

export async function saveSubmission(
  payload: SubmissionPayload
): Promise<Submission> {
  const res = await apiClient.post("/api/v1/submission", payload);
  return res.data;
}

export async function getAllSubmissions(): Promise<Submission[]> {
  const res = await apiClient.get(`/api/v1/submission`);
  return res.data || [];
}

export async function getSubmissionsByUserId(
  userId: string
): Promise<Submission[]> {
  const res = await apiClient.get(`/api/v1/submission/userid/${userId}`);
  return res.data || [];
}

export async function getSubmissionByUserAndTest(
  userId: string,
  testId: string
): Promise<Submission | null> {
  try {
    const res = await apiClient.get(
      `/api/v1/submission/userid/${userId}/test/${testId}`
    );
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export async function getAttemptAnalysis(
  userId: string,
  testId: string
): Promise<AttemptAnalysis> {
  const res = await apiClient.get(
    `/api/v1/submission/userid/${userId}/test/${testId}/analysis`
  );
  return res.data;
}

/** Admin: wipe all submissions for student+test so they can reattempt. */
export async function resetStudentAttempt(
  userId: string,
  testId: string
): Promise<string> {
  const res = await apiClient.delete(
    `/api/v1/submission/userid/${userId}/test/${testId}`
  );
  return typeof res.data === "string" ? res.data : "Attempt reset";
}
