import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Modal from 'styled-react-modal';
import { useImages } from '../../hooks/useImages';
import { Formik, Form, Field } from 'formik';
import * as _ from 'lodash';
import { BoldTitle, RarityImage, RoundButton, RoundImage, Avatar } from '../index';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { updateEntry, resetPost, closeQuickReply } from '../../slices/postSlice';
import { swapThread } from '../../slices/threadSlice';
import Draggable from 'react-draggable';
import { upsertThread } from '../../api/thread';
import chroma from 'chroma-js';
import { BiImageAdd } from 'react-icons/bi';
import { AiFillDelete } from 'react-icons/ai';
import { useLocation } from 'react-router-dom/cjs/react-router-dom';

export const Reply = (props) => {

  // let randomString = Math.random().toString(36);

  const { handleSubmit, className, isOriginalPost } = props;

  const post = useSelector(state => state.post);
  
  const dispatch = useDispatch();

  // const initialValues = {
  //   name: 'Anonymous',
  //   subject: '',
  //   comment: '',
  //   image: ''
  // };

  const handleChange = (formikHandler, e, key) => {
    console.log(e);
    formikHandler(e);
    dispatch(updateEntry({key: key, value: e.target.value}));
  }

  const location = useLocation();

  const pathSlugs = location.pathname.split("/"); 

  const finalSlug = pathSlugs[pathSlugs.length - 1].match(/(\d+)/);

  const submitPost = async(values, actions) => {
    const opNo = parseInt(finalSlug);

    const res = await upsertThread(post, opNo);

    if(res) dispatch(resetPost());
  }

  return(
    <Formik
      initialValues={post}
      onSubmit={submitPost}>
        {(props) => (
          <StyledForm className={className}>
            { isOriginalPost ? <SubjectInput name="subject" as="input" placeholder="Title goes here" value={post.subject ?? ""} onChange={(e) => {handleChange(props.handleChange, e, 'subject')}}/> : null }
            <CommentBody name="comment" as="input" placeholder="Whatchu' thinking about?" value={post.comment} onChange={(e) => handleChange(props.handleChange, e, 'comment')}/>
            {post.image ? <PreviewImage src={post.image}/> : null}
            {/* <SubmitField title={"Name"} isSeparateLabel={true} input={<FieldInput name="name" as="input" placeholder="Anonymous" value={post.name} onChange={(e) => handleChange(props.handleChange, e, 'name')}/>}/>
            <SubmitField title={"Subject"} isSeparateLabel={true} input={<FieldInput name="subject" as="input" placeholder="Subject" value={post.subject} onChange={(e) => handleChange(props.handleChange, e, 'subject')}/>} isSubmit/>
            <SubmitField title={"Comment"} isSeparateLabel={true} input={<FieldInput name="comment" as="textarea" value={post.comment} placeholder="Comment" onChange={(e) => handleChange(props.handleChange, e, 'comment')}/>}/>
            <SubmitField title={"Image"} isSeparateLabel={true} input={<ImagePicker images={images} key={randomString} value={post.image} handleChange={(e) => handleChange(props.handleChange, e, 'image')}/>}/>  */}
            <ActionsContainer>
              <UploadImage/>
              <RoundButton type="submit">Post</RoundButton>
            </ActionsContainer>
          </StyledForm>
        )}
      </Formik>
  )
}

export const StyledForm = styled(Form)`
  border-radius: 8px;
  padding: 2rem;
  width: calc(80% - 64px);
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).brighten(1.5).hex()};
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const PreviewImage = ({src}) => {

  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(updateEntry({key: "image", value: null}));
  };

  return (
    <PreviewImageRoot>
      <IconContainer><DeleteIcon onClick={handleClick}/></IconContainer>
      <RoundImage src={src}/>
    </PreviewImageRoot>
  )
}

const PreviewImageRoot = styled.div`
  display: inline-block;
  position: relative;
`;

const IconContainer = styled.div`
  position: absolute; 
  top: -10px;
  left: -10px;
  width: fit-content;
  margin: 0;
  padding: 0;
`

const DeleteIcon = styled(AiFillDelete)`
  width: 24px;
  height: 24px;
  color: ${props => props.theme.newTheme.colors.white};
`;

export const UploadImageIcon = styled(BiImageAdd)`
  color: white;
  width: 3rem;
  height: 3rem;
`;

const UploadImage = () => {

  const dispatch = useDispatch();

  const handlePick = (e) => {
    dispatch(updateEntry({key: 'image', value: URL.createObjectURL(e.target.files[0])}));
  }

  return (
    <label for="file-input">
      <UploadImageIcon/>
      <UploadImageInput id="file-input" onChange={handlePick}/>
    </label>
  )
}

const UploadImageInput = styled.input.attrs(props => ({type: "file"}))`
  display: none;
  color: transparent;
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
  margin: 0 auto;
  align-items: center;
`;

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

// const ImagePicker = (props) => {

//   const { handleChange, images } = props;

//   const [isOpen, setIsOpen] = useState(false);

//   const post = useSelector(state => state.post);
  
//   const selectedImage = post.image;

//   const [groupedImages, setGroupedImages] = useState({});

//   const handlePick = (image) => {
//     const { name } = image;
//     const event = { 'target': { 'name': 'image', value: name}}
//     setIsOpen(false);
//     handleChange(event);
//   };

//   useEffect(() => {
//     const sortedImages = sortImages(images).map((value, index) => <Item image={value} key={`${value.name}${index}`} badgeText={value.count} rarity={value.rarity} alt="" handleClick={(_) => handlePick(value)}/>);
//     setGroupedImages(sortedImages);
//   },[images, handleChange])

//   const toggleOpen = (e) => {
//     if(e) { e.preventDefault(); }
//     setIsOpen(!isOpen);
//   }

//   return(
//     <div>
//       <FieldFilePicker>
//         <button onClick={(e) => toggleOpen(e)}>Choose File</button>
//         { selectedImage ? <span style={{paddingLeft: "2px"}}>{selectedImage}</span> : null }
//       </FieldFilePicker>
//       <ImagePickerModal isOpen={isOpen} onBackgroundClick={toggleOpen} onEscapeKeydown={toggleOpen}>
//         <Header>
//           <ImageGalleryTitle>Select an Image</ImageGalleryTitle>
//           <CloseButton size={24} onClick={() => setIsOpen(false)}/>
//         </Header>
//         {groupedImages.length > 0 ? <ImageGallery>{groupedImages}</ImageGallery> : null }
//       </ImagePickerModal>
//     </div>
//   )
// }

// const Item = (props) => {

//   const { image, badgeText, handleClick, rarity } = props;

//   return(
//     <div>
//       <RarityImage alt="" onClick={handleClick} width={50} height={50} src={image.location} rarity={rarity}/>
//       <Badge>{badgeText}</Badge>
//     </div>
//   )
// }

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

const CommentBody = styled(Field)`
  color: ${props => chroma(props.theme.newTheme.colors.white).darken(0.8).hex()};
  font-size: 1.25rem;
  word-break: break-word;
  background-color: inherit;
  resize: none;
  appearance: none;
  margin: 0;
  width: 100%;
  padding: 0;
  outline: none;
  border: none;
  height: fit-content;
`;

const SubjectInput = styled(Field).attrs(props => ({type: "text"}))`
  color: ${props => chroma(props.theme.newTheme.colors.white).darken(0.8).hex()};
  font-size: 2.5rem;
  background-color: inherit;
  resize: none;
  appearance: none;
  margin: 0;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0;
  outline: none;
  border: none;

  ::placeholder {
    color: ${props => chroma(props.theme.newTheme.colors.white).darken(0.8).hex()};
  }
`

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
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).brighter().hex()};
  border-radius: 8px;
  width: 30%;
  height: 45%; 
  left: calc(50% - 30%);
  bottom: calc(50% - 45%);
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
