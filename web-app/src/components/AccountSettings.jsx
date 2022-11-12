import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { Formik, Field } from 'formik';
import { Header, RoundButton, InputField, InputFile } from './index';
import { useMeQuery, useUpdateMeMutation } from '../api/account';
import toast from 'react-hot-toast';
import { parseError } from '../util/error';
import chroma from 'chroma-js';
  
export function AccountSettings() {

    const history = useHistory();

    const [updateMe] = useUpdateMeMutation();

    const { data: me, error } = useMeQuery();

    if(error) {
      toast.error(parseError(error));
    }

    const handleUpdate = async(values, actions) => {
      try{
          actions.setSubmitting(false);
          var formData = new FormData();
          for(var key in values) {
            formData.append(key, values[key]);
          }
          await updateMe(formData).unwrap();
          history.push('/');
          history.go();
      } catch(e) {
        toast.error(parseError(e));
      }
  }
  
    return (
      <Root>
        <Header bold size="large">Account</Header>
        { me ? <Formik
          initialValues={{
            username: null,
            avatar: null
          }}
          onSubmit={handleUpdate}
        >
          {(props) => (
            <StyledForm onSubmit={props.handleSubmit}>
              <ContentDetails> 
                <Field label="AVATAR" type="AVATAR" name="avatar" placeholder={me.avatar} component={InputFile}/>
                <Field label="USERNAME" type="username" name="username" placeholder={me.username} component={InputField}/>
              </ContentDetails>
              <SubmitOptions>
                <RoundButton type="submit">Update</RoundButton> 
              </SubmitOptions>
            </StyledForm>
        )}
        </Formik> : null }
      </Root>
    )
  }

const ContentDetails = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
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