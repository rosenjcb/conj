import React, { useState, useEffect } from 'react';
import { } from './style';
import axios from 'axios'
import { useParams } from 'react-router'
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
