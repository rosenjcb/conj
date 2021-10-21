import React, { useState } from 'react'
import { useEffect } from 'react';
import { Root, FieldRoot, FieldName, FieldInput, FieldInputArea, FieldInputFile } from './styles';

const Field = (props) => {
  const { title, input, isSubmit } = props;

  return(
    <FieldRoot>
      <FieldName>{title}</FieldName>
      {input}
      { isSubmit ? <button>Post</button> : null}
    </FieldRoot>
  )
}

export const SubmitBox = (props) => {

  return(
    <Root>
      <Field title={"Name"} input={<FieldInput type="text" placeholder="Anonymous"/>}/>
      <Field title={"Subject"} input={<FieldInput type="text" />} isSubmit/>
      <Field title={"Comment"} input={<FieldInputArea type="text-area"/>}/>
      <Field title={"Image"} input={<FieldInputFile type="file"/>}/>
    </Root>
  )
}