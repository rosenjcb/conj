import React, { useState } from 'react'
import styled from 'styled-components';
import { Text, PrimaryText, Avatar, HR } from './index';
import { processPostText } from '../util/post';
import { useDispatch } from 'react-redux';
import { insertPostLink } from '../slices/postSlice';
import { Link } from 'react-router-dom';
import chroma from 'chroma-js';
import { BiMessageDetail } from 'react-icons/bi'; 
import { Reply } from './Reply';

const WithText = ({direction, component, text}) => {
  return (
    <WithTextRoot direction={direction}>
      {component} 
      <IconText>{text}</IconText>
    </WithTextRoot>
  )
}

const handlePostDate = (time) => {
  const now = new Date();
  const then = new Date(time);

  const hours = Math.abs(now - then) / 36e5;

  if(hours < 24) {
    if (hours < 1) { 
      const minutes = hours * 60; 
      if (minutes < 1) { 
        const seconds = Math.round(minutes * 60);
        if(seconds < 1) { 
          return 'Just now';
        } else {
          return `${seconds} ${seconds === 1 ? "second" : "seconds"} ago`;
        }
      }
      return `${Math.round(minutes)} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }
    return `${Math.round(hours)} ${hours === 1 ? "hour" : "hours"} ago`;
  } else {
    return then.toLocaleDateString()
  }
}

export const Post = (props) => {
    
  const [fullScreen, setFullScreen] = useState(false);

  const dispatch = useDispatch();

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
  }

  const { post, handleRef, highlight, preview, replyCount, opNo } = props;

  const { name, subject, id, comment, image, time } = post;

  const isOriginalPost = opNo === id;

  const handleClick = (e) => {
      e.preventDefault();
      dispatch(insertPostLink(opNo));
  }

  const prefix = preview ? '/thread/' : ''

  const postHref = isOriginalPost ? `${prefix}${opNo}` : `${prefix}${opNo}#${id}`;

  const formattedTime = handlePostDate(time);

  return (
    isOriginalPost
      ? 
        <OriginalPost key={post.id} preview={preview} highlight={false} postHref={postHref} handleRef={handleRef} fullScreen={fullScreen} 
                                   toggleFullScreen={toggleFullScreen} id={id} name={name} handleClick={handleClick}
                                   opNo={opNo} subject={subject} comment={comment} formattedTime={formattedTime} image={image} replyCount={replyCount}/> 
      : 
        <ReplyPost key={post.id} highlight={highlight} postHref={postHref} handleRef={handleRef} fullScreen={fullScreen} 
                                    toggleFullScreen={toggleFullScreen} id={id} name={name} handleClick={handleClick}
                                    opNo={opNo} subject={subject} comment={comment} formattedTime={formattedTime} image={image}/>
  )
}

const OriginalPost = (props) => {
  const { postHref, handleRef, fullScreen, toggleFullScreen, id, name, handleClick, opNo, subject, comment, formattedTime, image, replyCount, preview } = props;

  return(
    <PostRoot key={id} ref={handleRef}>
        <UserInfo>
          <Avatar src="/pepe_icon.jpg"/>
          <TextContainer>
            <Text bold size={"medium"}>{name}</Text>
            <PostLink to={postHref} onClick={handleClick}>#{id}</PostLink>
          </TextContainer>
        </UserInfo>
      <OriginalContentRoot>
        <Text align={"center"} size={"x-large"} color={"primary"}>{subject}</Text>
        <CenteredImage fullScreen={fullScreen} onClick={() => toggleFullScreen()} src={image.location}/>
        <Text align="left">
          {processPostText(opNo, comment)}
        </Text>
      </OriginalContentRoot>
      <ActionsContainer>
        <WithText component={<Link to={location => `${location.pathname}/thread/${opNo}`}><MessageDetail/></Link>} direction="row" text={replyCount}/>
        <Text bold>{formattedTime}</Text>
      </ActionsContainer>
      { !preview ? <ThreadReply/> : null }
    </PostRoot>
  )
}

const ReplyPost = (props) => {
  const { postHref, highlight, handleRef, fullScreen, toggleFullScreen, id, name, handleClick, opNo, subject, comment, formattedTime, image } = props;

  return(
    <PostRoot highlight={highlight}>
      <YellowRibbon highlight={highlight} ref={handleRef}/>
      <ContentRoot>
        { image && image.location ? <Image fullScreen={fullScreen} onClick={() => toggleFullScreen()} src={image.location}/> : null }
        <Text align="left">
          <Text size={"large"} color={"primary"}>{subject}</Text>
          {processPostText(opNo, comment)}
        </Text>
      </ContentRoot>
      <UserInfo>
        <Avatar src="/pepe_icon.jpg"/>
        <Text>{name}</Text>
        <PostLink to={postHref} onClick={handleClick}>#{id}</PostLink>
        <Text>{formattedTime}</Text>
      </UserInfo>
    </PostRoot>
  )
}

const YellowRibbon = styled.div`
  scroll-behavior: smooth;
  width: calc(100% + 48px);
  height: calc(100% + 2rem);
  position: absolute;
  border-radius: 2px;
  top: -1rem;
  left: -24px;
  background-color: ${props => props.highlight ? props.theme.colors.warning : "inherit"};
  pointer-events: none;
  opacity: 0.3;
`;

const WithTextRoot = styled.div`
  display: flex;
  flex-direction: ${props => props.direction ?? "row"};
`;

const MessageDetail = styled(BiMessageDetail)`
  color: ${props => chroma(props.theme.colors.grey).darken().hex()};
  width: 36px;
  height: 36px;
`;

const TextContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
`
const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
`;

const Image = styled.img`
  aspect-ratio: 16 / 9;
  width: ${props => props.fullScreen ? "100%" : "fit-content"};
  max-width: 100%;
  height: ${props => props.fullScreen ? "100%" : "400px"};
  border-radius: 8px;
  margin-right: 10px;
  float: left;
`;

const CenteredImage = styled(Image)`
  float: none;
  margin: 0 auto;
`

const Header = styled.h1`
  text-align: ${props => props.align ?? "center"};
  color: ${props => props.theme.colors.black};
  font-size: 1.5em;
  padding: 0;
  margin: 0;
`;

const IconText = styled.p`
  color: ${props => chroma(props.theme.colors.grey).darken().hex()};
  text-align: center;
  font-size: 1.25rem;
  padding: 0;
  margin: 0;
`;

const HeaderRoot = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  width: calc(100% - 2rem);
  align-items: center;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  background-color: ${props => props.theme.colors.white};
`;

const ContentRoot = styled.div`
  background-color: ${props => props.theme.colors.white};
  display: block;
  width: 100%;
`;

const OriginalContentRoot = styled(ContentRoot)`
  scroll-behavior: smooth;
  display: flex;
  justify-content: flex-start;
  gap: 2rem;
  flex-direction: column;
`

const PostRoot = styled.div`
	box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  scroll-behavior: smooth;
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: flex-start;
  flex-flow: wrap;
  width: calc(100% - 3rem);
  margin: 0 auto;
  margin-bottom: 5rem;
  background-color: ${props => props.theme.colors.white};
  border-radius: 8px;
  padding: 1.5rem;
  gap: 1rem;
`;

const PostLink = styled(Link)`
  color: black;
  text-decoration: none;
  font-weight: 500; 
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${props => props.theme.colors.black};
  font-family: 'Open Sans', sans-serif;
  padding: 0;
  margin: 0;

  &:hover {
      color: ${props => props.theme.colors.primary};
  }
`;

const ThreadReply = styled(Reply)`
  margin: 0 auto;
  width: 100%;
  margin-top: 2rem;
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  flex-direction: row;
  align-items: center;
`;

// const HeaderText = styled(Text)`
//   font-size: 2.5rem;
// `;

const TextContent = styled.div`
  display: inline-flex;
  justify-content: flex-start;
  flex-direction: column;
  width: calc(100% - 32px - 3rem);
  align-items: flex-start;
`;
