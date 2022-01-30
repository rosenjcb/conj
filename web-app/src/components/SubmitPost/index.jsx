import React, { useState } from 'react'
import styled from 'styled-components'
import Modal from 'styled-react-modal';
import { useImages } from '../../hooks/useImages';
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

  const { handleSubmit, className } = props;

  return(
    <Formik
      initialValues={{
        name: 'Anonymous',
        subject: '',
        comment: '',
        image: ''
      }}
      onSubmit={handleSubmit}>
        {(props) => (
          <Form className={className}>
            <SubmitField title={"Name"} input={<FieldInput name="name" as="input" placeholder="Anonymous" onChange={props.handleChange}/>}/>
            <SubmitField title={"Subject"} input={<FieldInput name="subject" as="input" onChange={props.handleChange}/>} isSubmit/>
            <SubmitField title={"Comment"} input={<FieldInput name="comment" as="textarea" fill onChange={props.handleChange}/>}/>
            <SubmitField title={"Image"} input={<ImagePicker handleChange={props.handleChange}/>}/>
          </Form>
        )}
      </Formik>
  )
}

const ImagePicker = (props) => {

  const { handleChange } = props;

  const [isOpen, setIsOpen] = useState(false);

  const [pickedImage, setPickedImage] = useState(null);

  const { images } = useImages();

  const toggleOpen = (e) => {
    if(e) { e.preventDefault(); }
    setIsOpen(!isOpen);
  }

  const handlePick = (image) => {
    const { location, name } = image;
    const event = { 'target': { 'name': 'image', value: location}}
    setPickedImage(name);
    setIsOpen(false);
    handleChange(event);
  }

  return(
    <div>
      <FieldFilePicker>
        <button onClick={(e) => toggleOpen(e)}>Choose File</button>
        { pickedImage ? <span>{pickedImage}</span> : null }
      </FieldFilePicker>
      <ImagePickerModal isOpen={isOpen} onBackgroundClick={toggleOpen} onEscapeKeyDown={toggleOpen}>
        {images.map(image => <img alt="" onClick={(e) => handlePick(image)} key={image.id} width={50} height={50} src={image.location}/>)}
      </ImagePickerModal>
    </div>
  )
}

const FieldRoot = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 1px;
`;

const FieldName = styled.span`
  display: inline-flex;
  align-items: center;
  background-color: ${props => props.theme.submitPost.primary};
  width: 100px;
  text-align: left;
  color: #000;
  font-weight: 700;
  border: 1px solid #000;
  padding: 0 5px;
  font-size: 10pt;
  vertical-align: center;
`

const FieldInput = styled(Field)`
  margin: 0;
  width: ${props => props.fill ? '292px' : '244px'};
  margin-right: 2px;
  padding: 2px 4px 3px;
  border: 1px solid #aaa;
  outline: none;
  font-family: aria, helvetica, sans-serif;
  font-size: 10pt;
  -webkit-appearance: none;

  &:focus {
        outline: none;
    }
`;

const FieldFilePicker = styled.div`
  margin: 0;
  width: 292px;
  appearance: none;
  border: 0 none;
  outline: none;
  display: flex;
  flex-direction: row;
  justify-content: flex-start
  font-family: aria, helvetica, sans-serif;
  font-size: 10pt;

  &:focus {
        outline: none;
    }
`;

const ImagePickerModal = Modal.styled`
  width: 20rem;
  height: 20rem;
  display: flex;
  gap: 20px;
  padding: 1rem;
  justify-content: flex-start;
  background-color: white;
`

