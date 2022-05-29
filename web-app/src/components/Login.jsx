import React, { useState } from 'react';
import styled from 'styled-components';
import { Formik, Field} from 'formik';
import { login, signup } from '../api/account';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ErrorText } from './index';
import { parseError } from '../util/error';

const InputField = (props) => {
  const { label, field, form, secret } = props;

  const handleChange = (e) => {
    e.preventDefault();
    form.setFieldValue(field.name, e.target.value);
  }

  return (
    <InputFieldRoot>
      <Label>{label}</Label>
      <TextField secret={secret} type="text" placeholder={props.placeholder} onChange={handleChange}/>
    </InputFieldRoot>
  )
}

export function Login() {

  const history = useHistory();
  
  const [error, setError] = useState(null);

  const handleSignup = async(values) => {
    try {
      setError("")
      await signup(values);
      history.push('/');
      history.go();
    } catch(e) {
      setError(parseError(e));
    }
  }

  const handleLogin = async(values, actions) => {
    try {
      setError("")
      actions.setSubmitting(false);
      await login(values);
      history.push('/')
      history.go();
    } catch(e) {
      setError(parseError(e))
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
            <h1>Welcome to Pepechan!</h1>
            <Field label="Email" name="email" placeholder="user@domain.com" component={InputField}/>
            <Field label="Password" name="pass" secret={true} component={InputField}/>
            <SubmitOptions>
              <button type="submit">Login</button> 
              <button type="button" onClick={() => handleSignup(props.values)}>Signup</button> 
            </SubmitOptions>
            <a href="/about">Why do I need an account?</a>
            {error ? <ErrorText>{error}</ErrorText> : null}
          </StyledForm>
      )}
      </Formik>
    </Root>
  )
}

const SubmitOptions = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding-bottom: 1rem;
`

const InputFieldRoot = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-top: 12px; 
  margin-bottom: 12px;
  width: auto;
`;

const StyledForm = styled.form`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding: 10px; 
`;

const Header = styled.div`
  width: 100%;
  background-color: ${props => props.theme.login.header.backgroundColor};
  color: ${props => props.theme.login.header.color};
  font-weight: 700;
  font-size: 131%; 
  text-align: center;
`;

const Root = styled.div`
  margin: 0 auto;
  background-color: ${props => props.theme.login.body.backgroundColor};
  text-align: center;
  width: 500px;

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
  display: inline-block;
`;

const TextField = styled.input`
  -webkit-text-security: ${props => props.secret ? "circle" : "none"};
`
