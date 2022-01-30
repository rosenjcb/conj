import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Thread } from '../../components/Thread';
import { useParams } from 'react-router'
import axios from 'axios'

export function ThreadPage(props) {

  const [thread, setThread] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    axios.get(`/threads/${id}`)
        .then((resp) => {
            if(resp.data === "") {
              window.location = "/";
            }
            setThread(resp.data);
        });
  },[]);

  return(
    <Root>
      <Thread thread={thread}/>
    </Root>
  )
}

const Root = styled.div`
  // min-height: 100vh;
  // min-width: 100%;
  // min-width: 100vw;
  // background: ${props => props.theme.background};
`;
