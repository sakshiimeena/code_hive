import axios from 'axios';

const API_URL = axios.create({
  baseURL: 'https://codehive-backend.onrender.com/api'
});

export const executeCode = async (language, version, sourceCode, stdin = '') => {
  try {
    const response = await API_URL.post('/execute', {
      language,
      version,
      sourceCode,
      stdin
    });

    return response.data;

  } catch (error) {
    console.error("Frontend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Execution failed');
  }
};