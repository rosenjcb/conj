import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ThemeProvider } from 'styled-components';
import { SubmitPost } from './components/SubmitPost';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { Post } from './components/SubmitPost/Post';

export const theme = {
  name: 'Main Theme',
  primary: 'black',
  secondary: 'white',
  post : {
    primary: '#98e'
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
          <Post/>
        </Route>
      </Switch>
    </Router>
    </ThemeProvider>
  );
}

function Home() {
  return (
    <div>
      <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <SubmitPost/>
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
