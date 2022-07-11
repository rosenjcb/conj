import React from 'react';
import { Post } from './Post'
import styled from 'styled-components';

export function Thread(props) {

  const { preview, thread, threadRef, hashedIndex, board } = props;

  const op = thread[0];

  if(preview) {
    return (
      <Root>
        <Post board={board} replyCount={thread.length - 1} preview={true} opNo={op.id} post={op} key={op.id}/>
      </Root>
    )
  }

  const showHighlight = (index) => hashedIndex === index && index < thread.length - 1;

  return(
    <Root>
      { thread && thread.length > 0 && threadRef && threadRef.current
          ? thread.map((post, index) => <Post board={board} replyCount={thread.length - 1} preview={false} highlight={showHighlight(index)} lastPost={index === thread.length - 1} handleRef={(el) => threadRef.current[index] = el} opNo={op.id} key={post.id} post={post}/>) 
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
