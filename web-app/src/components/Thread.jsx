import React from "react";
import { Post } from "./Post";
import styled from "styled-components";

export function Thread(props) {
  const { preview, thread, threadRef, replyIndex, board } = props;

  const op = thread[0];

  if (preview) {
    return (
      <Root>
        <Post
          replyCount={thread.length - 1}
          preview={true}
          post={op}
          opNo={op.id}
          key={op.id}
          board={board}
        />
      </Root>
    );
  }

  const showHighlight = (index) =>
    replyIndex === index && index < thread.length - 1;

  return (
    <Root>
      {thread && thread.length > 0 && threadRef && threadRef.current
        ? thread.map((post, index) => (
            <Post
              replyCount={thread.length - 1}
              preview={false}
              highlight={showHighlight(index)}
              opNo={op.id}
              lastPost={index === thread.length - 1}
              handleRef={(el) => (threadRef.current[index] = el)}
              key={post.id}
              post={post}
              board={board}
            />
          ))
        : null}
    </Root>
  );
}

const Root = styled.div`
  /* margin: 0 auto; */
  display: flex;
  background-color: ${(props) => props.theme.colors.white};
  justify-content: flex-start;
  /* gap: 1rem; */
  flex-direction: column;

  @media all and (min-width: 1024px) {
    border-radius: 0px;
  }

  @media all and (min-width: 768px) and (max-width: 1024px) {
    border-radius: 0px;
  }

  @media all and (min-width: 480px) and (max-width: 768px) {
    border-radius: 0px;
  }

  @media all and (max-width: 480px) {
    border-radius: 0px;
  }
`;
