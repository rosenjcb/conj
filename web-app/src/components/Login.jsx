import styled from 'styled-components';
import { Formik, Field} from 'formik';
import { useEffect } from 'react';
import { login, signup } from '../api/account';

const InputField = (props) => {
  const { label, field, form, secret } = props;

  const handleChange = (e) => {
    e.preventDefault();
    form.setFieldValue(field.name, e.target.value);
  }

  useEffect(() => {
    console.log(props);
  },[])

  return (
    <InputFieldRoot>
      <Label>{label}</Label>
      <TextField secret={secret} type="text" placeholder={props.placeholder} onChange={handleChange}/>
    </InputFieldRoot>
  )
}

export function Login() {

  const onHandleSignup = async(values) => {
    const res = await signup(values);
    alert(JSON.stringify(res, null, 2));
  }
  
  return (
    <Root>
      <Header>Login</Header>
      <Formik
        initialValues={{
          email: '',
          pass: ''
        }}
        onSubmit={async(values, actions) => {
          actions.setSubmitting(false);
          console.log(values);
          const res = await login(values);
          console.log(JSON.stringify(res, null, 2));
          window.location.href = 'http://localhost:3000/';
        }}
      >
        {(props) => (
          <StyledForm onSubmit={props.handleSubmit}>
            <h1>Welcome to Pepechan!</h1>
            <Field label="Email" name="email" placeholder="user@domain.com" component={InputField}/>
            <Field label="Password" name="pass" secret={true} component={InputField}/>
            <SubmitOptions>
              <button type="submit">Login</button> 
              <button type="button" onClick={() => onHandleSignup(props.values)}>Signup</button> 
            </SubmitOptions>
            <a href="http://localhost:3000/about">Why do I need an account?</a>
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
`;

const Label = styled.label`
  display: inline-block;
`;

const TextField = styled.input`
  -webkit-text-security: ${props => props.secret ? "circle" : "none"};
`
