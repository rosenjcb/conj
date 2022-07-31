import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import { Formik, Form, Field } from 'formik';
import { Checkbox, RoundButton, RoundImage, Text } from './index';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { updateEntry, resetPost } from '../slices/postSlice';
import { updateThread } from '../slices/threadSlice';
import { upsertThread } from '../api/thread';
import chroma from 'chroma-js';
import { BiImageAdd } from 'react-icons/bi';
import { AiFillDelete } from 'react-icons/ai';
import toast from 'react-hot-toast';
import { parseError } from '../util/error';
import { useThread } from '../hooks/useThread';
import { Login } from './Login';
import { me as callMe } from '../api/account'


export const Reply = (props) => {

  const { className, isNewThread } = props;

  const post = useSelector(state => state.post);
  const thread = useSelector(state => state.thread);
  
  const dispatch = useDispatch();

  const handleChange = (formikHandler, e, key) => {
    formikHandler(e);
    dispatch(updateEntry({key: key, value: e.target.value}));
  }

  const {board, threadNo } = useThread();

  const history = useHistory();

  const submitPost = async(values, actions) => {
    try {
      const res = await upsertThread(board, threadNo, post);
      const updatedThread = res.data;
      dispatch(resetPost());
      if(threadNo === null) {
        const op = updatedThread[0];
        const newPost = updatedThread[updatedThread.length - 1];
        // dispatch(swapThread(updatedThread));
        history.push(`/boards/${board}/thread/${op.id}#${newPost.id}`);
      } else {
        dispatch(updateThread(updatedThread));
      }
    } catch(e) {
      toast.error(parseError(e));
    };
  }

  const [me, setMe] = useState({});

  useEffect(() => {
    async function setAuth() {
        try { 
          const res = await callMe();
          setMe(res);
        } catch(e) {
          setMe(null);
        }
      }
    setAuth();
  },[]);

  const [check, setChecked] = useState(post.is_anonymous);

  const toggleCheck = () => {
    setChecked(!check);
    console.log(check);
    dispatch(updateEntry({key: 'is_anonymous', value: check}));
  }

  if(me === {}) {
    return(
      <div/>
    )
  } else if(me === null) {
    return(
      <Login/>
    )
  } else {
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
              <OptionsContainer>
                <UploadImage/>
                <Checkbox checked={check} onClick={toggleCheck} label="Anonymous?"/>
              </OptionsContainer>
              <RoundButton type="submit">Conj</RoundButton>
            </ActionsContainer>
          </StyledForm>
        )}
      </Formik>
    )
    }
}

export const StyledForm = styled(Form)`
  border-radius: 8px;
  padding-right: 1rem;
  padding-left: 1rem;
  padding-bottom: 1.5rem;
  padding-top: 1.5rem;
  width: 100%;
  background-color: ${props => props.theme.colors.white};
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
  color: ${props => props.theme.colors.black};
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
    color: ${props => props.theme.colors.grey};
  }
`;

const PreviewImageRoot = styled.div`
  display: inline-block;
  position: relative;
  max-width: 80%;
  margin: 0 auto;
`;

const IconContainer = styled.div`
  position: absolute; 
  top: -10px;
  left: -10px;
  width: fit-content;
  margin: 0;
  padding: 0;
`;

const DeleteIcon = styled(AiFillDelete)`
  width: 24px;
  height: 24px;
  color: ${props => props.theme.colors.primary};
`;

const UploadImageIcon = styled(BiImageAdd)`
  color: ${props => props.theme.colors.primary};
  width: 3rem;
  height: 3rem;

  &:hover {
    cursor: pointer;
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;