import styled from "styled-components";
import { useLoginMutation } from "../api/account";
import { Header } from "./index";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { GoogleLoginButton } from "react-social-login-buttons";

interface LoginProps {
  completeAction: () => any;
}

interface OauthResponse {
  code: string;
}

export function Login({ completeAction }: LoginProps) {
  const [login] = useLoginMutation();

  const handleSuccess = async ({ code }: OauthResponse) => {
    try {
      await login({
        provider: "google",
        code,
        redirectUri: "postmessage",
      }).unwrap();
      // if (account?.is_onboarding === false) toast.success("Welcome Back!");
      toast.success("Welcome to Conj!");
    } catch (e: any) {
      if (e && "status" in e) {
        toast.error(e.data);
      }
    } finally {
      completeAction();
    }
  };

  const handleFailure = () => {
    toast.error("Couldn't login for some reason");
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleSuccess,
    onError: handleFailure,
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
  background-color: ${(props) => props.theme.colors.white};
  text-align: center;
  padding: 1.25em;
  border-radius: 8px;
  width: fit-content;
  max-width: 400px;

  @media all and (max-width: 480px) {
    width: 100%;
    padding: 0;
    border-radius: 0px;
  }
`;
