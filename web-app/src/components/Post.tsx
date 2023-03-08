import { useState, useRef, ReactNode, Ref, RefObject } from "react";
import styled from "styled-components";
import {
  Text,
  Avatar,
  Modal,
  Checkbox,
  RoundButton,
  AnonymousAvatar,
} from "./index";
import { processPostText } from "../util/post";
import { useDispatch } from "react-redux";
import { insertPostLink } from "../slices/postSlice";
import { Link } from "react-router-dom";
import { BiMessageDetail, BiShareAlt } from "react-icons/bi";
import { VscEllipsis } from "react-icons/vsc";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { useDetectOutsideClick } from "../hooks/useDetectOutsideClick";
import { useDeleteThreadMutation } from "../api/thread";
import { toast } from "react-hot-toast";
import * as _ from "lodash";
import { useMeQuery } from "../api/account";
import { ImageMap, Post } from "../types";

interface WithTextProps {
  direction: string;
  component: ReactNode | string;
  text: string;
}

const WithText = ({ direction, component, text }: WithTextProps) => {
  return (
    <WithTextRoot direction={direction}>
      {component}
      <IconText>{text}</IconText>
    </WithTextRoot>
  );
};

const handlePostDate = (time: string) => {
  const now = new Date();
  const then = new Date(time);

  const hours = Math.abs(now.getTime() - then.getTime()) / 36e5;

  if (hours < 24) {
    if (hours < 1) {
      const minutes = hours * 60;
      if (minutes < 1) {
        const seconds = Math.round(minutes * 60);
        if (seconds < 1) {
          return "Just now";
        } else {
          return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
        }
      }
      return `${Math.round(minutes)} ${"min"}`;
    }
    return `${Math.round(hours)} ${hours === 1 ? "hr" : "hrs"}`;
  } else {
    return then.toLocaleDateString();
  }
};

interface DeleteDialogProps {
  board: string;
  threadNo: number;
  replyNo?: number | null;
  closeAction: () => any;
}

const DeleteDialog = ({
  board,
  threadNo,
  replyNo,
  closeAction,
}: DeleteDialogProps) => {
  const { data: me } = useMeQuery();

  const [banUser, setBanUser] = useState(false);
  const toggleBanUser = () => setBanUser(!banUser);

  const [deleteThread] = useDeleteThreadMutation();

  const params = {
    ban: banUser,
    replyNo,
  };

  const deleteReq = {
    board: board,
    threadNo,
    params: _.omitBy(params, _.isNil),
  };

  const handleSubmit = async () => {
    try {
      await deleteThread(deleteReq).unwrap();
      // console.log(JSON.stringify(deleteReq, null, 2));
      toast.success(`Successfully deleted Post #${replyNo ?? threadNo}`);
    } catch (e: any) {
      if (e && "status" in e) toast.error(e.data);
    } finally {
      closeAction();
    }
  };

  return (
    <DeleteDialogRoot>
      {me?.role === "admin" ? (
        <Checkbox label="Ban User?" onChange={toggleBanUser} />
      ) : null}
      <SubmitOptions>
        <RoundButton color="darkGrey" size="small" onClick={closeAction}>
          Cancel
        </RoundButton>
        <RoundButton size="small" onClick={handleSubmit}>
          Delete
        </RoundButton>
      </SubmitOptions>
    </DeleteDialogRoot>
  );
};

const SubmitOptions = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  gap: 10px;
`;

const DeleteDialogRoot = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  align-self: center;
  width: fit-content;
  max-width: 400px;
  padding: 10px;
  gap: 10px;
`;

interface PostProps {
  post: Post;
  handleRef?: Ref<any>;
  preview: boolean;
  replyCount: number;
  opNo: number;
  board: string;
  highlight?: boolean;
  lastPost?: boolean;
}

export const PostView = ({
  post,
  handleRef,
  preview,
  replyCount,
  opNo,
  board,
}: PostProps) => {
  const [enlargePostImage, setEnlargePostImage] = useState(false);

  const dispatch = useDispatch();

  const openPostImage = () => {
    setEnlargePostImage(true);
  };

  const closePostImage = () => {
    setEnlargePostImage(false);
  };

  const [enlargeAvatar, setEnlargeAvatar] = useState(false);

  const openAvatar = () => {
    setEnlargeAvatar(true);
  };

  const closeAvatar = () => {
    setEnlargeAvatar(false);
  };

  const { username, subject, id, comment, image, time, avatar } = post;

  const isOriginalPost = opNo === id;

  const handleClick = (e: any) => {
    e.preventDefault();
    dispatch(insertPostLink(id));
  };

  const prefix = preview ? "/thread/" : "";

  const postHref = isOriginalPost
    ? `${prefix}${opNo}`
    : `${prefix}${opNo}#${id}`;

  const formattedTime = handlePostDate(time);

  //I wonder if there is a way to make this cleaner.
  const optionsRef = useRef<HTMLDivElement>(null);
  const [expandOptions, setExpandOptions] = useState(false);
  const closeOptions = () => setExpandOptions(false);
  const openOptions = () => setExpandOptions(true);
  useDetectOutsideClick(optionsRef, closeOptions);

  const [expandDeleteDialog, setExpandDeleteDialog] = useState(false);
  const closeDeleteDialog = () => setExpandDeleteDialog(false);
  const openDeleteDialog = () => setExpandDeleteDialog(true);

  const postUrl = `https://conj.app/boards/${board}/thread/${opNo}#${id}`;

  return (
    <div>
      {image ? (
        <Modal
          isOpen={enlargePostImage}
          onRequestClose={closePostImage}
          title={image.filename}
        >
          <ModalImage src={image.location} />
        </Modal>
      ) : null}
      <Modal isOpen={enlargeAvatar} onRequestClose={closeAvatar}>
        {avatar ? <ModalImage src={avatar} /> : <AnonymousAvatar />}
      </Modal>
      <Modal
        isOpen={expandDeleteDialog}
        onRequestClose={closeDeleteDialog}
        title="Delete Post"
      >
        <DeleteDialog
          board={board}
          threadNo={opNo}
          replyNo={!isOriginalPost ? id : null}
          closeAction={closeDeleteDialog}
        />
      </Modal>
      {isOriginalPost ? (
        <OriginalPost
          id={id}
          handleRef={handleRef}
          openAvatar={openAvatar}
          avatar={avatar}
          username={username}
          postHref={postHref}
          handleClick={handleClick}
          formattedTime={formattedTime}
          image={image}
          openPostImage={openPostImage}
          subject={subject}
          opNo={opNo}
          comment={comment}
          optionsRef={optionsRef}
          expandOptions={expandOptions}
          openOptions={openOptions}
          postUrl={postUrl}
          openDeleteDialog={openDeleteDialog}
          preview={preview}
          replyCount={replyCount}
        />
      ) : (
        <ReplyPost
          id={id}
          handleRef={handleRef}
          openAvatar={openAvatar}
          avatar={avatar}
          username={username}
          postHref={postHref}
          handleClick={handleClick}
          formattedTime={formattedTime}
          image={image}
          openPostImage={openPostImage}
          subject={subject}
          opNo={opNo}
          comment={comment}
          optionsRef={optionsRef}
          expandOptions={expandOptions}
          openOptions={openOptions}
          postUrl={postUrl}
          openDeleteDialog={openDeleteDialog}
          preview={preview}
          replyCount={replyCount}
        />
      )}
    </div>
  );
};

interface SharedPostProps {
  id: number;
  handleRef?: Ref<any>;
  openAvatar: () => void;
  avatar: string | null;
  username: string;
  postHref: string;
  handleClick: (e: any) => void;
  formattedTime: string;
  image: ImageMap | null;
  openPostImage: () => void;
  subject?: string;
  opNo: number;
  comment: string;
  optionsRef: RefObject<HTMLDivElement>;
  expandOptions: boolean;
  openOptions: () => void;
  postUrl: string;
  openDeleteDialog: () => void;
  preview: boolean;
  replyCount: number;
}

const OriginalPost = (props: SharedPostProps) => {
  return (
    <PostRoot key={props.id} ref={props.handleRef}>
      <UserInfo>
        <Avatar onClick={props.openAvatar} avatar={props.avatar} />
        <TextContainer>
          <Text bold size="medium">
            <span>{props.username ?? "Anonymous"}</span>
          </Text>
          <PostLink to={props.postHref} onClick={props.handleClick}>
            #{props.id}
          </PostLink>
        </TextContainer>
        <Text size="medium" color="darkGrey" align="right">
          {props.formattedTime}
        </Text>
      </UserInfo>
      {props.image && props.image.location ? (
        <FullWidth>
          <CenteredImage
            onClick={() => props.openPostImage()}
            src={props.image.location}
          />
        </FullWidth>
      ) : null}
      <OriginalContentRoot>
        {props.subject ? (
          <Text align="left" width="100%" size="x-large" color="black">
            {props.subject}
          </Text>
        ) : null}
        {processPostText(props.opNo, props.comment)}
      </OriginalContentRoot>
      <ActionsContainer>
        {" "}
        <OptionsDiv
          ref={props.optionsRef}
          expand={props.expandOptions}
          onClick={props.openOptions}
        >
          {!props.expandOptions ? <EllipsisButton /> : null}
          <ShareMessageButton
            onClick={() => navigator.clipboard.writeText(props.postUrl)}
          />
          <DeletePostButton onClick={props.openDeleteDialog} />
        </OptionsDiv>
        {props.preview ? (
          <WithText
            component={
              <ThreadLink
                to={(location) => `${location.pathname}/thread/${props.opNo}`}
              >
                <MessageDetail />
              </ThreadLink>
            }
            direction="row"
            text={JSON.stringify(props.replyCount)}
          />
        ) : null}
      </ActionsContainer>
    </PostRoot>
  );
};

const ReplyPost = (props: SharedPostProps) => {
  return (
    <ReplyRoot key={props.id} ref={props.handleRef}>
      <Avatar onClick={props.openAvatar} avatar={props.avatar} />
      <ReplyContainer>
        <ReplyUserInfo>
          <ReplyTextContainer>
            <Text bold size="medium">
              <span>{props.username ?? "Anonymous"}</span>
            </Text>
            <PostLink to={props.postHref} onClick={props.handleClick}>
              #{props.id}
            </PostLink>
          </ReplyTextContainer>

          <Text size="medium" color="darkGrey" align="right">
            {props.formattedTime}
          </Text>
        </ReplyUserInfo>
        {props.image && props.image.location ? (
          //<FullWidth>
          <ReplyImage
            onClick={() => props.openPostImage()}
            src={props.image.location}
          />
        ) : // <CenteredImage
        //   onClick={() => props.openPostImage()}
        //   src={props.image.location}
        // />
        //</FullWidth>
        null}
        <OriginalContentRoot>
          {props.subject ? (
            <Text align="left" width="100%" size="x-large" color="black">
              {props.subject}
            </Text>
          ) : null}
          {processPostText(props.opNo, props.comment)}
        </OriginalContentRoot>
        <ActionsContainer>
          {" "}
          <OptionsDiv
            ref={props.optionsRef}
            expand={props.expandOptions}
            onClick={props.openOptions}
          >
            {!props.expandOptions ? <EllipsisButton /> : null}
            <ShareMessageButton
              onClick={() => navigator.clipboard.writeText(props.postUrl)}
            />
            <DeletePostButton onClick={props.openDeleteDialog} />
          </OptionsDiv>
          {props.preview ? (
            <WithText
              component={
                <ThreadLink
                  to={(location) => `${location.pathname}/thread/${props.opNo}`}
                >
                  <MessageDetail />
                </ThreadLink>
              }
              direction="row"
              text={JSON.stringify(props.replyCount)}
            />
          ) : null}
        </ActionsContainer>
      </ReplyContainer>
    </ReplyRoot>
  );
};

interface WithTextRootProps {
  direction?: string;
}

const WithTextRoot = styled.div<WithTextRootProps>`
  display: flex;
  flex-direction: ${(props) => props.direction ?? "row"};
  color: ${(props) => props.theme.colors.black};

  &:hover {
    cursor: pointer;
    /* color: ${(props) => props.theme.colors.grey}; */
  }
`;

const MessageDetail = styled(BiMessageDetail)`
  color: ${(props) => props.theme.colors.black};
  width: 24px;
  height: 24px;
`;

interface OptionsDivProps {
  expand?: boolean;
}

const OptionsDiv = styled.div<OptionsDivProps>`
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  transition: all 0.3 ease;
  max-width: ${(props) => (props.expand ? "100%" : "24px")};
  overflow: hidden;
  background-color: ${(props) => props.theme.colors.grey};
  border-radius: 9000px;
  gap: 2px;
  padding: 2px;
`;

const EllipsisButton = styled(VscEllipsis)`
  color: ${(props) => props.theme.colors.black};
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-width: 24px;
  &:hover {
    cursor: pointer;
    /* color: ${(props) => props.theme.colors.grey}; */
  }
`;

const ShareMessageButton = styled(BiShareAlt)`
  color: ${(props) => props.theme.colors.black};
  width: 24px;
  height: 24px;
  &:hover {
    cursor: pointer;
    /* color: ${(props) => props.theme.colors.grey}; */
  }
`;

const DeletePostButton = styled(RiDeleteBin2Fill)`
  color: ${(props) => props.theme.colors.black};
  width: 24px;
  height: 24px;
  &:hover {
    cursor: pointer;
    /* color: ${(props) => props.theme.colors.grey}; */
  }
`;

const TextContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  width: 100%;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  width: 100%;
  margin-left: 4px;
  margin-right: 4px;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  margin-right: 10px;
  float: left;

  &:hover {
    cursor: pointer;
  }
`;

const FullWidth = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: row;
  background-color: ${(props) => props.theme.colors.grey};
`;

const CenteredImage = styled(Image)`
  float: none;
  margin: 0 auto;
  /* aspect-ratio: 1/1; */
  max-height: 400px;
  border-radius: 0px;
`;

interface ReplyImageProps {
  src: string;
}

const ReplyImage = styled.div<ReplyImageProps>`
  float: none;
  aspect-ratio: 16/9;
  width: 100%;
  border-radius: 4px;
  background-image: url("${(props) => props.src}");
  background-size: cover;
  background-position: center, center;
  background-repeat: no-repeat;
`;

const ModalImage = styled(Image)`
  max-width: 50vw;
  max-height: 50vh;

  @media all and (min-width: 1024px) and (max-width: 1280px) {
    max-width: 50vw;
  }

  @media all and (min-width: 768px) and (max-width: 1024px) {
  }

  @media all and (min-width: 480px) and (max-width: 768px) {
  }

  @media all and (max-width: 480px) {
    width: 100vw;
    max-width: 100vw;
  }
`;

const IconText = styled.p`
  /* font-size: 1.25rem; */
  padding-bottom: 8px;
  align-self: center;
  margin: 0;
`;

const ContentRoot = styled.div`
  background-color: ${(props) => props.theme.colors.white};
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-left: 4px;
  margin-right: 4px;
  /* gap: 1rem; */
`;

const OriginalContentRoot = styled(ContentRoot)`
  scroll-behavior: smooth;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  gap: 10px;
`;

const PostRoot = styled.div`
  scroll-behavior: smooth;
  display: flex;
  position: relative;
  flex-direction: row;
  justify-content: flex-start;
  flex-flow: wrap;
  /* width: calc(100% - 3rem); */
  width: 100%;
  margin: 0 auto;
  background-color: ${(props) => props.theme.colors.white};
  border-bottom: 2px solid ${(props) => props.theme.colors.grey};
  /* margin: 1.5rem; */
  padding-top: 10px;
  padding-bottom: 10px;
  gap: 10px;
  text-align: left;
`;

const PostLink = styled(Link)`
  color: black;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.black};
  font-family: "Open Sans", sans-serif;
  padding: 0;
  margin: 0;
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  flex-direction: row;
  align-items: center;
  margin-left: 4px;
  margin-right: 4px;
`;

const ThreadLink = styled(Link)`
  color: inherit;
`;

const ReplyRoot = styled.div`
  scroll-behavior: smooth;
  display: flex;
  width: 100%;
  margin: 0 auto !important;
  background-color: ${(props) => props.theme.colors.white};
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 10px;
  padding-right: 10px;
  gap: 10px;
  text-align: left;
  flex-direction: row;
  box-sizing: border-box;
  align-items: flex-start;
  justify-content: flex-start;
`;

const ReplyContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`;

const ReplyUserInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
`;

const ReplyTextContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  gap: 0.5rem;
`;
