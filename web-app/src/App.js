import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import styled, { ThemeProvider } from 'styled-components';
import { SubmitPost } from './components/SubmitPost';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { ThreadPage } from './pages/Thread';
import { Thread } from './components/Thread';
import axios from 'axios';

export const theme = {
  name: 'Main Theme',
  primary: 'black',
  secondary: 'white',
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
    <Router>
      <Switch>
        <Route exact path="/">
          <Home/>
        </Route>
        <Route path="/threads/:id">
          <ThreadPage/>
        </Route>
      </Switch>
    </Router>
    </ThemeProvider>
  );
}

function Home() {

  const [threads, setThreads] = useState([]);

  useEffect(async() => {
    const res = await axios.get('/threads');
    console.log(res);
    setThreads(res.data)
  },[])

  const handleSubmit = async(post) => {
    const res = await axios.post('/threads', post);
    alert(JSON.stringify(res.data, null, 2));
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
