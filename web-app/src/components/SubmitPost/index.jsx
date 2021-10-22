import React, { useState } from 'react'
import { Root, FieldRoot, FieldName, FieldInput, FieldInputArea, FieldInputFile } from './styles';
import { Formik, Form, Field } from 'formik';

const SubmitField = (props) => {
  const { title, input, isSubmit } = props;

  return(
    <FieldRoot>
      <FieldName>{title}</FieldName>
      {input}
      { isSubmit ? <button type="submit">Post</button> : null}
    </FieldRoot>
  )
}

export const SubmitPost = (props) => {

  return(
    <Formik
      initialValues={{
        name: 'Anonymous',
        subject: '',
        comment: '',
        image: ''
      }}
      onSubmit={(values) => alert(JSON.stringify(values, null, 2))}>
        {(props) => (
          <Form>
            <SubmitField title={"Name"} input={<FieldInput name="name" as="input" placeholder="Anonymous" onChange={props.handleChange}/>}/>
            <SubmitField title={"Subject"} input={<FieldInput name="subject" as="input" onChange={props.handleChange}/>} isSubmit/>
            <SubmitField title={"Comment"} input={<FieldInput name="comment" as="textarea" fill onChange={props.handleChange}/>}/>
            <SubmitField title={"Image"} input={<FieldInputFile name="image" type="file" onChange={props.handleChange}/>}/>
          </Form>
        )}
      </Formik>
  )
}