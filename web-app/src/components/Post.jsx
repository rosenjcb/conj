import React, { useState, useRef } from "react";
import styled from "styled-components";
import { Text, Avatar, Modal } from "./index";
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

const WithText = ({ direction, component, text }) => {
  return (
    <WithTextRoot direction={direction}>
      {component}
      <IconText>{text}</IconText>
    </WithTextRoot>
  );
};

const handlePostDate = (time) => {
  const now = new Date();
  const then = new Date(time);

  const hours = Math.abs(now - then) / 36e5;

  if (hours < 24) {
    if (hours < 1) {
      const minutes = hours * 60;
      if (minutes < 1) {
        const seconds = Math.round(minutes * 60);
        if (seconds < 1) {
          return "Just now";
        } else {
          return `${seconds} ${seconds === 1 ? "second" : "seconds"} ago`;
        }
      }
      return `${Math.round(minutes)} ${
        minutes === 1 ? "minute" : "minutes"
      } ago`;
    }
    return `${Math.round(hours)} ${hours === 1 ? "hr" : "hrs"} ago`;
  } else {
    return then.toLocaleDateString();
  }
};

export const Post = (props) => {
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

  const { post, handleRef, preview, replyCount, opNo, board } = props;

  const { username, subject, id, comment, image, time, avatar } = post;

  const isOriginalPost = opNo === id;

  const handleClick = (e) => {
    e.preventDefault();
    dispatch(insertPostLink(id));
  };

  const prefix = preview ? "/thread/" : "";

  const postHref = isOriginalPost
    ? `${prefix}${opNo}`
    : `${prefix}${opNo}#${id}`;

  const formattedTime = handlePostDate(time);

  //I wonder if there is a way to make this cleaner.
  const optionsRef = useRef(null);
  const [expandOptions, setExpandOptions] = useState(false);
  const closeOptions = () => setExpandOptions(false);
  const openOptions = () => setExpandOptions(!expandOptions);
  useDetectOutsideClick(optionsRef, closeOptions);

  const [deleteThread] = useDeleteThreadMutation();

  const params = {
    ban: false,
    replyNo: !isOriginalPost ? id : null,
  };

  const deleteReq = {
    board: board,
    threadNo: opNo,
    params: _.omitBy(params, _.isNil),
    replyNo: !isOriginalPost ? id : null,
    ban: false,
  };

  const deletePost = async () => {
    try {
      await deleteThread(deleteReq).unwrap();
      toast.success(`Deleted Post #${id}`);
    } catch (e) {
      toast.error(e.data);
    }
  };

  const postUrl = `https://conj.app/boards/${board}/thread/${opNo}#${id}`;

  return (
    <div>
      <Modal isOpen={enlargePostImage} onRequestClose={closePostImage}>
        {image ? <ModalImage src={image.location} /> : null}
      </Modal>
      <Modal isOpen={enlargeAvatar} onRequestClose={closeAvatar}>
        <ModalImage src={avatar} />
      </Modal>
      <PostRoot key={id} ref={handleRef}>
        <UserInfo>
          <Avatar onClick={openAvatar} avatar={avatar} />
          <TextContainer>
            <Text bold size="medium">
              {username ?? "Anonymous"}
            </Text>
            <PostLink to={postHref} onClick={handleClick}>
              #{id}
            </PostLink>
          </TextContainer>
          <Text size="medium" color="darkGrey" align="right">
            {formattedTime}
          </Text>
        </UserInfo>
        {image && image.location ? (
          <FullWidth>
            <CenteredImage
              onClick={() => openPostImage()}
              src={image.location}
            />
          </FullWidth>
        ) : null}
        <OriginalContentRoot>
          {subject ? (
            <Text align="left" width="100%" size="x-large" color="black">
              {subject}
            </Text>
          ) : null}
          {processPostText(opNo, comment)}
        </OriginalContentRoot>
        <ActionsContainer>
          <OptionsDiv
            ref={optionsRef}
            expand={expandOptions}
            onClick={openOptions}
          >
            {!expandOptions ? <EllipsisButton /> : null}
            <ShareMessageButton
              onClick={() => navigator.clipboard.writeText(postUrl)}
            />
            <DeletePostButton onClick={deletePost} />
          </OptionsDiv>
          {preview ? (
            <WithText
              component={
                <ThreadLink
                  to={(location) => `${location.pathname}/thread/${opNo}`}
                >
                  <MessageDetail />
                </ThreadLink>
              }
              direction="row"
              text={replyCount}
            />
          ) : null}
        </ActionsContainer>
      </PostRoot>
    </div>
  );
};

const WithTextRoot = styled.div`
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

const OptionsDiv = styled.div`
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
  gap: 0.5rem;
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

// const FalseBorder = styled.div`
//   width: 1px;
//   background-color: ${(props) =>
//     chroma(props.theme.colors.grey).brighten(0.5).hex()};
// `;

// const InfoContent = styled.div`
//   height: 80%;
//   display: flex;
//   justify-content: space-between;
//   align-items: flex-start;
//   flex-direction: row;
//   width: 100%;
// `;
