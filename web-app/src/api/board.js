import axios from 'axios';

export const fetchBoards = () => axios.get('/api/boards');
