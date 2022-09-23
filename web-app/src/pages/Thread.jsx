import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Thread } from '../components/Thread';
import { useParams } from 'react-router'
import { swapThread } from '../slices/threadSlice';
import { useSelector, useDispatch } from 'react-redux';
import chroma from 'chroma-js';
import toast from 'react-hot-toast';
import { parseError } from '../util/error';
import { useThread } from '../hooks/useThread';
import { fetchThread } from '../api/thread';

export function ThreadPage() {

  const {current, localReplyCount} = useSelector(state => state.thread);

  const dispatch = useDispatch();

  const { id } = useParams();

  const {board, threadNo, replyNo} = useThread();

  const threadRef = useRef([]);

  const replyIndex = replyNo && current ? current.findIndex((p) => p.id === replyNo) : -1;

  useEffect(() => {
    if(replyIndex && threadRef.current[replyIndex]) {
      threadRef.current[replyIndex].scrollIntoView();
    }
  },[replyIndex])

  useEffect(async() => {
    try {
      const res = await fetchThread(board, threadNo);
      if(res.data === "") {
        window.location="/";
      }
      dispatch(swapThread(res.data));
    } catch(e) {
      toast.error(parseError(e));
    }
  },[id, dispatch]);

  useEffect(() => {
    const lastPostRef = threadRef.current[current.length - 1];
    if(lastPostRef !== undefined && localReplyCount > 0) {
      lastPostRef.scrollIntoView({"behavior": "smooth"});
    }
  },[localReplyCount, current]);

  return(
    <Root>
      { current.length > 0 ? <Thread replyIndex={replyIndex} threadRef={threadRef} preview={false} thread={current}/> : null }
    </Root>
  )
}

const Root = styled.div`
  width: 100%;
  margin: 0 auto;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
`;
