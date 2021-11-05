import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useParams } from 'react-router';
import { Root } from './styles';
// import { Formik, Form, Field } from 'formik';
// import axios from 'axios';

export const Post = (props) => {

    let { id } = useParams();

    const [post, setPost] = useState(null);

    useEffect(() => {
        const post = axios.get(`localhost:8080/threads/${id}`);
        console.log(JSON.stringify(post, null, 2));
        setPost(post);
    },[]);

    return (
        <Root>
            { post != null ? JSON.stringify(post, null, 2) : "Hello World" }
        </Root>
    );
}


