import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Thread } from '../../components/Thread';
import { useParams } from 'react-router'
import axios from 'axios'
import { swapThread } from '../../slices/threadSlice';
import { useSelector, useDispatch } from 'react-redux';

export function ThreadPage() {

  const thread = useSelector(state => state.thread);
  const dispatch = useDispatch();

  const { id } = useParams();

  useEffect(() => {
    axios.get(`/threads/${id}`)
        .then((resp) => {
            if(resp.data === "") {
              window.location = "/";
            }
            dispatch(swapThread(resp.data))
        });
  },[]);

  return(
    <Root>
      <Thread thread={thread.current}/>
    </Root>
  )
}

const Root = styled.div`
  // min-height: 100vh;
  // min-width: 100%;
  // min-width: 100vw;
  // background: ${props => props.theme.background};
`;
