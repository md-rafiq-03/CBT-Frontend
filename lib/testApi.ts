import { apiClient } from "./apiClient";
import { CreateTestPayload, Test } from "./Interface";

const TESTS_ENDPOINT = `/api/v1/tests`;

export const getTests = async (): Promise<Test[]> => {
  const res = await apiClient.get(TESTS_ENDPOINT);
  return res.data;
};

export const getTestById = async (testId: string): Promise<Test> => {
  const res = await apiClient.get(`${TESTS_ENDPOINT}/test/${testId}`);
  return res.data;
};

export const createTest = async (test: CreateTestPayload): Promise<Test> => {
  const res = await apiClient.post(TESTS_ENDPOINT, test);
  return res.data;
};

export const deleteTest = async (testId: string) => {
  const res = await apiClient.delete(`${TESTS_ENDPOINT}/test/${testId}`);
  return res.data;
};

export const updateTestActive = async (
  testId: string,
  active: boolean
): Promise<Test> => {
  const res = await apiClient.patch(
    `${TESTS_ENDPOINT}/test/${testId}/active`,
    null,
    { params: { active } }
  );
  return res.data;
};
