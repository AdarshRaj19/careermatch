
import { api } from './api';

/**
 * Sends resume text to the backend for AI analysis.
 * @param resumeText The text content of the resume.
 * @returns A promise that resolves to an array of skill strings.
 */
export const analyzeResumeWithAI = async (resumeText: string): Promise<string[]> => {
  console.log("Sending resume to backend for analysis...");

  try {
    const response = await api.post('/student/resume/analyze', { resumeText });
    console.log("Analysis complete. Skills found:", response.data.skills);
    return response.data.skills;
  } catch (error) {
    console.error("Failed to analyze resume via backend:", error);
    // Return a default or empty array on failure
    return [];
  }
};
