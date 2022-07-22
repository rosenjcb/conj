import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { me as callMe, logout } from '../api/account'
import { fetchBoards } from '../api/board';
import chroma from 'chroma-js';
import { FiMenu } from 'react-icons/fi';
import { VscCommentDiscussion } from 'react-icons/vsc'
import {RiDiscussFill} from 'react-icons/ri';
import { BsFillBarChartFill } from 'react-icons/bs';
import { Text } from './index';
import { useThread } from '../hooks/useThread';
import { SquareButton } from './index';



export const WithNavBar = ({component}) => {

  const [me, setMe] = useState(null);
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    async function getAuth() {
      try { 
        const res = await callMe();
        setMe(res);
      } catch(e) {
        setMe(null);
      }
    }
    async function getBoards() {
      try {
        const res = await fetchBoards();
        setBoards(res.data);
      } catch (e) {
        setBoards(null);
      }
    }
    getAuth();
    getBoards();
  },[]);

  const detectMobile = () => {
    return window.innerWidth < 768;
  }

  const isMobile = detectMobile();

  const handleLogout = async() => {
    await logout();
    window.location.reload();
  }

  return (
    <BoardRoot>
      <HomeNavBar>
        <HamburgerMenu/>
        <Header>conj.app</Header>
        <SquareButton onClick={handleLogout}>Logout</SquareButton>
      </HomeNavBar>
      <Page>
        { !isMobile ? <BoardDrawer boards={boards}/> : null }
        {component}
      </Page>
    </BoardRoot>
  )
}

const BoardDrawer = (props) => {

  const { boards } = props; 

  const history = useHistory();

  const { board } = useThread(); 

  const handleSubmit = (e) => {
    e.preventDefault();
  }

  const handleClick = (board) => {
    console.log(board);
    history.push(`/boards/${board}`)
  }

  return(
    <BoardDrawerRoot>
      <TitleContainer>
        <Header>Most Popular Boards</Header>
      </TitleContainer>
      <BoardList>
        <BoardRow><BoardIcon/><BarChartIcon/></BoardRow>
        {boards.map(b => <HighlightBoardRow selected={b === board}><BoardItem onClick={() => handleClick(b)}>/{b}/</BoardItem><Text size={"large"} color={"black"} bold>69</Text></HighlightBoardRow>)}
      </BoardList>
      <SearchForm onSubmit={handleSubmit}>
        <Input type="text"/>
      </SearchForm>
    </BoardDrawerRoot>
  )
}

const Page = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  height: calc(100vh - 92px);
  @media all and (min-width: 1024px) {
    width: 40%;
  }
  
  @media all and (min-width: 768px) and (max-width: 1024px) {
    width: 100%%;
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

const SearchForm = styled.form`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
`;

const Input = styled.input`
  border-radius: 80px;
  font-size: 2rem;
  width: 60%;
  margin-bottom: 10px;
  padding: 0;
`;

const Content = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction column;
  background-color: ${props => props.theme.colors.grey};
`;

const BoardList = styled.ul`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  color: ${props => props.theme.colors.white};
  margin: 0;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 3em;
`;

const BoardRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  flex-direction: row;
  padding-left: 1rem;
  padding-right: 1rem;
  border-radius: 9000px;
`;

const HighlightBoardRow = styled(BoardRow)`
  background-color: ${props => props.selected ? chroma(props.theme.colors.primary).brighten(2.5).hex() : "inherit"};
  &:hover {
    background-color: ${props => chroma(props.theme.colors.primary).brighten(2.5).hex()};
    cursor: pointer;
  }
`;

const Header = styled.h1`
  text-align: ${props => props.align ?? "center"};
  color: ${props => props.theme.colors.black};
  font-size: 1.5em;
  padding: 0;
  margin: 0;
`;

const BoardItem = styled(Header)`
  color: ${props => props.theme.colors.black};
  border-radius: 12px; 
  padding: 8px;
  user-select: none;
`;

const BoardDrawerRoot = styled.div`
  width: 300px;
  height: fit-content;
  border-radius: 8px;
  margin-top: 1rem;
  margin-right: 1rem;
`;

const BoardRoot = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  width: 100%;
  max-height: 100vh;
  height: 100%;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  // border-bottom: 1px solid ${props => chroma(props.theme.colors.primary).darken(0.23).hex()};
  height: 92px;
  text-align: center;
`

const HomeNavBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-direction: row;
  background-color: ${props => props.theme.colors.white};
  height: fit-content;
  padding-top: 1rem;
  padding-bottom: 1rem;
  align-items: center;

  @media all and (min-width: 1024px) {
    width: 60%;
    padding-left: 20%;
    padding-right: 20%;
  }
  
  @media all and (min-width: 768px) and (max-width: 1024px) {
    width: 100%;
  }
  
  @media all and (min-width: 480px) and (max-width: 768px) {
    width: 100%;
  }
  
  @media all and (max-width: 480px) { 
    width: 100%;
  }
`;

const HamburgerMenu = styled(FiMenu)`
  color: ${props => props.theme.colors.black};
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

const BoardIcon = styled(RiDiscussFill)`
  color: ${props => props.theme.colors.primary};
  width: 48px;
  height: 48px;
`;

const BarChartIcon = styled(BsFillBarChartFill)`
  color: ${props => props.theme.colors.primary};
  width: 48px;
  height: 48px;
`;

const ToolTip = styled.span`
  visibility: ${props => props.visibility ? "visible" : "hidden"};
  width: 100%;
  background-color: ${props => props.theme.colors.grey};
  color: white;
  font-weight: 650;
  text-align: center;
  border-radius: 6px;
  padding: 10px;
  position: relative;
  z-index: 1;
  bottom: 60px;
  left: 15%;
  margin-left: -100px;

  &:after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: ${props => props.theme.colors.grey} transparent transparent transparent;
  };
`;