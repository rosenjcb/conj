import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { Formik, Field } from 'formik';
import { Header, RoundButton, Back, InputField } from './index';
import { signup, updateMe, me as callMe } from '../api/account';
import toast from 'react-hot-toast';
import { parseError } from '../util/error';
import chroma from 'chroma-js';
  
export function AccountSettings() {

    const history = useHistory();
  
    const [me, setMe] = useState(null)

    useEffect(() => {
        async function getAuth() {
            try { 
                const res = await callMe();
                setMe(res.data);
            } catch(e) {
                setMe(null);
                toast.error(parseError(e));
            }
        }
        getAuth();
    },[])

    const handleSignup = async(values) => {
      try {
        await updateMe(values);
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
            username: ''
          }}
          onSubmit={handleSignup}
        >
          {(props) => (
            <StyledForm onSubmit={props.handleSubmit}>
              <Field label="USERNAME" type="username" name="username" placeholder={me.username} component={InputField}/>
              <SubmitOptions>
                <RoundButton type="submit">Update</RoundButton> 
              </SubmitOptions>
            </StyledForm>
        )}
        </Formik> : null }
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