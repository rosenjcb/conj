import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Thread } from '../../components/Thread';
import { HR } from '../../components';

export function Home() {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    async function fetchThreads() {
      const res = await axios.get('/threads');
      setThreads(res.data);
    }
    fetchThreads();
  },[])

  return (
    <HomeRoot>
      <ThreadsContainer>
        { threads.map((thread, index) => <div key={index}><Thread thread={thread}/><HR/></div>)}
      </ThreadsContainer>
    </HomeRoot>
  );
}

const HomeRoot = styled.div`
`;

const ThreadsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

