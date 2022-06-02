import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Thread } from '../../components/Thread';
import { useParams } from 'react-router'
import axios from 'axios'
import { swapThread } from '../../slices/threadSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

export function ThreadPage() {

  const thread = useSelector(state => state.thread);
  const dispatch = useDispatch();

  const { id } = useParams();

  const location = useLocation();

  const hash = Number(location.hash.substr(1)) ?? -1;

  const threadRef = useRef([]);

  const hashedIndex = thread.current.findIndex((p) => p.id === hash);

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

  return(
    <Root>
      <Thread hashedIndex={hashedIndex} threadRef={threadRef} preview={false} thread={thread.current}/>
    </Root>
  )
}

const Root = styled.div`
  // min-height: 100vh;
  // min-width: 100%;
  // min-width: 100vw;
  // background: ${props => props.theme.background};
`;
