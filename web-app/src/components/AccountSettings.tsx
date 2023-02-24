import styled from "styled-components";
import { Formik, Field } from "formik";
import { RoundButton, InputField, InputFile } from "./index";
import {
  useMeQuery,
  useUpdateMeMutation,
  useFinishOnboardingMutation,
} from "../api/account";
import toast from "react-hot-toast";

export interface AccountSettingsProps {
  onFinish(): any;
}

interface FormValues {
  username: string | null;
  avatar: Blob | null;
}

export function AccountSettings({ onFinish }: AccountSettingsProps) {
  const [updateMe] = useUpdateMeMutation();

  const { data: me, error } = useMeQuery();

  const safeError = error as any;

  if (error && "status" in safeError) {
    toast.error(JSON.stringify(safeError.data));
  }

  const handleUpdate = async (values: any, actions: any) => {
    try {
      actions.setSubmitting(false);
      var formData = new FormData();
      for (var key in values) {
        if (values[key] !== null && values[key] !== "") {
          formData.append(key, values[key]);
        }
      }
      await updateMe(formData).unwrap();
      onFinish();
    } catch (e: any) {
      if (e.data) toast.error(e.data);
    }
  };

  const initialValues: FormValues = {
    username: null,
    avatar: null,
  };

  return (
    <Root>
      {me ? (
        <Formik initialValues={initialValues} onSubmit={handleUpdate}>
          {(props) => (
            <StyledForm onSubmit={props.handleSubmit}>
              <ContentDetails>
                <Field
                  label="AVATAR"
                  type="AVATAR"
                  name="avatar"
                  placeholder={me.avatar}
                  component={InputFile}
                />
                <Field
                  name="username"
                  placeholder={me.username}
                  component={InputField}
                />
                <SquareButton type="submit">Update</SquareButton>
              </ContentDetails>
            </StyledForm>
          )}
        </Formik>
      ) : null}
    </Root>
  );
}

export function CompleteOnboarding() {
  const [finishOnboarding] = useFinishOnboardingMutation();

  const { data: me, error } = useMeQuery();

  const safeError = error as any;

  if (error && "status" in safeError) {
    toast.error(JSON.stringify(safeError.data));
  }

  const handleSubmit = async (values: any, actions: any) => {
    try {
      actions.setSubmitting(false);
      var formData = new FormData();
      for (var key in values) {
        if (values[key] !== null && values[key] !== "") {
          formData.append(key, values[key]);
        }
      }
      await finishOnboarding(formData).unwrap();
      toast.success("Welcome to Conj!");
    } catch (e: any) {
      if (e.data) toast.error(e.data);
    }
  };

  return (
    <Root>
      {me ? (
        <Formik
          initialValues={{
            username: null,
            avatar: null,
          }}
          onSubmit={handleSubmit}
        >
          {(props) => (
            <StyledForm onSubmit={props.handleSubmit}>
              <ContentDetails>
                <Field
                  label="AVATAR"
                  type="AVATAR"
                  name="avatar"
                  placeholder={me.avatar}
                  component={InputFile}
                />
                <Field
                  name="username"
                  placeholder={me.username}
                  component={InputField}
                />
              </ContentDetails>
              <SubmitOptions>
                <RoundButton type="submit">Finish</RoundButton>
              </SubmitOptions>
            </StyledForm>
          )}
        </Formik>
      ) : null}
    </Root>
  );
}

const ContentDetails = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10px;
  gap: 20px;
`;

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
`;

const SquareButton = styled.button`
  box-sizing: boarder-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;

  padding: 10px 15px;

  width: auto;
  height: auto;

  background: #e2e1e5;
  border: 1px solid #e2e1e5;
  border-radius: 5px;
  cursor: pointer;
`;

const Root = styled.div`
  margin: 0 auto;
  background-color: ${(props) => props.theme.colors.white};
  text-align: center;
  border-radius: 8px;
  width: 400px;

  // @media all and (min-width: 1024px) and (max-width: 1280px) {
  //   width: 20vw;
  // }

  // @media all and (min-width: 768px) and (max-width: 1024px) {
  //   width: 20vw;
  // }

  // @media all and (min-width: 480px) and (max-width: 768px) {
  //   width: 20vw;
  // }

  @media all and (max-width: 480px) {
    width: 100%;
    padding: 0;
    border-radius: 0px;
  }
`;
