import { Form, Formik, Field } from "formik";
import styled from "styled-components";
import { useUpdateMeMutation, useMeQuery } from "../api/account";
import { RoundButton, Text } from "../components";
import { parseError } from "../util/error";
import toast from "react-hot-toast";

export const ProfilePage = () => {
  const { data: me, isLoading, error } = useMeQuery();

  const [updateMe] = useUpdateMeMutation();

  if (error) {
    toast.error(parseError(error));
  }

  const handleUpdate = async (values, actions) => {
    try {
      actions.setSubmitting(false);
      var formData = new FormData();
      for (var key in values) {
        formData.append(key, values[key]);
      }
      await updateMe(formData).unwrap();
    } catch (e) {
      toast.error(parseError(e));
    }
  };

  if (isLoading) {
    return <div>loading</div>;
  }

  return (
    <div>
      <StyledText>Welcome {me.username}!</StyledText>
      <Formik
        initialValues={{
          username: "",
        }}
        onSubmit={handleUpdate}
      >
        {(props) => (
          <StyledForm onSubmit={props.handleSubmit}>
            <StyledField label="USERNAME" name="username" type="text" />
            <SubmitButton type="submit">Update</SubmitButton>
          </StyledForm>
        )}
      </Formik>
    </div>
  );
};

const StyledText = styled(Text)`
  padding-top: 1rem;
  font-size: 31px;
  font-weight: 700;
`;

const StyledForm = styled(Form)`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
`;

const StyledField = styled(Field)`
  border-width: 1px;
  border-color: rgb(207, 217, 222);
`;

const SubmitButton = styled(RoundButton)`
  font-size: 1rem;
  width: 50%;
  margin: 0 auto;
  margin: 1rem;
`;
