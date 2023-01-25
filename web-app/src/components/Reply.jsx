import React, { useState } from "react";
import styled from "styled-components";
import { Formik, Form, Field } from "formik";
import { Checkbox, RoundButton, RoundImage, Modal, Avatar } from "./index";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { updateEntry, resetPost } from "../slices/postSlice";
import {
  useCreateThreadMutation,
  useUpdateThreadMutation,
} from "../api/thread";
import { BiImageAdd } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";
import toast from "react-hot-toast";
import { useThread } from "../hooks/useThread";
import { Login } from "./Login";
import { useMeQuery } from "../api/account";
import _ from "lodash";

const FullReply = (props) => {
  const { className, isNewThread, handleClose } = props;

  const post = useSelector((state) => state.post);

  const { board, threadNo } = useThread();

  const [updateThread] = useUpdateThreadMutation();
  const [createThread] = useCreateThreadMutation();

  const dispatch = useDispatch();

  const handleChange = (formikHandler, e, key) => {
    formikHandler(e);
    dispatch(updateEntry({ key: key, value: e.target.value }));
  };

  const history = useHistory();

  const submitPost = async (values, actions) => {
    try {
      const req = _.pick(
        post,
        "name",
        "image",
        "subject",
        "comment",
        "is_anonymous"
      );
      var formData = new FormData();
      for (let [key, val] of Object.entries(req)) {
        if (val !== null) formData.append(key, val);
      }
      if (threadNo !== null) {
        await updateThread({
          board,
          threadNo,
          post: formData,
        }).unwrap();
      } else {
        const res = await createThread({ board, post: formData }).unwrap();
        const op = res[0];
        const newPost = res[res.length - 1];
        history.push(`/boards/${board}/thread/${op.id}#${newPost.id}`);
      }
      dispatch(resetPost());
    } catch (e) {
      console.log("uh woops");
      if (e.data) toast.error(e.data);
    } finally {
      handleClose();
    }
  };

  const { data: me, isLoading } = useMeQuery();

  //const me = null;
  //const isLoading = false;
  const [check, setChecked] = useState(post.is_anonymous);

  const handleClick = () => {
    if (me === null) {
      openLogin();
    }
  };

  const [loginOpen, setLoginOpen] = useState(false);

  const closeLogin = () => setLoginOpen(false);

  const openLogin = () => setLoginOpen(true);

  const toggleCheck = () => {
    setChecked(!check);
    console.log(check);
    dispatch(updateEntry({ key: "is_anonymous", value: !check }));
  };

  if (isLoading) {
    return <div />;
  } else {
    return (
      <FullReplyRoot>
        {me === null ? (
          <Modal isOpen={loginOpen} onRequestClose={closeLogin} title="Login">
            <Login completeAction={closeLogin} />
          </Modal>
        ) : null}
        <Formik initialValues={post} onSubmit={submitPost}>
          {(props) => (
            <StyledForm className={className} onClick={handleClick}>
              {isNewThread ? (
                <SubjectInput
                  disabled={me === null}
                  name="subject"
                  as="input"
                  placeholder="Title goes here"
                  value={post.subject ?? ""}
                  onChange={(e) => {
                    handleChange(props.handleChange, e, "subject");
                  }}
                />
              ) : null}
              <CommentBody
                disabled={me === null}
                name="comment"
                as="textarea"
                placeholder="Whatchu' thinking about?"
                value={post.comment}
                onChange={(e) => handleChange(props.handleChange, e, "comment")}
              />
              {post.image ? (
                <PreviewImage src={URL.createObjectURL(post.image)} />
              ) : null}
              <ActionsContainer>
                <OptionsContainer>
                  <UploadImage disabled={me === null} />
                  {threadNo === null ? (
                    <Checkbox
                      disabled={me === null}
                      checked={check}
                      onChange={toggleCheck}
                      label="Anonymous?"
                    />
                  ) : null}
                </OptionsContainer>
                <RoundButton disabled={me === null} type="submit">
                  Conj
                </RoundButton>
              </ActionsContainer>
            </StyledForm>
          )}
        </Formik>
      </FullReplyRoot>
    );
  }
};

const FakeReply = ({ onClick }) => {
  const { data: me } = useMeQuery();

  return (
    <FakeReplyRoot onClick={onClick}>
      <Avatar avatar={me?.avatar} />
      <FakeTextBox disabled />
    </FakeReplyRoot>
  );
};

const FakeReplyRoot = styled.div`
  display: flex;
  position: sticky;
  top: 50px;
  left: 50px;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  background-color: ${(props) => props.theme.colors.white};
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 4px;
  padding-bottom: 4px;
  gap: 10px;
  height: 50%;
  border-bottom: 2px solid ${(props) => props.theme.colors.grey};
`;

const FakeTextBox = styled.input.attrs({
  type: "text",
})`
  background-color: ${(props) => props.theme.colors.grey};
  resize: vertical;
  scrollbar-width: none;
  margin: 0;
  padding: 0;
  width: 100%;
  outline: none;
  border: none;
  height: 40px;
`;

export const Reply = (props) => {
  const [open, setOpen] = useState(false);

  const toggleModal = () => {
    setOpen(!open);
  };

  const closeModal = () => {
    setOpen(false);
  };

  return (
    <ReplyRoot>
      <Modal onRequestClose={closeModal} isOpen={open}>
        <FullReply {...props} handleClose={closeModal} />
      </Modal>
      <FakeReply onClick={toggleModal} />
    </ReplyRoot>
  );
};

const ReplyRoot = styled.div`
  width: 100%;
`;

const FullReplyRoot = styled.div`
  margin: 0 auto;
  max-width: 500px;
  background-color: ${(props) => props.theme.colors.white};

  @media all and (min-width: 1024px) {
    border-radius: 8px;
    width: 500px;
  }

  @media all and (min-width: 768px) and (max-width: 1024px) {
    border-radius: 8px;
    width: 500px;
  }

  @media all and (min-width: 480px) and (max-width: 768px) {
    border-radius: 8px;
    width: 500px;
  }

  @media all and (max-width: 480px) {
    border-radius: 0px;
    width: 100%;
  }
`;

export const StyledForm = styled(Form)`
  /* padding-bottom: 1.5rem;
  padding-top: 1.5rem; */
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const PreviewImage = ({ src }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(updateEntry({ key: "image", value: null }));
  };

  return (
    <PreviewImageRoot>
      <IconContainer>
        <DeleteIcon onClick={handleClick} />
      </IconContainer>
      <RoundImage src={src} />
    </PreviewImageRoot>
  );
};

const UploadImage = ({ disabled }) => {
  const dispatch = useDispatch();

  const handlePick = (e) => {
    dispatch(updateEntry({ key: "image", value: e.target.files[0] }));
  };

  return (
    <label htmlFor="file-input">
      <UploadImageIcon />
      <UploadImageInput
        disabled={disabled}
        id="file-input"
        onChange={handlePick}
      />
    </label>
  );
};

const UploadImageInput = styled.input.attrs((props) => ({ type: "file" }))`
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

const SubjectInput = styled(Field).attrs((props) => ({ type: "text" }))`
  color: ${(props) => props.theme.colors.black};
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
    color: ${(props) => props.theme.colors.grey};
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
  color: ${(props) => props.theme.colors.primary};
`;

const UploadImageIcon = styled(BiImageAdd)`
  color: ${(props) => props.theme.colors.primary};
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
