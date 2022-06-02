import React from 'react'
import styled from 'styled-components';
import { RarityImage } from '../index';
import { processPostText } from '../../util/post';
import { useDispatch } from 'react-redux';
import { insertPostLink } from '../../slices/postSlice';
import { useHistory } from 'react-router-dom';

const Thumbnail = ({rarity, location}) => {
    return(
        <ThumbnailLink>
            { location ? <RarityImage alt="" src={location} rarity={rarity} width={150} height={150}/> : null }
        </ThumbnailLink>
    )
};

export const Post = (props) => {

    const { post, opNo, handleRef, highlight, preview } = props;

    const { name, subject, id, comment, image } = post;

    const isOriginalPost = opNo === id;

    const dispatch = useDispatch();

    const handleClick = (e) => {
        if(!preview) {
            e.preventDefault();
            dispatch(insertPostLink(id));
        }
    }

    const postHref = opNo === id ? `thread/${opNo}` : `thread/${opNo}#${id}`;

    var options = { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' };

    return (
        <div ref={handleRef}>
            {!isOriginalPost ? <SideArrow/> : null }
            <Root isOriginalPost={isOriginalPost} highlight={highlight}>
                <PostContent>
                    {isOriginalPost ? <Thumbnail rarity={image.rarity} location={image.location}/> : null}
                    <PostInfo>
                        <input type="checkbox"/>
                        <Subject>{subject}</Subject>
                        <Name>{name}</Name>
                        { post.time ? <p>{new Date(post.time).toLocaleTimeString(undefined, options)}</p> : null }
                        <PostLink href={postHref} onClick={handleClick}>{` No.${id} `}</PostLink>
                        <PostMenuArrow/>
                    </PostInfo>
                    {!isOriginalPost ? <Thumbnail rarity={image.rarity} location={image.location}/> : null}
                    <NoOverflowBlockQuote>{processPostText(opNo, comment)}</NoOverflowBlockQuote>
                </PostContent>
            </Root>
        </div>
    );
}

const postColor = (styleProps) => {
    if(styleProps.isOriginalPost) return "inherit";
    if(styleProps.highlight) {
        return styleProps.theme.post.selected;
    } else {
        return styleProps.theme.post.border;
    }
}

const Root = styled.div`
    background-color: ${props => postColor(props)};
    border: 1px solid ${props => props.isOriginalPost ? "none" : props.theme.post.border};
    font-size: ${props => props.theme.post.fontSize};
    font-family: ${props => props.theme.post.fontFamily};
    border-left: none;
    border-top: none;
    display: ${props => props.isOriginalPost ? "block" : "table"};
    margin-top: 2px;
    margin-bottom: 4px;
    padding: 2px;
`;

const PostInfo = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 4px;
    flex-direction: row;
    align-items: center;
`;

const PostContent = styled.div`
    display: block;
    align-items: center;
`;

const ThumbnailLink = styled.a`
    float: left;
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 3px;
    margin-bottom: 5px;
`;

const Name = styled.span`
    font-weight: 700;
    color: ${props => props.theme.post.name.color};
`;

const Subject = styled.span`
    color: ${props => props.theme.post.subject.color};
    font-weight: 700;
`;

const ArrowRoot = styled.span`
    margin-left: 5px;
    text-decoration: none;
    line-height: 1em;
    display: inline-block;
    width: 1em;
    height: 1em;
    text-align: center;
    outline: none;
    opacity: 0.8;
    color: #34345c;
`;

const SideArrowRoot = styled.div`
    color: #b7c5d9;
    float: left;
    margin-right: 2px;
    margin-top: 0;
    margin-left: 2px;
    font-family: ${props => props.theme.fontFamily };
    font-size: ${props => props.theme.fontSize};
`
const NoOverflowBlockQuote = styled.blockquote`
    max-width: calc(100vw - 2em - 80px);
    overflow: hidden;
`

const PostMenuArrow = () => <ArrowRoot>▶</ArrowRoot>;

const SideArrow = () => <SideArrowRoot>{'>>'}</SideArrowRoot>;

const PostLink = styled.a`
    color: inherit;
    text-decoration: none;

    &:hover {
        color: red;
    }
`

