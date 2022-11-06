import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Thread } from '../components/Thread';
import { swapThread } from '../slices/threadSlice';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useThread } from '../hooks/useThread';
import { useFetchThreadQuery } from '../api/thread';

export function ThreadPage() {

  const {current, localReplyCount} = useSelector(state => state.thread);

  const dispatch = useDispatch();

  const {board, threadNo, replyNo} = useThread();

  const threadRef = useRef([]);

  const replyIndex = replyNo && current ? current.findIndex((p) => p.id === replyNo) : -1;

  const threads = useFetchThreadQuery({board, threadNo});
  const { data, isSuccess, error } = threads;

  useEffect(() => {
    if(replyIndex && threadRef.current[replyIndex]) {
      threadRef.current[replyIndex].scrollIntoView();
    }
  },[replyIndex])

  useEffect(() => {
    if(isSuccess) {
      dispatch(swapThread(data));
    } else if (error) {
      toast.error(error.data);
    };
  },[data, dispatch]);

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
