import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Helmet from 'react-helmet';
import { ThreadPage } from './pages/Thread';
import { useSelector } from 'react-redux';
import { WithNavBar } from './components/NavBar';
import { AboutPage } from './pages/About';
import { BoardPage } from './pages/Board';
import { Toaster } from 'react-hot-toast';

export const newTheme = {
  colors: {
    primary: "#23262a",
    accent: "#6A77FC",
    success: "",
    failure: "",
    error: "",
    warning: "#eed202",
    black: "black",
    white: "white",
    grey: "#b9bbbe",
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

function App() {
  const thread = useSelector(state => state.thread);

  return (
    <ThemeProvider theme={theme}>    
      <AppRoot>
        <Helmet>
          <title>/b/ - Random</title>
        </Helmet>
        <Router forceRefresh>
          <Switch>
            <Route exact path="/">
              <WithNavBar component={<AboutPage/>}/>
            </Route>
            <Route exact path="/boards/:board">
              <WithNavBar component={<BoardPage/>}/>
            </Route>
            <Route path="/boards/:board/thread/:id">
              <WithNavBar component={<ThreadPage preview={true} thread={thread}/>}/>
            </Route>
            <Route exact path ="/about">
              <AboutPage/>
            </Route>
          </Switch>
        </Router>
        <Toaster />
      </AppRoot>
    </ThemeProvider>
  );
}

const AppRoot = styled.div`
  background-color: ${props => props.theme.newTheme.colors.accent};
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
`;

export default App;
