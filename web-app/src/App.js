import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import styled, { ThemeProvider } from 'styled-components';
import { SubmitPost } from './components/SubmitPost';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { ThreadPage } from './pages/Thread';
import { Thread } from './components/Thread';
import axios from 'axios';
import { ModalProvider } from 'styled-react-modal'

export const theme = {
  name: 'Main Theme',
  primary: 'black',
  secondary: 'white',
  background: 'linear-gradient(180deg, rgba(209,213,238,1) 0%, rgba(238,242,255,1) 35%);',
  submitPost: {
    primary: '#98e'
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
    <Router>
      <Switch>
        <Route exact path="/">
          <Home/>
        </Route>
        <Route path="/thread/:id">
          <ThreadPage/>
        </Route>
      </Switch>
    </Router>
    </ModalProvider>
    </ThemeProvider>
  );
}

function Home() {

  const [threads, setThreads] = useState([]);

  useEffect(async() => {
    const res = await axios.get('/threads');
    setThreads(res.data);
  },[])

  const handleSubmit = async(post) => {
    const res = await axios.post('/threads', post);
    alert(JSON.stringify(res.data, null, 2));
    setThreads([...threads, res.data]);
  }

  return (
    <HomeRoot>
      <SubmitPost handleSubmit={handleSubmit}/>
      <ThreadsContainer>
        { threads.map((thread, key) => <div key={key}><Thread thread={thread}/><hr/></div>)}
      </ThreadsContainer>
    </HomeRoot>
  );
}

const HomeRoot = styled.div`
  background-color: #eef2ff; 
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const ThreadsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const ThreadContainer = styled.div`

`;

export default App;
