import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { me as callMe } from '../api/account'
import { fetchBoards } from '../api/board';
import chroma from 'chroma-js';
import { FiMenu } from 'react-icons/fi';

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

    return (
    <BoardRoot>
      { !isMobile ? <BoardDrawer boards={boards}/> : null }
      <Page>
        <HomeNavBar>
          <HamburgerMenu/>
          <Header>/b/ - random</Header>
          <GreyText>|</GreyText>
          <Header>Make fun posts here!</Header>
        </HomeNavBar>
        {component}
      </Page>
    </BoardRoot>
  )
}

const BoardDrawer = (props) => {

  const { boards } = props; 

  const history = useHistory();

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
        <Header>Boards</Header>
      </TitleContainer>
      <BoardList>
        {boards.map(board => <BoardItem onClick={() => handleClick(board)}>/{board}/</BoardItem>)}          
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
  flex-direction: column;
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
  background-color: ${props => chroma(props.theme.colors.primary).brighten().hex()};
  border-radius: 80px;
  font-size: 2rem;
  width: 60%;
  color: ${props => chroma(props.theme.colors.white)};
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

const Header = styled.h1`
  text-align: ${props => props.align ?? "center"};
  color: ${props => props.theme.colors.black};
  font-size: 1.5em;
  padding: 0;
  margin: 0;
`;

const BoardItem = styled(Header)`
  background-color: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.black};
  border-radius: 12px; 
  padding: 8px;
  user-select: none;

  &:hover {
    background-color: ${props => chroma(props.theme.colors.white).darken(0.25).hex()};
    cursor: pointer;
  }
`;

const BoardDrawerRoot = styled.div`
  width: 300px;
  background-color: ${props => props.theme.colors.grey};
  height: fit-content;
  border-radius: 8px;
  margin-top: 1rem;
  margin-right: 1rem;
`;

const BoardRoot = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
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
  justify-content: flex-start;
  gap: 10px;
  flex-direction: row;
  width: calc(100% - 20px);
  background-color: ${props => chroma(props.theme.colors.primary).brighten(0.7)};
  // border-bottom: 1px solid black;
  border-bottom: 1px solid ${props => chroma(props.theme.colors.primary).hex()};
  min-height: calc(92px - 20px);
  padding: 10px;
  align-items: center;
`;

const Text = styled.p`
  font-weight: 500; 
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${props => props.theme.colors.white};
  font-family: 'Open Sans', sans-serif;
  padding: 0;
  margin: 0;
`;

const GreyText = styled(Text)`
  text-align: center;
  color: ${props => props.theme.colors.grey};
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