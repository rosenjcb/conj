import React, { useState } from 'react'
import styled from 'styled-components';
import { Text, ErrorText, Avatar } from './index';
import { processPostText } from '../util/post';
import { useDispatch } from 'react-redux';
import { insertPostLink } from '../slices/postSlice';
import { Link } from 'react-router-dom';
import chroma from 'chroma-js';
import { BiMessageDetail } from 'react-icons/bi'; 
import { Reply } from './Reply';
import { useThread } from '../hooks/useThread';
import { useEffect } from 'react';

const WithText = ({direction, component, text}) => {
  return (
    <WithTextRoot direction={direction}>
      {component} 
      <Header>{text}</Header>
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

  const { threadNo } = useThread();

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

  const fullSizeContent = (
    <OriginalContentRoot>
      <HeaderText>{subject}</HeaderText>
      <CenteredImage fullScreen={fullScreen} onClick={() => toggleFullScreen()} src={image.location}/>
      <Text align="left">
        {processPostText(opNo, comment)}
      </Text>
    </OriginalContentRoot>
  ) 

  const slimContent = (
    <ContentRoot>
      <Image fullScreen={fullScreen} onClick={() => toggleFullScreen()} src={image.location}/> 
      <Text align="left">
        <ErrorText>{subject}</ErrorText>
        {processPostText(opNo, comment)}
      </Text>
    </ContentRoot>
  )

  return(
    <PostRoot key={id} ref={handleRef}>
      { preview ? slimContent : fullSizeContent }
      <HeaderRoot>
        <UserInfo>
          <Avatar src="/pepe_icon.jpg"/>
          <TextContainer>
            <Text>{name}</Text>
            <PostLink to={postHref} onClick={handleClick}>#{id}</PostLink>
            <Text>{formattedTime}</Text>
          </TextContainer>
        </UserInfo>
        <ActionsContainer>
          <WithText component={<Link to={location => `${location.pathname}/thread/${opNo}`}><MessageDetail/></Link>} direction="row" text={replyCount}/>
        </ActionsContainer>
      </HeaderRoot>
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
          <ErrorText>{subject}</ErrorText>
          {processPostText(opNo, comment)}
        </Text>
      </ContentRoot>
      <HeaderRoot>
        <UserInfo>
          <Avatar src="/pepe_icon.jpg"/>
          <TextContainer>
            <Text>{name}</Text>
            <PostLink to={postHref} onClick={handleClick}>#{id}</PostLink>
            <Text>{formattedTime}</Text>
          </TextContainer>
        </UserInfo>
      </HeaderRoot>
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
  background-color: ${props => props.highlight ? props.theme.newTheme.colors.warning : "inherit"};
  pointer-events: none;
  opacity: 0.3;
`;

const WithTextRoot = styled.div`
  display: flex;
  flex-direction: ${props => props.direction ?? "row"};
`;

const MessageDetail = styled(BiMessageDetail)`
  color: white;
  width: 48px;
  height: 48px;
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
`;

const Image = styled.img`
  aspect-ratio: 16 / 9;
  width: fit-content;
  width: ${props => !props.fullScreen ? "200px;" : "100%"};
  height: ${props => !props.fullScreen ? "112px;" : "100%"};
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
  color: ${props => props.theme.newTheme.colors.white};
  font-size: 1.5em;
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
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).brighten(1).hex()};
`;

const ContentRoot = styled.div`
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).hex()};
  display: block;
  // width: 100%;
  width: calc(100% - 3rem);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  padding: 1.5rem;
`;

const OriginalContentRoot = styled(ContentRoot)`
  scroll-behavior: smooth;
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  flex-direction: column;
  // width: 100%;
`

const PostRoot = styled.div`
  scroll-behavior: smooth;
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: flex-start;
  flex-flow: wrap;
  align-items: center;
  width: 100%;
  margin-bottom: 5rem;
`;

const PostLink = styled(Link)`
  color: white;

  &:hover {
      color: ${props => props.theme.newTheme.colors.primary};
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
  flex-direction: row;
  align-items: center;
`;

const HeaderText = styled(ErrorText)`
  font-size: 2.5rem;
`;