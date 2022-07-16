import React from 'react';
import { Post } from './Post'
import styled from 'styled-components';

export function Thread(props) {

  const { preview, thread, threadRef, replyIndex } = props;

  const op = thread[0];

  if(preview) {
    return (
      <Root>
        <Post replyCount={thread.length - 1} preview={true} post={op} opNo={op.id} key={op.id}/>
      </Root>
    )
  }

  const showHighlight = (index) => replyIndex === index && index < thread.length - 1;

  return(
    <Root>
      { thread && thread.length > 0 && threadRef && threadRef.current
          ? thread.map((post, index) => <Post replyCount={thread.length - 1} preview={false} highlight={showHighlight(index)} opNo={op.id} lastPost={index === thread.length - 1} handleRef={(el) => threadRef.current[index] = el} key={post.id} post={post}/>) 
          : null }
    </Root>
  )
}

const Root = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
`;
