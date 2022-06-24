import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Helmet from 'react-helmet';
import { ThreadPage } from './pages/Thread';
import { ModalProvider } from 'styled-react-modal';
import { useSelector, useDispatch } from 'react-redux';
import { NavBar } from './components/NavBar';
import { Home } from './pages/Home'
import { Reply } from './components/Reply';
import { AboutPage } from './pages/About';
import { FiMenu } from "react-icons/fi";
import { BiMessageDetail } from 'react-icons/bi';
import { BsFillReplyFill } from 'react-icons/bs';
import { openQuickReply } from './slices/postSlice';
import * as chroma from 'chroma-js';

export const newTheme = {
  colors: {
    primary: "#23262a",
    accent: "#3A3E46",
    success: "",
    failure: "",
    error: "",
    warning: "",
    black: "black",
    white: "white",
    grey: "grey",
  }
}

export const theme = {
  name: 'Main Theme',
  primary: 'black',
  secondary: 'white',
  background: 'linear-gradient(180deg, rgba(209,213,238,1) 0%, rgba(238,242,255,1) 35%);',
  fontSize: "10pt",
  fontFamily: "arial,helvetica,sans-serif",
  submitPost: {
    primary: '#98e'
  },
  title: {
    fontSize: "28px",
    fontFamily: "Tahoma, sans-serif",
    fontWeight: "700",
    letterSpacing: "-2px",
    color: "#af0a0f"
  },
  lineBreak: {
    borderTop: "#b7c5d9"
  },
  post: {
    fontSize: "10pt",
    fontFamily: "arial,helvetica,sans-serif",
    backgroundColor: '#d6daf0',
    border: '#b7c5d9',
    selected: '#d6bad0',
    subject: {
      color: '#0f0c5d'
    },
    name: { 
      color: '#117743',
    }
  },
  login: {
    header: {
      backgroundColor: '#9c6',
      color: '#060',
    },
    body: {
      backgroundColor: '#efe'
    }
  },
  newTheme: newTheme
}


const WithNavBar = (props) => {
  const { component } = props;

  return(
    <div>
      <NavBar/>
      {component} 
    </div>
  )
}

const detectMobile = () => {
  console.log(window.innerWidth);
  return window.innerWidth < 768;
}

const Board = () => {

  const isMobile = detectMobile();

  return(
    <BoardRoot>
      { !isMobile ? <BoardDrawer/> : null }
      <Page>
        <HomeNavBar>
          <HamburgerMenu/>
          <Header>/b/ - random</Header>
          <GreyText>|</GreyText>
          <Header>Make fun posts here!</Header>
        </HomeNavBar>
        <Body>
          <StyledReply/>
          <ThreadPreview/>
        </Body>
      </Page>
    </BoardRoot>
  )
}


const StyledReply = styled(Reply)`
  border-radius: 8px;
  padding: 2rem;
  padding-right: 10%;
  padding-left: 10%;
  width: 80%;
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).brighten(1.5).hex()};
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
`;

const Body = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-stat;
  flex-direction: column;
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).brighten(0.5).hex()};
`

const Post = () => {

  const [fullScreen, setFullScreen] = useState(false);

  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(openQuickReply());
  };

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
  }

  return(
    <PostRoot>
      <ContentRoot>
        <Image fullScreen={fullScreen} onClick={() => toggleFullScreen()} src="https://media.springernature.com/relative-r300-703_m1050/springer-static/image/art%3A10.1038%2F528452a/MediaObjects/41586_2015_Article_BF528452a_Figg_HTML.jpg"/>
        <Text align="left">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </Text>
      </ContentRoot>
      <HeaderRoot>
        <UserInfo>
          <Avatar src="pepe_icon.jpg"/>
          <TextContainer>
            <MyGreyText>HelloWorld34</MyGreyText>
            <MyGreyText>#1234</MyGreyText>
            <MyGreyText>8:52pm</MyGreyText>
          </TextContainer>
        </UserInfo>
        <Header>This is an Example Title</Header>
        <ActionsContainer>
          <WithText component={<MessageDetail/>} direction="row" text="10"/>
        </ActionsContainer>
      </HeaderRoot>
    </PostRoot>
  )
}

const ThreadPreview = () => {

  return(
    <ThreadPreviewRoot>
      <Post/>
    </ThreadPreviewRoot>
  )
}

const WithText = ({direction, component, text}) => {
  return (
    <WithTextRoot direction={direction}>
      {component} 
      <Header>{text}</Header>
    </WithTextRoot>
  )
}

const ActionsContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
  gap: 10px;
  align-items: center;
`

const WithTextRoot = styled.div`
  display: flex;
  flex-direction: ${props => props.direction ?? "row"};
`;

const ReplyIcon = styled(BsFillReplyFill)`
  color: white;
  width: 48px;
  height: 48px;
`;

const MessageDetail = styled(BiMessageDetail)`
  color: white;
  width: 48px;
  height: 48px;
`;

const HeaderRoot = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
  align-items: center;
`;

const TextContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
`
const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  padding-top: 20px;
`;

const Avatar = styled.img`
  width: 96px;
  height: 96px;
  border-radius: 50%;
`

const Image = styled.img`
  aspect-ratio: 16 / 9;
  width: fit-content;
  max-width: ${props => !props.fullScreen ? "200px;" : "100%"};
  max-height: ${props => !props.fullScreen ? "112px;" : "100%"};
  border-radius: 8px;
  margin-right: 10px;
  float: left;
`

const ContentRoot = styled.div`
  display: block;
  width: 100%;
`

const PostRoot = styled.li`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-flow: wrap;
  align-items: center;
  width: 100%;
  height: auto;
  max-height: 300px;
`;

const Page = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  width: 30%;
`;

const ThreadPreviewRoot = styled.ul`
  width: calc(100% - 3rem);
  height: calc(100vh - 96px);
  padding: 1.5rem;
  margin: 0;
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

  // @media all and (min-width: 1024px) {
  //   visibility: visible;
  // }
  
  // @media all and (min-width: 768px) and (max-width: 1024px) {
  //   visibility: visible;
  // }
  
  // @media all and (min-width: 480px) and (max-width: 768px) {
  //   visibility: hidden;
  //  }
  
  // @media all and (max-width: 480px) { 
  //   visibility: hidden;
  // }  
`

const BoardRoot = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
  margin: 0 auto;
  width: 100%;
  height: 100%;
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
  height: 72px;
  padding: 10px;
  align-items: center;
`;

const Text = styled.p`
  font-weight: 500; 
  font-size: 1.25rem;
  line-height: 1.5rem;
  color: ${props => props.theme.newTheme.colors.white};
  font-family: 'Open Sans', sans-serif;
  padding: 0;
  margin: 0;
`


const GreyText = styled(Text)`
  text-align: center;
  color: ${props => props.theme.newTheme.colors.grey};
`;

function App() {
  const thread = useSelector(state => state.thread);

  const hideQuickReply = useSelector(state => state.post).hidden;

  return (
    <ThemeProvider theme={theme}>    
    <ModalProvider>
      <AppRoot>
        <Helmet>
          <title>/b/ - Random</title>
        </Helmet>
        {/* {!hideQuickReply ? <QuickReply/> : null } */}
        <Router forceRefresh>
          {/* <QuickReply/> */}
          <Switch>
            <Route exact path="/">
              <WithNavBar component={<Home/>}/>
            </Route>
            <Route exact path="/test">
              <Board/>
            </Route>
            <Route path="/thread/:id">
              <WithNavBar component={<ThreadPage preview={false} thread={thread}/>}/>
            </Route>
            <Route exact path ="/about">
              <AboutPage/>
            </Route>
          </Switch>
        </Router>
      </AppRoot>
    </ModalProvider>
    </ThemeProvider>
  );
}

const AppRoot = styled.div`
  background-color: #eef2ff; 
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: calc(100vh - 13px);
  padding-top: 5px;
  padding-bottom: 8px;
  padding-left: 5px;
  padding-right: 5px;
`;

const MyHeader = styled(Header)`
  // max-width: 50%;
  // text-overflow: ellipsis;
  // max-height: 3px;
`;

const MyGreyText = styled(GreyText)`
  font-size: 18px;
`;

export default App;
