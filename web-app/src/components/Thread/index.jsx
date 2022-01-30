import React from 'react';
import { Post } from '../Post'

export function Thread(props) {

  const { thread } = props;

  return(
    <div>
      { thread && thread.length > 0 
          ? thread.map((post, index) => <Post isOriginalPost={index === 0 ? true : false} key={post.id} post={post}/>) 
          : null }
    </div>
  )
}
