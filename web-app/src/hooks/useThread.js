// import { useState, useEffect } from 'react';
// import axios from 'axios';

// axios.defaults.baseURL = 'https://localhost:6006';

// export const useThread = (path, post) => {

//     const slugs = path.split('/')
//     const id = slugs[2];

//     const res = path.length === 3 ? await axios.put(`/threads/${id}`, post) : await axios.post('/threads', post);

//     // const [response, setResponse] = useState(null);
//     // const [error, setError] = useState('');
//     // const [loading, setloading] = useState(true);

//     const fetchData = () => {
//         axios
//             .post('/threads', post)
//             .then((res) => {
//                 setResponse(res.data);
//             })
//             .catch((err) => {
//                 setError(err);
//             })
//             .finally(() => {
//                 setloading(false);
//             });
//     };

//     useEffect(() => {
//         fetchData()
//     }, []);

//     return { res.data };
// }