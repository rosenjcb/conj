import { Form, Formik, Field } from 'formik';
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import { updateMe } from '../api/account';
import { RoundButton, Text } from '../components';
import { parseError } from '../util/error';
import toast from 'react-hot-toast';
import { me as callMe } from '../api/account';




export const ProfilePage = () => {

    const [me, setMe] = useState({});

    useEffect(async() => {
        try{
            const response = await callMe();
            setMe(response.data);
        } catch(e) {
            setMe(null);
            toast.error(parseError(e));
        }
    },[])

    const handleUpdate = async(values, actions) => {
        try{
            actions.setSubmitting(false);
            await updateMe(values);
        } catch(e) {
          toast.error(parseError(e));
        }
    }

    if(me === null) {
        return (
            <div>loading</div>
        )
    }

    return (
        <div>
            <StyledText>Welcome {me.username}!</StyledText>
            <Formik
                initialValues={{
                    username:''
                }}
                onSubmit={handleUpdate}
                >
            {(props) => (
                <StyledForm onSubmit={props.handleSubmit}>
                    <StyledField label="USERNAME" name="username" type="text" />
                    <SubmitButton type='submit'>Update</SubmitButton>
                </StyledForm>
            )}
            </Formik>
        </div>
    )
}

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