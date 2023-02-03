import React from "react";
import styled from "styled-components";
import { useLoginMutation } from "../api/account";
import chroma from "chroma-js";
import { Header } from "./index";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import { useGoogleLogin } from "@react-oauth/google";
import { GoogleLoginButton } from "react-social-login-buttons";

export function Login({ completeAction }) {
  const [login] = useLoginMutation();

  const handleOauth = async (res) => {
    const { code } = res;

    try {
      const account = await login({
        provider: "google",
        code,
        redirectUri: "postmessage",
      }).unwrap();
      if (account?.is_onboarding === false) toast.success("Welcome Back!");
    } catch (e) {
      toast.error(e.data);
    } finally {
      completeAction();
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleOauth,
    onFailure: handleOauth,
    flow: "auth-code",
  });

  return (
    <Root>
      <Header size="medium" align="left">
        Please use Oauth to create or log into an existing account.
      </Header>
      <SubmitOptions>
        <GoogleLoginButton onClick={() => googleLogin()} />
      </SubmitOptions>
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
  margin: 0 auto;
  max-width: 250px;
`;

const Root = styled.div`
  margin: 0 auto;
  background-color: ${(props) => chroma(props.theme.colors.white)};
  text-align: center;
  padding: 1.25em;
  border-radius: 8px;
  width: 400px;

  @media all and (min-width: 1024px) and (max-width: 1280px) {
    width: 400px;
  }

  @media all and (min-width: 768px) and (max-width: 1024px) {
    width: 400px;
  }

  @media all and (min-width: 480px) and (max-width: 768px) {
    width: 400px;
  }

  @media all and (max-width: 480px) {
    width: 100%;
    padding: 0;
    border-radius: 0px;
  }
`;
