import React from 'react';
import { Post } from '../Post'
import styled from 'styled-components';
import { HR } from '..';

export function Thread(props) {

  const { preview, thread, threadRef, hashedIndex } = props;

  const op = thread[0];

  if(preview) {
    return (
      <Root>
        {thread.map((post) => <div><Post preview={true} opNo={op.id} post={post} key={post.id}/><HR/></div>)}
      </Root>
    )
  }

  return(
    <Root>
      { thread && thread.length > 0 && threadRef && threadRef.current
          ? thread.map((post, index) => <div><Post preview={preview} highlight={hashedIndex === index} handleRef={(el) => threadRef.current[index] = el} opNo={op.id} key={post.id} post={post}/><HR/></div>) 
          : null }
    </Root>
  )
}

const Root = styled.div`
  width: 100%;
  margin: 0 auto;
`
