import React, { useEffect, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Helmet from 'react-helmet';
import { ThreadPage } from './pages/Thread';
import { ModalProvider } from 'styled-react-modal';
import { useSelector } from 'react-redux';
import { WithNavBar } from './components/NavBar';
import { Home } from './pages/Home'
import { AboutPage } from './pages/About';
import { BoardPage } from './pages/Board';

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


// const WithNavBar = (props) => {
//   const { component } = props;

//   return(
//     <div>
//       <NavBar/>
//       {component} 
//     </div>
//   )
// }



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
            <Route exact path="/boards/:board">
              <WithNavBar component={<BoardPage/>}/>
            </Route>
            <Route path="/thread/:id">
              <WithNavBar component={<ThreadPage preview={false} thread={thread}/>}/>
            </Route>
            <Route path="/boards/:board/thread/:id">
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

export default App;
