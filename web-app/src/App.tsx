import styled, { DefaultTheme, ThemeProvider } from "styled-components";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Helmet from "react-helmet";
import { ThreadPage } from "./pages/Thread";
import { WithNavBar } from "./components/NavBar";
import { AboutPage } from "./pages/About";
import { BoardPage } from "./pages/Board";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const theme: DefaultTheme = {
  colors: {
    primary: "#512B8F",
    accent: "#FFC75F",
    success: "",
    failure: "",
    error: "",
    warning: "#eed202",
    black: "black",
    white: "white",
    grey: "#EDEDED",
    darkGrey: "#d5d5d5",
  },
};

const clientId =
  "602129467689-pe4l4im2nr62t14ae50quc1uj2dd5um1.apps.googleusercontent.com";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GoogleOAuthProvider clientId={clientId}>
        <AppRoot>
          <Helmet>
            <title>Conj - Anonymous Discussions</title>
          </Helmet>
          <Router forceRefresh>
            <Switch>
              <Route exact path="/">
                {/* <WithNavBar component={<AboutPage/>}/> */}
                <Redirect to="/boards/random" />
              </Route>
              <Route exact path="/boards/:board">
                <WithNavBar component={<BoardPage />} />
              </Route>
              <Route path="/boards/:board/thread/:id">
                <WithNavBar component={<ThreadPage />} />
              </Route>
              <Route exact path="/about">
                <AboutPage />
              </Route>
            </Switch>
          </Router>
          <Toaster />
        </AppRoot>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

const AppRoot = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
  background-color: ${(props) => props.theme.colors.white};
  overflow-x: hidden;
`;

export default App;
