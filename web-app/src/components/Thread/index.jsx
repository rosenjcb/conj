import React from 'react';
import { Post } from '../Post'

export function Thread(props) {

  const { preview, thread, threadRef, hashedIndex } = props;

  const op = thread[0];

  if(preview) {
    return (
      <div>
        {thread.slice(0, 5).map((post) => <Post preview={true} opNo={op.id} post={post} key={post.id} debug={false}/>)}
      </div>
    )
  }


  return(
    <div>
      { thread && thread.length > 0 && threadRef && threadRef.current
          ? thread.map((post, index) => <Post preview={false} highlight={hashedIndex === index} handleRef={(el) => threadRef.current[index] = el} opNo={op.id} key={post.id} post={post}/>) 
          : null }
    </div>
  )
}
