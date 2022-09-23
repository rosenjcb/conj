import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AnonymousAvatar, Text } from '../components';
import { Reply } from '../components/Reply';
import { Thread } from '../components/Thread';
import {  Avatar } from '../components';
import * as _ from 'lodash';
import { fetchThreads } from '../api/thread';
import toast from 'react-hot-toast'
import { useThread } from '../hooks/useThread';
import { parseError } from '../util/error';

export const BoardPage = () => {

  const [threads, setThreads] = useState([]);

  const { board } = useThread();

  useEffect(() => {
    async function fetchAndSetThreads() {
      try {
        const res = await fetchThreads(board);
        setThreads(res.data);
      } catch(e) {
        setThreads(null);
        toast.error(parseError(e));
      }
    }
    fetchAndSetThreads();
  },[board]);

  return(
    <BoardRoot>
      <HomeReply/>
      <ThreadPreview threads={threads}/>
    </BoardRoot>
  )
}

const HomeReply = () => {
    return (
        <HomeReplyRoot>
            <Reply isNewThread/>
        </HomeReplyRoot>
    )
}

const ThreadPreview = (props) => {

  const { threads } = props;

  return(
    <ThreadPreviewRoot>
      { threads && threads.length > 0 
        ? _.orderBy(threads, o => o[o.length - 1].id, ["desc"]).map((thread, index) => <Thread board={''} key={index} preview={true} thread={thread}/>)
        : <Text bold size="xx-large" align="center">{threads ? "No threads yet. Make one?" : "This board does not exist"}</Text>}
    </ThreadPreviewRoot>
  )
}

const ThreadPreviewRoot = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  height: calc(100vh - 96px);
  width: 100%;
  gap: 0.5rem;
  margin: 0 auto;
`;

const HomeReplyRoot = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: row;
    align-items: flex-start;
    margin-top: 10px;
    margin-bottom: 3rem;
    width: 100%;
    gap: 10px;
`;

const BoardRoot = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;

  overflow-y: scroll;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;
