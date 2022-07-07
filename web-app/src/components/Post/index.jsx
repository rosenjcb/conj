import React, { useState } from 'react'
import styled from 'styled-components';
import { Text, ErrorText, Avatar } from '../index';
import { processPostText } from '../../util/post';
import { useDispatch } from 'react-redux';
import { insertPostLink, openQuickReply } from '../../slices/postSlice';
import { Link } from 'react-router-dom';
import chroma from 'chroma-js';
import { BiMessageDetail } from 'react-icons/bi'; 
import { Reply } from '../Reply';

const WithText = ({direction, component, text}) => {
  return (
    <WithTextRoot direction={direction}>
      {component} 
      <Header>{text}</Header>
    </WithTextRoot>
  )
}

export const Post = (props) => {
    
  const [fullScreen, setFullScreen] = useState(false);

  const dispatch = useDispatch();

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
  }

  const { post, opNo, handleRef, highlight, preview, replyCount } = props;

  const { name, subject, id, comment, image, time } = post;

  const isOriginalPost = opNo === id;

  const handleClick = (e) => {
      e.preventDefault();
      dispatch(insertPostLink(opNo));
  }

  const prefix = preview ? '/thread/' : ''

  const postHref = isOriginalPost ? `${prefix}${opNo}` : `${prefix}${opNo}#${id}`;

  const handlePostDate = () => {
    const now = new Date();
    const then = new Date(time);

    const hours = Math.abs(now - then) / 36e5;

    if(hours < 24) {
      if (hours < 1) { 
        const minutes = hours * 60; 
        if (minutes < 1) { 
          const seconds = minutes * 60;
          if(seconds < 1) { 
            return 'Just now';
          } else {
            return `${seconds} seconds ago`;
          }
        }
        return `${Math.round(minutes)} minutes ago`;
      }
      return `${Math.round(hours)} hours ago`;
    } else {
      return then.toLocaleDateString()
    }
  }

  const formattedTime = handlePostDate();

  return (
    isOriginalPost
      ? 
        <OriginalPost preview={preview} highlight={false} postHref={postHref} handleRef={handleRef} fullScreen={fullScreen} 
                                   toggleFullScreen={toggleFullScreen} id={id} name={name} handleClick={handleClick}
                                   opNo={opNo} subject={subject} comment={comment} formattedTime={formattedTime} image={image} replyCount={replyCount}/> 
      : 
        <ReplyPost highlight={highlight} postHref={postHref} handleRef={handleRef} fullScreen={fullScreen} 
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
    <PostRoot ref={handleRef}>
      { preview ? slimContent : fullSizeContent }
      <HeaderRoot>
        <UserInfo>
          <Avatar src="/pepe_icon.jpg"/>
          <TextContainer>
            <Text>{name}</Text>
            <PostLink href={postHref} onClick={handleClick}>#{id}</PostLink>
            <Text>{formattedTime}</Text>
          </TextContainer>
        </UserInfo>
        <ActionsContainer>
          <WithText component={<Link to={location => `${location.pathname}/thread/${opNo}`}><MessageDetail/></Link>} direction="row" text={replyCount}/>
        </ActionsContainer>
      </HeaderRoot>
      <ThreadReply/>
    </PostRoot>
  )
}

const ReplyPost = (props) => {
  const { postHref, highlight, handleRef, fullScreen, toggleFullScreen, id, name, handleClick, opNo, subject, comment, formattedTime, image } = props;

  return(
    <PostRoot highlight={highlight} ref={handleRef}>
      { highlight ? <YellowRibbon/> : null}
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
  width: calc(100% + 48px);
  height: calc(100% + 2rem);
  position: absolute;
  border-radius: 2px;
  top: -1rem;
  left: -24px;
  background-color: ${props => props.theme.newTheme.colors.warning};
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
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  flex-direction: column;
  // width: 100%;
`

const PostRoot = styled.div`
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

// export const Post = (props) => {

//     const { post, opNo, handleRef, highlight, preview } = props;

//     const { name, subject, id, comment, image } = post;

//     const isOriginalPost = opNo === id;

//     const dispatch = useDispatch();

//     const handleClick = (e) => {
//         e.preventDefault();
//         dispatch(insertPostLink(id));
//         dispatch(openQuickReply(opNo));
//     }

//     const prefix = preview ? '/thread/' : ''

//     const postHref = opNo === id ? `${prefix}${opNo}` : `${prefix}${opNo}#${id}`;

//     const options = { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' };

//     return (
//         <div ref={handleRef}>
//             {!isOriginalPost ? <SideArrow/> : null }
//             <Root isOriginalPost={isOriginalPost} highlight={highlight}>
//                 <PostContent>
//                     {isOriginalPost ? <Thumbnail rarity={image.rarity} location={image.location}/> : null}
//                     <PostInfo>
//                         <input type="checkbox"/>
//                         <Subject>{subject}</Subject>
//                         <Name>{name}</Name>
//                         { post.time ? <span>{new Date(post.time).toLocaleTimeString(undefined, options)}</span> : null }
//                         <PostLink href={postHref} onClick={handleClick}>{` No.${id} `}</PostLink>
//                         { isOriginalPost ? <span>[<ThreadLink href={`/thread/${opNo}`}>Reply</ThreadLink>]</span> : null } 
//                         <PostMenuArrow/>
//                     </PostInfo>
//                     {!isOriginalPost ? <Thumbnail rarity={image.rarity} location={image.location}/> : null}
//                     <NoOverflowBlockQuote>{processPostText(opNo, comment)}</NoOverflowBlockQuote>
//                 </PostContent>
//             </Root>
//         </div>
//     );
// }

// const postColor = (styleProps) => {
//     if(styleProps.isOriginalPost) return "inherit";
//     if(styleProps.highlight) {
//         return styleProps.theme.post.selected;
//     } else {
//         return styleProps.theme.post.border;
//     }
// }

// const Root = styled.div`
//     background-color: ${props => postColor(props)};
//     border: 1px solid ${props => props.isOriginalPost ? "none" : props.theme.post.border};
//     font-size: ${props => props.theme.post.fontSize};
//     font-family: ${props => props.theme.post.fontFamily};
//     border-left: none;
//     border-top: none;
//     display: ${props => props.isOriginalPost ? "block" : "table"};
//     margin-top: 2px;
//     margin-bottom: 4px;
//     padding: 2px;
// `;

// const ThreadLink = styled.a`
//     &:hover {
//         color: red;
//     }
// `

// const PostInfo = styled.div`
//     display: flex;
//     flex-wrap: wrap;
//     justify-content: flex-start;
//     gap: 4px;
//     flex-direction: row;
//     align-items: center;
// `;

// const PostContent = styled.div`
//     display: block;
//     align-items: center;
// `;

// const ThumbnailLink = styled.a`
//     float: left;
//     margin-left: 20px;
//     margin-right: 20px;
//     margin-top: 3px;
//     margin-bottom: 5px;
// `;

// const Name = styled.span`
//     font-weight: 700;
//     color: ${props => props.theme.post.name.color};
// `;

// const Subject = styled.span`
//     color: ${props => props.theme.post.subject.color};
//     font-weight: 700;
// `;

// const ArrowRoot = styled.span`
//     margin-left: 5px;
//     text-decoration: none;
//     line-height: 1em;
//     display: inline-block;
//     width: 1em;
//     height: 1em;
//     text-align: center;
//     outline: none;
//     opacity: 0.8;
//     color: #34345c;
// `;

// const SideArrowRoot = styled.div`
//     color: #b7c5d9;
//     float: left;
//     margin-right: 2px;
//     margin-top: 0;
//     margin-left: 2px;
//     font-family: ${props => props.theme.fontFamily};
//     font-size: ${props => props.theme.fontSize};
// `;

// const NoOverflowBlockQuote = styled.blockquote`
//     max-width: calc(100vw - 2em - 80px);
//     overflow: hidden;
// `;

// const PostMenuArrow = () => <ArrowRoot>▶</ArrowRoot>;

// const SideArrow = () => <SideArrowRoot>{'>>'}</SideArrowRoot>;

// const PostLink = styled.a`
//     color: inherit;
//     text-decoration: none;

//     &:hover {
//         color: red;
//     }
// `

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
`;

const HeaderText = styled(ErrorText)`
  font-size: 2.5rem;
`