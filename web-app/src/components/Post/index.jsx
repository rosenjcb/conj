import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useParams } from 'react-router';
import { Root, PostInfo, Name, Subject, PostMenuArrow } from './styles';
// import { Formik, Form, Field } from 'formik';
// import axios from 'axios';

export const Post = (props) => {

    const { post, isOriginalPost } = props;

    const { name, subject, id, comment } = post;

    return (
        <Root>
            <PostInfo>
                <input type="checkbox"/>
                <Subject>{subject}</Subject>
                <Name>{name}</Name>
                { `No.${id}` } 
                <PostMenuArrow/>
            </PostInfo>
            <blockquote>{comment}</blockquote>
            {/* { JSON.stringify(post, null, 2) } */}
        </Root>
    );
}


