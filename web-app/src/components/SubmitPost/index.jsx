import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Modal from 'styled-react-modal';
import { useImages } from '../../hooks/useImages';
import { Formik, Form, Field } from 'formik';
import * as _ from 'lodash';
import { BoldTitle, RarityImage } from '../index';

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

  let randomString = Math.random().toString(36);

  const { handleSubmit, className } = props;

  const initialValues = {
    name: 'Anonymous',
    subject: '',
    comment: '',
    image: ''
  };

  const submitAndReset = async(values, actions) => {
    const payload = _.omit(values, ['values']);
    await handleSubmit(payload);
    actions.resetForm();
  }

  return(
    <Formik
      initialValues={initialValues}
      onSubmit={submitAndReset}>
        {(props) => (
          <Form className={className}>
            <SubmitField title={"Name"} input={<FieldInput name="name" as="input" value={props.values.name} placeholder="Anonymous" onChange={props.handleChange}/>}/>
            <SubmitField title={"Subject"} input={<FieldInput name="subject" as="input" value={props.values.subject} onChange={props.handleChange}/>} isSubmit/>
            <SubmitField title={"Comment"} input={<FieldInput name="comment" as="textarea" value={props.values.comment} onChange={props.handleChange}/>}/>
            <SubmitField title={"Image"} input={<ImagePicker key={randomString} handleChange={props.handleChange}/>}/>
          </Form>
        )}
      </Formik>
  )
}

const sortImages = (images) => {
  const compare = (a, b) => {
    const tiers = {
      'common': 0,
      'uncommon': 1,
      'rare': 2,
      'epic': 3
    }
    if(tiers[a.rarity] < tiers[b.rarity]) return -1;
    if(tiers[a.rarity] > tiers[b.rarity]) return 1;
    return 0;
  }

  const uniqueImages = _.uniqBy(images, (e) => e.name);

  let res = {}
  for(let image of uniqueImages) {
    const count = _.sumBy(images, (img) => img.name === image.name);
    res[image.name] = {...image, count: count > 1 ? count : 1}
  }

  return Object.values(res).sort(compare);
}

const ImagePicker = (props) => {

  const { handleChange } = props;

  const [isOpen, setIsOpen] = useState(false);

  const [pickedImage, setPickedImage] = useState(null);

  const { images } = useImages();

  const [groupedImages, setGroupedImages] = useState({});

  useEffect(() => {
    const sortedImages = sortImages(images).map((value, index) => <Item image={value} key={`${value.name}${index}`} badgeText={value.count} rarity={value.rarity} alt="" handleClick={(e) => handlePick(value)}/>);
    setGroupedImages(sortedImages);
  },[images])

  const toggleOpen = (e) => {
    if(e) { e.preventDefault(); }
    setIsOpen(!isOpen);
  }

  const handlePick = (image) => {
    const { location, name } = image;
    const event = { 'target': { 'name': 'image', value: name}}
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
      <ImagePickerModal isOpen={isOpen} onBackgroundClick={toggleOpen} onEscapeKeydown={toggleOpen}>
        <Header>
          <ImageGalleryTitle>Select an Image</ImageGalleryTitle>
          <CloseButton onClick={() => setIsOpen(false)}>X</CloseButton>
        </Header>
        {groupedImages.length > 0 ? <ImageGallery>{groupedImages}</ImageGallery> : null }
      </ImagePickerModal>
    </div>
  )
}

const Item = (props) => {

  const { image, badgeText, handleClick, rarity } = props;

  return(
    <div>
      <RarityImage alt="" onClick={handleClick} width={50} height={50} src={image.location} rarity={rarity}/>
      <Badge>{badgeText}</Badge>
    </div>
  )
}

const Badge = styled.div`
  border-radius: 50%;
  width: 20px;
  height: 20px;
  background-color: red;
  position: relative; 
  text-align: center;
  color: white;
  top: -15px;
  left: 43px;
`

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
  justify-content: flex-start;
  flex-direction: column;
  border: 1px solid ${props => props.theme.post.border};
  background-color: ${props => props.theme.post.backgroundColor}
`

const ImageGallery = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    flex-direction: row;
    padding: 10px;
    gap: 10px;
    overflow-y: scroll;
`

const Header = styled.div`
    height: 10%;
    text-align: center; 
    display: flex;
    justify-content: center; 
    flex-direction: row; 
    background-color: ${props => props.theme.submitPost.primary};
`
const ImageGalleryTitle = styled(BoldTitle)`
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: 90%;
`

const CloseButton = styled.button`
    width: 10%;
`
