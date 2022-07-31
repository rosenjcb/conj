import React, { useState } from 'react';
import styled from 'styled-components';
import { Formik, Field} from 'formik';
import { login, signup } from '../api/account';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { parseError } from '../util/error';
import chroma from 'chroma-js';
import { Link, Header, RoundButton, Back } from './index';
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
            <Link href="/about">What's Conj?</Link>
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

const Label = styled.label`
  display: flex;
  justify-content: flex-start;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: ${props => props.theme.colors.black};
`;

const TextField = styled.input`
  -webkit-text-security: ${props => props.secret ? "circle" : "none"};
  border-radius: 8px;
  border-color: ${props => props.theme.colors.grey};
  min-height: 2rem;
`;
