import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Modal from 'styled-react-modal';
import { useImages } from '../../hooks/useImages';
import { Formik, Form, Field } from 'formik';
import * as _ from 'lodash';
import { BoldTitle, RarityImage } from '../index';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { updateEntry, resetPost, closeQuickReply } from '../../slices/postSlice';
import { swapThread } from '../../slices/threadSlice';
import Draggable from 'react-draggable';
import { upsertThread } from '../../api/thread';

const SubmitField = (props) => {
  const { title, input, isSubmit, isSeparateLabel } = props;

  return(
    <FieldRoot>
      { isSeparateLabel ? <FieldName>{title}</FieldName> : null }
      {input}
      { isSubmit ? <button type="submit">Post</button> : null}
    </FieldRoot>
  )
}

export const Reply = (props) => {

  let randomString = Math.random().toString(36);

  const { handleSubmit, className } = props;

  const post = useSelector(state => state.post);
  
  const dispatch = useDispatch();

  const { images } = useImages();

  const initialValues = {
    name: 'Anonymous',
    subject: '',
    comment: '',
    image: ''
  };

  const handleChange = (formikHandler, e, key) => {
    formikHandler(e);
    dispatch(updateEntry({key: key, value: e.target.value}));
  }

  const submitPost = async(values, actions) => {
    const res = await handleSubmit(post);
    if(res) dispatch(resetPost());
  }

  return(
    <Formik
      initialValues={initialValues}
      onSubmit={submitPost}>
        {(props) => (
          <Form className={className}>
            <SubmitField title={"Name"} isSeparateLabel={true} input={<FieldInput name="name" as="input" placeholder="Anonymous" value={post.name} onChange={(e) => handleChange(props.handleChange, e, 'name')}/>}/>
            <SubmitField title={"Subject"} isSeparateLabel={true} input={<FieldInput name="subject" as="input" placeholder="Subject" value={post.subject} onChange={(e) => handleChange(props.handleChange, e, 'subject')}/>} isSubmit/>
            <SubmitField title={"Comment"} isSeparateLabel={true} input={<FieldInput name="comment" as="textarea" value={post.comment} placeholder="Comment" onChange={(e) => handleChange(props.handleChange, e, 'comment')}/>}/>
            <SubmitField title={"Image"} isSeparateLabel={true} input={<ImagePicker images={images} key={randomString} value={post.image} handleChange={(e) => handleChange(props.handleChange, e, 'image')}/>}/>
          </Form>
        )}
      </Formik>
  )
}

export const QuickReply = (props) => {
  let randomString = Math.random().toString(36);

  const { className } = props;

  const post = useSelector(state => state.post);
  
  const dispatch = useDispatch();

  const history = useHistory();

  const [error, setError] = useState(null);

  const { images } = useImages();

  const handleChange = (formikHandler, e, key) => {
    formikHandler(e);
    dispatch(updateEntry({key: key, value: e.target.value}));
  }

  const submitPost = async(values, actions) => {
    setError(null);
    try {
      const res = await upsertThread(post, post.threadNo);
      const thread = res.data;
      dispatch(swapThread(thread));
      dispatch(closeQuickReply());
      dispatch(resetPost());
      history.push(`/thread/${res.data[0].id}`);
      history.go()
    } catch (error) {
      setError(error.response.data);
    }
  }

  const handleClose = (e) => {
    e.preventDefault();
    dispatch(closeQuickReply());
  }

  return(
    <Draggable bounds="parent">
    <QuickReplyRoot hidden={post.hidden}>
    <Formik
      initialValues={post}
      onSubmit={submitPost}>
        {(props) => (
          <Form className={className}>
            <QuickReplySubject>
              {`Reply To Thread No. ${post.threadNo}`}
              <CloseButton onClick={handleClose}/>
            </QuickReplySubject>
            <SubmitField title={"Name"} isSeparateLabel={false} input={<FieldInput name="name" as="input" placeholder="Anonymous" value={post.name} onChange={(e) => handleChange(props.handleChange, e, 'name')}/>}/>
            <SubmitField title={"Subject"} isSeparateLabel={false} input={<FieldInput name="subject" as="input" placeholder="Subject" value={post.subject} onChange={(e) => handleChange(props.handleChange, e, 'subject')}/>}/>
            <SubmitField title={"Comment"} isSeparateLabel={false} input={<FieldInput name="comment" as="textarea" placeholder="Comment" value={post.comment} onChange={(e) => handleChange(props.handleChange, e, 'comment')}/>}/>
            <SubmitField title={"Image"} isSeparateLabel={false} isSubmit input={<ImagePicker images={images} key={randomString} value={post.image} handleChange={(e) => handleChange(props.handleChange, e, 'image')}/>}/>
            <ErrorDetails>{error}</ErrorDetails>
          </Form>
        )}
    </Formik>
    </QuickReplyRoot>
    </Draggable>
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

  const { handleChange, images } = props;

  const [isOpen, setIsOpen] = useState(false);

  const post = useSelector(state => state.post);
  
  const selectedImage = post.image;

  const [groupedImages, setGroupedImages] = useState({});

  const handlePick = (image) => {
    const { name } = image;
    const event = { 'target': { 'name': 'image', value: name}}
    setIsOpen(false);
    handleChange(event);
  };

  useEffect(() => {
    const sortedImages = sortImages(images).map((value, index) => <Item image={value} key={`${value.name}${index}`} badgeText={value.count} rarity={value.rarity} alt="" handleClick={(_) => handlePick(value)}/>);
    setGroupedImages(sortedImages);
  },[images, handleChange])

  const toggleOpen = (e) => {
    if(e) { e.preventDefault(); }
    setIsOpen(!isOpen);
  }

  return(
    <div>
      <FieldFilePicker>
        <button onClick={(e) => toggleOpen(e)}>Choose File</button>
        { selectedImage ? <span style={{paddingLeft: "2px"}}>{selectedImage}</span> : null }
      </FieldFilePicker>
      <ImagePickerModal isOpen={isOpen} onBackgroundClick={toggleOpen} onEscapeKeydown={toggleOpen}>
        <Header>
          <ImageGalleryTitle>Select an Image</ImageGalleryTitle>
          <CloseButton size={24} onClick={() => setIsOpen(false)}/>
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
`

const QuickReplySubject = styled(FieldName)`
  display: block;
  width: calc(100% - 4px);
  padding: 0;
  margin: 0 auto;
  text-align: center;
  height: auto;
  overflow: hidden;
`;

const FieldInput = styled(Field)`
  margin: 0;
  width: ${props => props.fill ? '292px' : '244px'};
  margin-right: 2px;
  padding: 2px 4px 3px;
  border: 1px solid #aaa;
  flex: 1;
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
`;

const ImageGallery = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    flex-direction: row;
    padding: 10px;
    gap: 10px;
    overflow-y: scroll;
`;

const Header = styled.div`
    height: 10%;
    text-align: center; 
    display: flex;
    justify-content: center; 
    align-items: center;
    flex-direction: row; 
    background-color: ${props => props.theme.submitPost.primary};
`;

const ImageGalleryTitle = styled(BoldTitle)`
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: 90%;
`;

const CloseButton = styled.button`
    float: right;
    right: 0;
    margin: 0;
    padding: 0;
    width: ${props => props.size ?? 18}px;
    height: ${props => props.size ?? 18}px;
    border-style: none;
    background-image: url("/cross.png");
    background-size: cover;
    background-repeat: no-repeat;
    background-color: inherit;
`;

const QuickReplyRoot = styled.div`
  min-height: 125px;
  min-width: 335px;
  max-width: 125px;
  max-height: 335px;
  left: calc(50% - 125px);
  bottom: calc(50% - 165px);
  background-color: ${props => props.theme.post.border};
  position: absolute;
  z-index: 1;

  @media all and (min-width: 1024px) and (max-width: 1280px) {
    visibility: ${props => props.hidden ? 'hidden' : 'visible'};
  }
  
  @media all and (min-width: 768px) and (max-width: 1024px) { 
    visibility: ${props => props.hidden ? 'hidden' : 'visible'};
  }
  
  @media all and (min-width: 480px) and (max-width: 768px) { 
    visibility: hidden; 
  }
  
  @media all and (max-width: 480px) { 
    visibility: hidden; 
  }
`;

const ErrorDetails = styled.div`
  width: 100%;
  height: auto;
  background-color: red;
  color: white;
`;
