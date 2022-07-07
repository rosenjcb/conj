import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { Login } from '../Login';
import { me as callMe } from '../../api/account'
import chroma from 'chroma-js';
import { FiMenu } from 'react-icons/fi';

export const WithNavBar = ({component}) => {

  const [me, setMe] = useState(null);

  useEffect(async() => {
    try { 
      const res = await callMe();
      setMe(res);
    } catch(e) {
      setMe(null);
    }
  },[])

  const detectMobile = () => {
    // console.log(window.innerWidth);
    return window.innerWidth < 768;
  }

  const isMobile = detectMobile();

  const navBar = (
    <BoardRoot>
      { !isMobile ? <BoardDrawer/> : null }
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

  return me ? navBar : <Login/>;
}

const BoardDrawer = () => {

  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Search text')
  }

  const handleClick = () => {
    history.push("/boards/b")
  }

  return(
    <BoardDrawerRoot>
      <TitleContainer>
        <Header>Boards</Header>
      </TitleContainer>
      <Content>
        <BoardList>
          <BoardItem onClick={handleClick}>/b/ - random</BoardItem>
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


const PostContainer = styled.div`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media all and (min-width: 1024px) and (max-width: 1280px) {
    min-width: 40%;
    max-width: 40%;
  }
  
  @media all and (min-width: 768px) and (max-width: 1024px) { 
    min-width: 40%;
    max-width: 40%;
  }
  
  @media all and (min-width: 480px) and (max-width: 768px) { 
    min-width: 100%;
    max-width: 100%;
  }
  
  @media all and (max-width: 480px) { 
    min-width: 100%;
    max-width: 100%;
  }
`;

const ErrorText = styled.p`
  color: red;
  margin: 0 auto;
  width: fit-content;
`;

// const CenteredSubmitPost = styled(SubmitPost)`
//   min-width: 100%;
// `;

const NavRoot = styled.div`
  background-color: #eef2ff; 
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

const AccountRoot = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 10px;
`;

const Title = styled.a`
  font-family: ${props => props.theme.title.fontFamily};
  font-size: ${props => props.theme.title.fontSize};
  font-weight: ${props => props.theme.title.fontWeight};
  letter-spacing: ${props => props.theme.title.letterSpacing};
  text-align: center;
  color: ${props => props.theme.title.color};
  text-decoration: none;

  &:hover {
    cursor: pointer;  
  }
`;

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
  height: calc(100vh - 93px);
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

const BoardRoot = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  max-height: 100vh;
  background-color ${props => chroma(props.theme.newTheme.colors.primary).darken(0.3)};
`;

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
  min-height: calc(92px - 20px);
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
    gap: 10px;
`;

const Body = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-stat;
  flex-direction: column;
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).brighten(0.5).hex()};

  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
`

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