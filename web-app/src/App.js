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
import chroma from 'chroma-js';

export const theme = {
  colors: {
    primary: "#512B8F",
    accent: "#FFC75F",
    success: "",
    failure: "",
    error: "",
    warning: "#eed202",
    black: "black",
    white: "white",
    grey: "#b9bbbe",
  }
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
  // background-color: ${props => props.theme.colors.accent};
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(112deg, transparent 0, transparent 20%, ${props => chroma(props.theme.colors.primary).alpha(0.1).hex()} 30%, ${props => chroma(props.theme.colors.primary).alpha(0.1).hex()} 70%, transparent 80%, transparent 100%);
`;

export default App;

// primary: "#512B8F",
  //accent: "#FFC75f",