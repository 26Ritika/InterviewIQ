import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
});

export const api = {
  search: (query, company) => client.post('/search', { query, company, top_k: 5 }),
  getHint: (problem_title, hint_level) => client.post('/hint', { problem_title, hint_level }),
  analyzeComplexity: (problem_title, approach) => client.post('/complexity', { problem_title, approach }),
  getPattern: (problem_title) => client.post('/pattern', { problem_title }),
  reviewCode: (problem_title, code) => client.post('/review', { problem_title, code }),
  startMock: (difficulty, company) => client.post('/mock/start', { difficulty, company }),
  evaluateMock: (problem_title, approach, time_taken) => client.post('/mock/evaluate', { problem_title, approach, time_taken }),
  getFollowup: (problem_title, approach) => client.post('/mock/followup', { problem_title, approach }),
  getStats: () => client.get('/progress/stats'),
  markSolved: (title, difficulty, company) => client.post('/progress/solved', { title, difficulty, company }),
  getLeaderboard: () => client.get('/db/leaderboard'),
};