import { ChangeEvent, SyntheticEvent, useState } from "react";
import styled from "styled-components";
import { Formik, Form, Field, FormikHelpers } from "formik";
import {
  RoundButton,
  RoundImage,
  Modal,
  Avatar,
  InputField,
  Switch,
} from "./index";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { updateEntry, resetPost, PostState } from "../slices/postSlice";
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
import { useAppSelector } from "../store";

interface FullReplyProps {
  className?: string;
  isNewThread: boolean;
  handleClose: () => void;
}

const FullReply = (props: FullReplyProps) => {
  const { className, isNewThread, handleClose } = props;

  const post = useAppSelector((state) => state.post);

  const { board, threadNo } = useThread();

  const [updateThread] = useUpdateThreadMutation();
  const [createThread] = useCreateThreadMutation();

  const dispatch = useDispatch();

  const handleChange = (
    formikHandler: (x: any) => void,
    e: SyntheticEvent,
    key: string
  ) => {
    const target = e.target as HTMLInputElement;
    formikHandler(e);
    dispatch(updateEntry({ key: key, value: target.value }));
  };

  const [loading, setLoading] = useState(false);

  const history = useHistory();

  const makePostRequest = (post: PostState, isReply: boolean) => {
    const baseKeys = ["name", "image", "comment", "is_anonymous"];
    const finalKeys = isReply ? baseKeys : [...baseKeys, "subject"];
    const req = _.pick(post, ...finalKeys);
    var formData = new FormData();
    for (let [key, val] of Object.entries(req)) {
      const stringified =
        val instanceof Blob || typeof val === "string"
          ? val
          : JSON.stringify(val);
      if (val !== null) formData.append(key, stringified);
    }
    return formData;
  };

  const submitPost = async (
    values: PostState,
    actions: FormikHelpers<PostState>
  ) => {
    try {
      setLoading(true);
      if (threadNo !== null && board !== null) {
        await updateThread({
          board,
          threadNo,
          post: makePostRequest(post, true),
        }).unwrap();
      } else {
        if (board !== null) {
          const res = await createThread({
            board,
            post: makePostRequest(post, false),
          }).unwrap();
          const op = res[0];
          const newPost = res[res.length - 1];
          history.push(`/boards/${board}/thread/${op.id}#${newPost.id}`);
        }
      }
      dispatch(resetPost());
    } catch (e: any) {
      if (e && "status" in e) {
        toast.error(e.data);
      }
    } finally {
      handleClose();
      setLoading(false);
    }
  };

  const { data: me, isLoading } = useMeQuery();

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
    console.log("changing check");
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
                  placeholder="Title"
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
                placeholder="Comment here..."
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
                    <Switch
                      disabled={me === null}
                      checked={check}
                      label="Anonymous"
                      onCheckedChange={toggleCheck}
                    />
                  ) : // <Checkbox
                  //   disabled={me === null}
                  //   checked={check}
                  //   onChange={toggleCheck}
                  //   label="Anonymous?"
                  // />
                  null}
                </OptionsContainer>
                <RoundButton disabled={me === null || loading} type="submit">
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

interface FakeReplyProps {
  onClick: () => void;
  className?: string;
}

const FakeReply = ({ onClick, className }: FakeReplyProps) => {
  const { data: me } = useMeQuery();

  return (
    <FakeReplyRoot onClick={onClick} className={className}>
      <Avatar avatar={me?.avatar} />
      <InputField disabled placeholder="Comment here..." />
    </FakeReplyRoot>
  );
};

const FakeReplyRoot = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  background-color: ${(props) => props.theme.colors.white};
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 2px;
  padding-bottom: 2px;
  box-sizing: border-box;
  width: 100%;
  gap: 10px;
  align-self: center;
  height: 54px;
  /* border-bottom: 2px solid ${(props) => props.theme.colors.grey}; */
`;

interface ReplyProps {
  className?: string;
  isNewThread: boolean;
}

export const Reply = ({ className, isNewThread }: ReplyProps) => {
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
        <FullReply handleClose={closeModal} isNewThread={isNewThread} />
      </Modal>
      <FakeReply className={className} onClick={toggleModal} />
    </ReplyRoot>
  );
};

const ReplyRoot = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
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
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

interface PreviewImageProps {
  src: string;
}

const PreviewImage = ({ src }: PreviewImageProps) => {
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

interface UploadImageProps {
  disabled: boolean;
}

const UploadImage = ({ disabled }: UploadImageProps) => {
  const dispatch = useDispatch();

  const handlePick = (e: ChangeEvent) => {
    const input = e.target as HTMLInputElement;

    if (input.files?.length) {
      dispatch(updateEntry({ key: "image", value: input.files[0] }));
    }
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
  font-size: 2rem;
  background-color: inherit;
  resize: none;
  appearance: none;
  margin: 0;
  width: 100%;
  padding: 0;
  outline: none;
  border: none;

  /* ::placeholder {
    color: ${(props) => props.theme.colors.grey};
  } */
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
  color: ${(props) => props.theme.colors.black};
`;

const UploadImageIcon = styled(BiImageAdd)`
  color: ${(props) => props.theme.colors.black};
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
