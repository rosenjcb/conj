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
            toast.error(e);
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

    return (
        <div>
            <Text>Welcome {me.username}</Text>
            <Formik
                initialValues={{
                    username:''
                }}
                onSubmit={handleUpdate}
                >
            {(props) => (
                <StyledForm onSubmit={props.handleSubmit}>
                    <Field label="USERNAME" name="username" type="text" />
                    <SubmitButton type='submit'>Update</SubmitButton>
                </StyledForm>
            )}
            </Formik>
        </div>
    )
}

const StyledForm = styled(Form)`
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
`;

const SubmitButton = styled(RoundButton)`
`;