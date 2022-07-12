import React, { useState } from 'react';
import styled from 'styled-components';
import { Formik, Field} from 'formik';
import { login, signup } from '../api/account';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ErrorText } from './index';
import { parseError } from '../util/error';
import chroma from 'chroma-js';
import { AccentButton, Link } from './index';
import toast from 'react-hot-toast';


const InputField = (props) => {
  const { label, field, form, secret } = props;

  const type = props.type ?? 'text';

  const autocomplete = props.autocomplete ?? 'false';

  const handleChange = (e) => {
    e.preventDefault();
    form.setFieldValue(field.name, e.target.value);
  }

  return (
    <InputFieldRoot>
      <Label>{label}</Label>
      <TextField type={type} name={type} autocomplete={autocomplete} secret={secret} placeholder={props.placeholder} onChange={handleChange}/>
    </InputFieldRoot>
  )
}

export function Login() {

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
  
  return (
    <Root>
      <Header>Login</Header>
      <Formik
        initialValues={{
          email: '',
          pass: ''
        }}
        onSubmit={handleLogin}
      >
        {(props) => (
          <StyledForm onSubmit={props.handleSubmit}>
            <WelcomeMessage>Welcome to Pepechan!</WelcomeMessage>
            <Field label="EMAIL" type="email" autocomplete="email" name="email" placeholder="user@domain.com" component={InputField}/>
            <Field label="PASSWORD" type="password" autocomplete="current-password" name="pass" secret={true} component={InputField}/>
            <SubmitOptions>
              <AccentButton type="submit">Login</AccentButton> 
              <AccentButton type="button" onClick={() => handleSignup(props.values)}>Signup</AccentButton> 
            </SubmitOptions>
            <Link href="/about">Why do I need an account?</Link>
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

const InputFieldRoot = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 70%;
  margin:0 auto;
  margin-top: 12px; 
  margin-bottom: 12px;
`;

const StyledForm = styled.form`
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 10px; 
`;

const WelcomeMessage  = styled.div`
  color: #b9bbbe;
  font-size: 80%;
`;

const Header = styled.div`
  width: 100%;
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).brighten(0.5).hex()};
  color: ${props => props.theme.newTheme.colors.white};
  font-weight: 700;
  font-size: 131%; 
  text-align: center;
  border-radius: 8px 8px;
  margin-top: 1rem;
`;

const Root = styled.div`
  margin: 0 auto;
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).brighten(0.5).hex()};
  text-align: center;
  width: 500px;
  border-radius: 8px 8px;

  @media all and (min-width: 1024px) and (max-width: 1280px) { 
    width: 500px;
  }
  
  @media all and (min-width: 768px) and (max-width: 1024px) { 
    width: 500px;
  }
  
  @media all and (min-width: 480px) and (max-width: 768px) { 
    width: 100%;
  }
  
  @media all and (max-width: 480px) { 
    width: 100%;
  }
`;

const Label = styled.label`
  display: flex;
  justify-content: flex-start;
  font-size: 12px;
  margin-bottom: 8px;
  color: ${props => props.theme.newTheme.colors.grey};
`;

const TextField = styled.input`
  -webkit-text-security: ${props => props.secret ? "circle" : "none"};
  border-radius: 8px;
  border-color: transparent;
`;
