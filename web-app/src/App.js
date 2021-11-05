import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ThemeProvider } from 'styled-components';
import { SubmitPost } from './components/SubmitPost';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { ThreadPage } from './pages/Thread';
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

  const handleSubmit = async(post) => {
    await axios.post('/threads', post);
    alert("Done");
  }

  return (
    <div>
      <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <SubmitPost handleSubmit={handleSubmit}/>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      </div>
    </div>
  );
}

export default App;
