import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Thread } from '../components/Thread';
import { useParams } from 'react-router'
import axios from 'axios'
import { swapThread } from '../slices/threadSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import chroma from 'chroma-js';

export function ThreadPage() {

  const thread = useSelector(state => state.thread);
  const dispatch = useDispatch();

  const { id } = useParams();

  const location = useLocation();

  const hash = Number(location.hash.substr(1)) ?? -1;

  const threadRef = useRef([]);

  const hashedIndex = thread.current.findIndex((p) => p.id === hash);

  const [localReplyCount, setLocalReplyCount] = useState(0);

  useEffect(() => {
    if(hashedIndex !== undefined && threadRef.current[hashedIndex]) {
      threadRef.current[hashedIndex].scrollIntoView();
    }
  },[hashedIndex])

  useEffect(() => {
    axios.get(`/threads/${id}`)
        .then((resp) => {
            if(resp.data === "") {
              window.location = "/";
            }
            dispatch(swapThread(resp.data))
        });
  },[id, dispatch]);

  useEffect(() => {
    const lastPostRef = threadRef.current[thread.current.length - 1];
    if(lastPostRef !== undefined && localReplyCount > 0) {
      lastPostRef.scrollIntoView({"behavior": "smooth"});
    }
  },[localReplyCount, thread]);

  return(
    <Root>
      <Thread handleUpdateThread={() => setLocalReplyCount(localReplyCount + 1)} hashedIndex={hashedIndex} threadRef={threadRef} preview={false} thread={thread.current}/>
    </Root>
  )
}

const Root = styled.div`
  min-height: calc(100% - 93px - 3rem);
  padding: 1.5rem;
  width: calc(100% - 3rem);
  margin: 0 auto;
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).brighten(0.5).hex()};
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
`;
