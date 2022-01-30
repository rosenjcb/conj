import { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'https://localhost:6006';

export const useNewPost = (post) => {
    const [response, setResponse] = useState(null);
    const [error, setError] = useState('');
    const [loading, setloading] = useState(true);

    const fetchData = () => {
    axios
      .post('/threads', post)
      .then((res) => {
          setResponse(res.data);
      })
      .catch((err) => {
          setError(err);
      })
      .finally(() => {
          setloading(false);
      });
    };

    useEffect(() => {
      fetchData()
    }, []);

    return { response, error, loading };
}
