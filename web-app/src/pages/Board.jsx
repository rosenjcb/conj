import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiMenu } from "react-icons/fi";
import { BiMessageDetail } from 'react-icons/bi';
import { BsFillReplyFill } from 'react-icons/bs';
import { openQuickReply } from '../slices/postSlice';
import * as chroma from 'chroma-js';
import { Reply } from '../components/Reply';
import { Thread } from '../components/Thread';
import { Post } from '../components/Post';
import { useDispatch } from 'react-redux';
import { ErrorText, Avatar } from '../components';
import * as _ from 'lodash';
import { fetchThreads } from '../api/thread';

const detectMobile = () => {
  console.log(window.innerWidth);
  return window.innerWidth < 768;
}

export const BoardPage = () => {
  const isMobile = detectMobile();

  const [threads, setThreads] = useState([]);

  useEffect(async() => {
    const res = await fetchThreads();
    setThreads(res.data);
  },[])

  // return (
  //   <HomeRoot>
  //     <ThreadsContainer>
  //     </ThreadsContainer>
  //   </HomeRoot>
  // );

  return(
    <BoardRoot>
      <HomeReply/>
      <ThreadPreview threads={threads}/>
    </BoardRoot>
  )
}

// const Divider = styled.hr`
//     margin: 0 auto;
//     margin-top: 1rem;
//     appearance: none;
//     border-style: none;
//     width: 90%;
//     border-top: 3px solid ${props => chroma(props.theme.newTheme.colors.primary).brighten(1.5).hex()};
//     border-radius: 4px;
// `;

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
        ? _.orderBy(threads, o => o[o.length - 1].id, ["desc"]).map((thread, index) => <Thread key={index} preview={true} thread={thread}/>)
        : <Header>No threads yet. Make one?</Header>}
    </ThreadPreviewRoot>
  )
}

const Page = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  @media all and (min-width: 1024px) {
    width: 30%;
  }
  
  @media all and (min-width: 768px) and (max-width: 1024px) {
    width: 30%;
  }
  
  @media all and (min-width: 480px) and (max-width: 768px) {
    visibility: visible;
    width: 100%;
   }
  
  @media all and (max-width: 480px) { 
    visibility: visible;
    width: 100%;
  }
`;

const ThreadPreviewRoot = styled.ul`
  width: calc(100% - 3rem);
  height: calc(100vh - 96px);
  padding: 1.5rem;
  margin: 0;
`;

const HamburgerMenu = styled(FiMenu)`
  color: white;
  width: 48px;
  height: 48px;
  padding-right: 10px;

  @media all and (min-width: 1024px) {
    visibility: hidden;
  }
  
  @media all and (min-width: 768px) and (max-width: 1024px) {
    visibility: hidden;
  }
  
  @media all and (min-width: 480px) and (max-width: 768px) {
    visibility: visible;
   }
  
  @media all and (max-width: 480px) { 
    visibility: visible;
  }
`;

const BoardDrawer = () => {

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('hi')
  }

  return(
    <BoardDrawerRoot>
      <TitleContainer>
        <Header>Boards</Header>
      </TitleContainer>
      <Content>
        <BoardList>
          <BoardItem>/b/ - random</BoardItem>
          <BoardItem>/sp/ - sports</BoardItem>
          <BoardItem>/int/ - international</BoardItem>
          <BoardItem>/g/ - technology</BoardItem>
          <BoardItem>/a/ - anime</BoardItem>
        </BoardList>
        <SearchForm onSubmit={handleSubmit}>
          <Input type="text"/>
        </SearchForm>
      </Content>
    </BoardDrawerRoot>
  )
}

const Submit = styled.button`
  color: ${props => chroma(props.theme.newTheme.colors.white)};
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).brighten().hex()};
  border: none;
  border-radius: 16px;
  font-size: 2rem;
`;

const SearchForm = styled.form`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
`;

const Input = styled.input`
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).brighten().hex()};
  border-radius: 80px;
  font-size: 2rem;
  width: 60%;
  color: ${props => chroma(props.theme.newTheme.colors.white)};
  margin-bottom: 10px;
  padding: 0;
`;

const Content = styled.body`
  display: flex;
  justify-content: space-between;
  flex-direction column;
  height: calc(100vh - 92px);
`;

const BoardList = styled.ul`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  color: ${props => props.theme.newTheme.colors.white};
  margin: 0;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 3em;
  padding-bottom: 3em;
`;

const Header = styled.h1`
  text-align: ${props => props.align ?? "center"};
  color: ${props => props.theme.newTheme.colors.white};
  font-size: 1.5em;
  padding: 0;
  margin: 0;
`;

const BoardItem = styled(Header)`
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).brighten(1).hex()};
  border-radius: 12px; 
  padding: 8px;
  user-select: none;

  &:hover {
    background-color: ${props => chroma(props.theme.newTheme.colors.primary).darken(0.25).hex()};
    cursor: pointer;
  }
`;

const BoardDrawerRoot = styled.div`
  min-height: 100vh;
  width: 300px;
  background-color: ${props => props.theme.newTheme.colors.primary};
  border-right: 1px solid black; 
`;

// const BoardRoot = styled.div`
//   display: flex;
//   justify-content: center;
//   flex-direction: row;
//   margin: 0 auto;
//   width: 100%;
//   height: 100%;
//   max-height: 100vh;
//   background-color ${props => chroma(props.theme.newTheme.colors.primary).darken(0.3)};
// `;

const TitleContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  border-bottom: 1px solid black;
  height: 92px;
  text-align: center;
`

const HomeNavBar = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  flex-direction: row;
  width: calc(100% - 20px);
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).brighten(0.7)};
  border-bottom: 1px solid black;
  height: 90px;
  padding: 10px;
  align-items: center;
`;

const Text = styled.p`
  font-weight: 500; 
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${props => props.theme.newTheme.colors.white};
  font-family: 'Open Sans', sans-serif;
  padding: 0;
  margin: 0;
`;

const GreyText = styled(Text)`
  text-align: center;
  color: ${props => props.theme.newTheme.colors.grey};
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
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).brighten(0.5).hex()};

  overflow-y: scroll;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`