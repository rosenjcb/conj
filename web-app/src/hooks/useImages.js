import { useState, useEffect } from 'react';
import axios from 'axios';

export const useImages = () => {
    const [images, setImages] = useState([]);

    const [groupedImages, setGroupedImages] = useState([]);

    const fetchData = () => {
      axios
        .get('/inventory')
        .then((res) => {
          console.log(res);
          const images = res.data;
          setGroupedImages(groupedImages);
          setImages(images);
        })
    };

    useEffect(() => {
      fetchData()
    }, []);

    return { images };
}
