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

export const theme = {
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
  background-color: ${props => props.theme.colors.accent};
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
`;

export default App;
