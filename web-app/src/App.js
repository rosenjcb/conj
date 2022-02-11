import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { ThreadPage } from './pages/Thread';
import { ModalProvider } from 'styled-react-modal';
import { useSelector } from 'react-redux';
import { NavBar } from './components/NavBar';
import { Home } from './pages/Home'

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
  const thread = useSelector(state => state.thread);

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
                <ThreadPage thread={thread}/>
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
export default App;
