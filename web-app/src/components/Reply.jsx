import React from 'react'
import styled from 'styled-components'
import { Formik, Form, Field } from 'formik';
import { RoundButton, RoundImage } from './index';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { updateEntry, resetPost } from '../slices/postSlice';
import { swapThread } from '../slices/threadSlice';
import { upsertThread } from '../api/thread';
import chroma from 'chroma-js';
import { BiImageAdd } from 'react-icons/bi';
import { AiFillDelete } from 'react-icons/ai';
import { useLocation } from 'react-router-dom/cjs/react-router-dom';
import toast from 'react-hot-toast';
import { parseError } from '../util/error';


export const Reply = (props) => {

  const { className, isNewThread } = props;

  const post = useSelector(state => state.post);
  
  const dispatch = useDispatch();

  const handleChange = (formikHandler, e, key) => {
    formikHandler(e);
    dispatch(updateEntry({key: key, value: e.target.value}));
  }

  const location = useLocation();

  const history = useHistory();

  const pathSlugs = location.pathname.split("/"); 

  const finalSlug = pathSlugs[pathSlugs.length - 1].match(/(\d+)/);

  const board = pathSlugs[pathSlugs.length - 1];

  const opNo = parseInt(finalSlug);

  const submitPost = async(values, actions) => {

    try {
      const res = await upsertThread(post, opNo);
      dispatch(swapThread(res.data));
      dispatch(resetPost());
      const op = res.data[0];
      const newPost = res.data[res.data.length - 1];
      if(!opNo) {
        history.push(`/boards/${board}/thread/${op.id}#${newPost.id}`);
      }
    } catch(e) {
      toast.error(parseError(e));
    };
  }

  return(
    <Formik
      initialValues={post}
      onSubmit={submitPost}>
        {(props) => (
          <StyledForm className={className}>
            { isNewThread ? <SubjectInput name="subject" as="input" placeholder="Title goes here" value={post.subject ?? ""} onChange={(e) => {handleChange(props.handleChange, e, 'subject')}}/> : null }
            <CommentBody name="comment" as="textarea" placeholder="Whatchu' thinking about?" value={post.comment} onChange={(e) => handleChange(props.handleChange, e, 'comment')}/>
            {post.image ? <PreviewImage src={URL.createObjectURL(post.image)}/> : null}
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
  padding-right: 1rem;
  padding-left: 1rem;
  padding-bottom: 1.5rem;
  padding-top: 1.5rem;
  width: 100%;
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

const UploadImage = () => {

  const dispatch = useDispatch();

  const handlePick = (e) => {
    dispatch(updateEntry({key: 'image', value: e.target.files[0]}));
  }

  return (
    <label htmlFor="file-input">
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


const CommentBody = styled(Field)`
  color: ${props => chroma(props.theme.newTheme.colors.white).darken(0.8).hex()};
  font-size: 1.25rem;
  word-break: break-word;
  background-color: inherit;
  resize: vertical;
  scrollbar-width: none;
  margin: 0;
  width: 100%;
  padding: 0;
  outline: none;
  border: none;
  height: 5rem;
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
`;

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

const UploadImageIcon = styled(BiImageAdd)`
  color: white;
  width: 3rem;
  height: 3rem;
`;