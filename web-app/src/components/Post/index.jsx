import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useParams } from 'react-router';
import { Root, PostInfo, PostContent, ThumbnailLink, Name, Subject, PostMenuArrow } from './styles';

const Thumbnail = (props) => {
    return(
        <ThumbnailLink>
            { props.image ? <img src={props.image} width={50} height={50}/> : null }
        </ThumbnailLink>
    )
}

export const Post = (props) => {

    const { post, isOriginalPost } = props;

    const { name, subject, id, comment, image } = post;

    return (
        <Root>
            <PostInfo>
                <input type="checkbox"/>
                <Subject>{subject}</Subject>
                <Name>{name}</Name>
                { `No.${id}` } 
                <PostMenuArrow/>
            </PostInfo>
            <PostContent>
                <Thumbnail image={image}/>
                <blockquote>{comment}</blockquote>
            </PostContent>
        </Root>
    );
}
