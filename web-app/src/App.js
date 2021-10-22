import logo from './logo.svg';
import './App.css';
import { ThemeProvider } from 'styled-components';
import { SubmitPost } from './components/SubmitPost';

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
    </ThemeProvider>
  );
}

export default App;
