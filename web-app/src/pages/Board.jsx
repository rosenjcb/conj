import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as chroma from 'chroma-js';
import { Reply } from '../components/Reply';
import { Thread } from '../components/Thread';
import {  Avatar } from '../components';
import * as _ from 'lodash';
import { fetchThreads } from '../api/thread';
import toast from 'react-hot-toast'
import { parseError } from '../util/error';

export const BoardPage = () => {

  const [threads, setThreads] = useState([]);

  useEffect(() => {
    async function fetchAndSetThreads() {
      try {
        const res = await fetchThreads();
        setThreads(res.data);
      } catch(e) {
        toast.error(e.message);
      }
    }
    fetchAndSetThreads();
  },[]);

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
            <Avatar src="/pepe_icon.jpg"/>
            <Reply isNewThread/>
        </HomeReplyRoot>
    )
}

const ThreadPreview = (props) => {

  const { threads } = props;

  return(
    <ThreadPreviewRoot>
      { threads.length > 0 
        ? _.orderBy(threads, o => o[o.length - 1].id, ["desc"]).map((thread, index) => <Thread board={''} key={index} preview={true} thread={thread}/>)
        : <Header>No threads yet. Make one?</Header>}
    </ThreadPreviewRoot>
  )
}

const ThreadPreviewRoot = styled.ul`
  width: calc(100% - 3rem);
  height: calc(100vh - 96px);
  padding: 1.5rem;
  margin: 0;
`;


const Header = styled.h1`
  text-align: ${props => props.align ?? "center"};
  color: ${props => props.theme.colors.white};
  font-size: 1.5em;
  padding: 0;
  margin: 0;
`;

const HomeReplyRoot = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: row;
    align-items: flex-start;
    margin-top: 10px;
    margin-bottom: 3rem;
    margin-left: 5%; 
    width: 85%;
    gap: 10px;
`;

const BoardRoot = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${props => chroma(props.theme.colors.primary).brighten(0.5).hex()};

  overflow-y: scroll;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;