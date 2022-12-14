import React, { useState } from "react";
import styled from "styled-components";
import { Formik, Field } from "formik";
import { useLoginMutation, useSignupMutation } from "../api/account";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import chroma from "chroma-js";
import { Header, RoundButton, Back, InputField } from "./index";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import { useGoogleLogin } from "@react-oauth/google";
import { GoogleLoginButton } from "react-social-login-buttons";

function SignUp({ onClick }) {
  const history = useHistory();

  const [signUp] = useSignupMutation();

  const handleSignup = async (values) => {
    var formData = new FormData();
    for (var key in values) {
      formData.append(key, values[key]);
    }
    try {
      await signUp(formData).unwrap();
      history.push("/");
      history.go();
    } catch (e) {
      toast.error(e.data);
    }
  };

  return (
    <Root>
      <Header bold size="large">
        Signup
      </Header>
      <Formik
        initialValues={{
          email: "",
          pass: "",
          username: "",
        }}
        onSubmit={handleSignup}
      >
        {(props) => (
          <StyledForm onSubmit={props.handleSubmit}>
            <Back onClick={onClick} />
            <Header size="medium" bold>
              Welcome to Conj!
            </Header>
            <Field
              label="EMAIL"
              type="email"
              autocomplete="email"
              name="email"
              placeholder="user@domain.com"
              component={InputField}
            />
            <Field
              label="PASSWORD"
              type="password"
              autocomplete="current-password"
              name="pass"
              secret={true}
              component={InputField}
            />
            <Field
              label="USERNAME"
              type="username"
              name="username"
              placeholder="Username"
              component={InputField}
            />
            <SubmitOptions>
              <RoundButton type="submit">Complete Signup</RoundButton>
            </SubmitOptions>
          </StyledForm>
        )}
      </Formik>
    </Root>
  );
}

SignUp.propTypes = {
  onClick: PropTypes.func,
};

export function Login({ completeAction }) {
  const [signUp, setSignUp] = useState(false);

  const handleSignup = () => {
    setSignUp(true);
  };

  const [login] = useLoginMutation();

  const handleLogin = async (values, actions) => {
    try {
      toast.success("Welcome back!");
    } catch (e) {
      toast.error(e.data);
    } finally {
      completeAction();
    }
  };

  const handleOauth = async (res) => {
    const { code } = res;

    try {
      const account = await login({
        provider: "google",
        code,
        redirectUri: "https://conj.app/oauth",
      }).unwrap();
      console.log(account);
      toast.success("Welcome back!");
    } catch (e) {
      toast.error(e.data);
    } finally {
      completeAction();
    }

    console.log(res);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleOauth,
    onFailure: handleOauth,
    flow: "auth-code",
  });

  if (signUp) {
    return <SignUp onClick={() => setSignUp(false)} />;
  }

  return (
    <Root>
      <Header bold size="large">
        Login
      </Header>
      <Formik
        initialValues={{
          email: "",
          pass: "",
        }}
        onSubmit={handleLogin}
      >
        {(props) => (
          <StyledForm onSubmit={props.handleSubmit}>
            <Header size="medium" bold>
              Welcome to Conj!
            </Header>
            <SubmitOptions>
              <GoogleLoginButton onClick={() => googleLogin()} />
            </SubmitOptions>
          </StyledForm>
        )}
      </Formik>
    </Root>
  );
}

Login.propTypes = {
  completeAction: PropTypes.func,
};

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
  background-color: ${(props) => chroma(props.theme.colors.white)};
  text-align: center;
  padding: 2rem;
  border-radius: 8px;
  width: auto;

  @media all and (min-width: 1024px) and (max-width: 1280px) {
    width: auto;
  }

  @media all and (min-width: 768px) and (max-width: 1024px) {
    width: auto;
  }

  @media all and (min-width: 480px) and (max-width: 768px) {
    width: auto;
  }

  @media all and (max-width: 480px) {
    width: 100vw;
    padding: 0;
    border-radius: 0px;
  }
`;
