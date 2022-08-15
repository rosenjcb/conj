import React, { useState } from 'react';
import styled from 'styled-components';
import { Formik, Field} from 'formik';
import { login, signup } from '../api/account';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { parseError } from '../util/error';
import chroma from 'chroma-js';
import { Link, Header, RoundButton, Back, InputField } from './index';
import toast from 'react-hot-toast';




function SignUp({onClick}) {

  const history = useHistory();

  const handleSignup = async(values) => {
    try {
      await signup(values);
      history.push('/');
      history.go();
    } catch(e) {
      toast.error(parseError(e));
    }
  }

  return (
    <Root>
      <Header bold size="large">Signup</Header>
      <Formik
        initialValues={{
          email: '',
          pass: '',
          username: ''
        }}
        onSubmit={handleSignup}
      >
        {(props) => (
          <StyledForm onSubmit={props.handleSubmit}>
            <Back onClick={onClick}/>
            <Header size="medium" bold>Welcome to Conj!</Header>
            <Field label="EMAIL" type="email" autocomplete="email" name="email" placeholder="user@domain.com" component={InputField}/>
            <Field label="PASSWORD" type="password" autocomplete="current-password" name="pass" secret={true} component={InputField}/>
            <Field label="USERNAME" type="username" name="username" placeholder="Username" component={InputField}/>
            <SubmitOptions>
              <RoundButton type="submit">Complete Signup</RoundButton> 
            </SubmitOptions>
          </StyledForm>
      )}
      </Formik>
    </Root>
  )
}

export function Login() {

  const history = useHistory();

  const [signUp, setSignUp] = useState(false);

  const handleSignup = () => {
    setSignUp(true);
  }

  const handleLogin = async(values, actions) => {
    try {
      actions.setSubmitting(false);
      await login(values);
      history.push('/')
      history.go();
    } catch(e) {
      toast.error(parseError(e));
    }
  }

  if(signUp) {
    return <SignUp onClick={() => setSignUp(false)}/>
  }
  
  return (
    <Root>
      <Header bold size="large">Login</Header>
      <Formik
        initialValues={{
          email: '',
          pass: ''
        }}
        onSubmit={handleLogin}
      >
        {(props) => (
          <StyledForm onSubmit={props.handleSubmit}>
            <Header size="medium" bold>Welcome to Conj!</Header>
            <Field label="EMAIL" type="email" autocomplete="email" name="email" placeholder="user@domain.com" component={InputField}/>
            <Field label="PASSWORD" type="password" autocomplete="current-password" name="pass" secret={true} component={InputField}/>
            <SubmitOptions>
              <RoundButton type="submit">Login</RoundButton> 
              <RoundButton type="button" onClick={() => handleSignup(props.values)}>Signup</RoundButton> 
            </SubmitOptions>
            {/* <Link href="/about">Why do I need an account?</Link> */}
          </StyledForm>
      )}
      </Formik>
    </Root>
  )
}

const SubmitOptions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  padding-bottom: 1rem;
  padding-top: 1rem;
`;



const StyledForm = styled.form`
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 10px; 
`;

const Root = styled.div`
  margin: 0 auto;
  background-color: ${props => chroma(props.theme.colors.white)};
  text-align: center;
  padding: 2rem;
  border-radius: 8px;
  width: 20vw;

  @media all and (min-width: 1024px) and (max-width: 1280px) { 
    width: 20vw;
  }
  
  @media all and (min-width: 768px) and (max-width: 1024px) { 
    width: 20vw;
  }
  
  @media all and (min-width: 480px) and (max-width: 768px) { 
    width: 20vw;
  }
  
  @media all and (max-width: 480px) { 
    width: 100vw;
    padding: 0;
    border-radius: 0px;
  }
`;

