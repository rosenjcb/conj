import React, { useEffect, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { SubmitPost } from './components/SubmitPost';
import { BrowserRouter as Router, Switch, Route, Link, useLocation } from 'react-router-dom'
import { ThreadPage } from './pages/Thread';
import { Thread } from './components/Thread';
import axios from 'axios';
import { ModalProvider } from 'styled-react-modal';
import { HR } from './components';
import { AccountDetails } from './components/AccountDetails';
import { upsertThread } from './api/thread';

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
    subject: {
      color: '#0f0c5d'
    },
    name: { 
      color: '#117743',
    }
  }
}

function App() {
  return (
    <ThemeProvider theme={theme}>    
    <ModalProvider>
      <AppRoot>
        <Router>
          <NavBar/>
          <Switch>
            <Route exact path="/">
              <Home/>
            </Route>
            <Route path="/thread/:id">
              <ThreadPage/>
            </Route>
          </Switch>
        </Router>
      </AppRoot>
    </ModalProvider>
    </ThemeProvider>
  );
}

function NavBar(props) {
  const location = useLocation();

  const handleSubmit = async(post) => {
    const res = await upsertThread(post, location.pathname)
    alert(JSON.stringify(res.data, null, 2));
  }

  return (
    <NavRoot>
      <Title>/b/ - Random</Title>
      <HR width="90%"/>
      <AccountDetails/>
      <HR width="50%"/>
      <CenteredSubmitPost handleSubmit={handleSubmit}/>
      <HR/>
    </NavRoot>
  )
}

function Home() {

  const [threads, setThreads] = useState([]);

  useEffect(async() => {
    const res = await axios.get('/threads');
    setThreads(res.data);
  },[])



  return (
    <HomeRoot>
      <ThreadsContainer>
        { threads.map((thread, index) => <div key={index}><Thread thread={thread}/><HR/></div>)}
      </ThreadsContainer>
    </HomeRoot>
  );
}

const CenteredSubmitPost = styled(SubmitPost)`
  margin: 0 auto;
`;

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
`

const NavRoot = styled.div`
  background-color: #eef2ff; 
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

const HomeRoot = styled.div`
  // background-color: #eef2ff; 
  // display: flex;
  // flex-direction: column;
  // justify-content: flex-start;
  // min-height: calc(100vh - 13px);
`;

const ThreadsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const ThreadContainer = styled.div`
`;

const Title = styled.div`
  font-family: ${props => props.theme.title.fontFamily};
  font-size: ${props => props.theme.title.fontSize};
  font-weight: ${props => props.theme.title.fontWeight};
  letter-spacing: ${props => props.theme.title.letterSpacing};
  text-align: center;
  color: ${props => props.theme.title.color};
`;

export default App;
