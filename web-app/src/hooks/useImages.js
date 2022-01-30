import { useState, useEffect } from 'react';
import axios from 'axios';

export const useImages = (post) => {
    const [images, setImages] = useState([]);

    const fetchData = () => {
      axios
        .get('/images', post)
        .then((res) => {
          setImages(res.data);
        })
    };

    useEffect(() => {
      fetchData()
    }, []);

    return { images };
}
