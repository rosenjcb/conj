import React, { useEffect, useState } from 'react'
import { Root, FieldRoot, FieldName, FieldInput, FieldInputArea, FieldInputFile, ImagePickerModal, FieldFilePicker } from './styles';
import { useImages } from '../../hooks/useImages';
import { Formik, Form, Field } from 'formik';
import axios from 'axios';

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
            {/* <SubmitField title={"Image"} input={<FieldInputFile name="image" type="file" onChange={props.handleChange}/>}/> */}
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
        {images.map(image => <img onClick={(e) => handlePick(image)} key={image.id} width={50} height={50} src={image.location}/>)}
      </ImagePickerModal>
    </div>
  )
}
