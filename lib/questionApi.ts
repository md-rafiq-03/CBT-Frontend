import { apiClient } from "./apiClient";
import { Question } from "./Interface";

const QUESTIONS_ENDPOINT = `/api/v1/questions`;

/** Without answers — for live attempts. */
export const getQuestions = async (): Promise<Question[]> => {
  const res = await apiClient.get(QUESTIONS_ENDPOINT);
  if (res.status === 200) return res.data || [];
  throw new Error(`Unexpected status: ${res.status}`);
};

/** Without answers — for live attempts. */
export const getQuestionsByTestId = async (
  testId?: string
): Promise<Question[]> => {
  const res = await apiClient.get(`${QUESTIONS_ENDPOINT}/test/${testId}`);
  if (res.status === 200) return res.data || [];
  throw new Error(`Unexpected status: ${res.status}`);
};

/** With answers — admin always; student after submit. */
export const getQuestionsByTestIdWithAnswers = async (
  testId: string
): Promise<Question[]> => {
  const res = await apiClient.get(
    `${QUESTIONS_ENDPOINT}/test/${testId}/with-answers`
  );
  if (res.status === 200) return res.data || [];
  throw new Error(`Unexpected status: ${res.status}`);
};

export const getQuestionById = async (questionId: string): Promise<Question> => {
  const res = await apiClient.get(`${QUESTIONS_ENDPOINT}/${questionId}`);
  if (res.status === 200) return res.data;
  throw new Error(`Unexpected status: ${res.status}`);
};

export const createQuestion = async (
  question: Omit<Question, "id" | "questionId">
): Promise<string> => {
  const res = await apiClient.post(QUESTIONS_ENDPOINT, question);
  if (res.status === 201 || res.status === 200) {
    return typeof res.data === "string"
      ? res.data
      : "question uploaded successfully";
  }
  throw new Error(`Unexpected status: ${res.status}`);
};

export const updateQuestion = async (
  questionId: string,
  question: Partial<Question>
): Promise<Question> => {
  try {
    const res = await apiClient.put(
      `${QUESTIONS_ENDPOINT}/${questionId}`,
      question
    );
    if (res.status === 200) return res.data;
    throw new Error(`Unexpected status: ${res.status}`);
  } catch (error: any) {
    if (error?.response?.status === 404 || error?.response?.status === 405) {
      throw new Error(
        "Question update is not supported by the backend yet (no PUT /api/v1/questions/{id})"
      );
    }
    throw error;
  }
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
  const res = await apiClient.delete(`${QUESTIONS_ENDPOINT}/${questionId}`);
  if (res.status === 200 || res.status === 204) return;
  throw new Error(`Unexpected status: ${res.status}`);
};
