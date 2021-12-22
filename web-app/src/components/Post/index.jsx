import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useParams } from 'react-router';
import { Root, PostInfo, PostContent, ThumbnailLink, Name, Subject, PostMenuArrow, SideArrow } from './styles';

const Thumbnail = (props) => {
    return(
        <ThumbnailLink>
            { props.image ? <img src={props.image} width={150} height={150}/> : null }
        </ThumbnailLink>
    )
}

export const Post = (props) => {

    const { post, isOriginalPost } = props;

    const { name, subject, id, comment, image } = post;

    return (
        <div>
            {!isOriginalPost ? <SideArrow/> : null }
            <Root isOriginalPost={isOriginalPost}>
                <PostContent>
                    {isOriginalPost ? <Thumbnail image={image}/> : null}
                    <PostInfo>
                        <input type="checkbox"/>
                        <Subject>{subject}</Subject>
                        <Name>{name}</Name>
                        { `No.${id}` } 
                        <PostMenuArrow/>
                    </PostInfo>
                    {!isOriginalPost ? <Thumbnail image={image}/> : null}
                    <blockquote>{comment}</blockquote>
                </PostContent>
            </Root>
        </div>
    );
}
