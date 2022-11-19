import React, { useEffect } from "react";
import styled from "styled-components";
import { Text } from "../components";
import { Reply } from "../components/Reply";
import { Thread } from "../components/Thread";
import * as _ from "lodash";
import { useFetchThreadsQuery } from "../api/thread";
import toast from "react-hot-toast";
import { useThread } from "../hooks/useThread";

export const BoardPage = () => {
  const { board } = useThread();

  const { data: threads, error, isLoading } = useFetchThreadsQuery(board);

  useEffect(() => {
    if (error) {
      toast.error(error.data);
    }
  }, [error]);

  if (isLoading) {
    return <div />;
  }

  return (
    <BoardRoot>
      <HomeReply />
      <ThreadPreview threads={threads} />
    </BoardRoot>
  );
};

const HomeReply = () => {
  return (
    <HomeReplyRoot>
      <Reply isNewThread />
    </HomeReplyRoot>
  );
};

const ThreadPreview = (props) => {
  const { threads } = props;

  return (
    <ThreadPreviewRoot>
      {threads && threads.length > 0 ? (
        _.orderBy(threads, (o) => o[o.length - 1].id, ["desc"]).map(
          (thread, index) => (
            <Thread board={""} key={index} preview={true} thread={thread} />
          )
        )
      ) : (
        <Text bold size="xx-large" align="center">
          {threads ? "No threads yet. Make one?" : "This board does not exist"}
        </Text>
      )}
    </ThreadPreviewRoot>
  );
};

const ThreadPreviewRoot = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  height: calc(100vh - 96px);
  width: 100%;
  gap: 0.5rem;
  margin: 0 auto;
`;

const HomeReplyRoot = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
  align-items: flex-start;
  margin-top: 10px;
  margin-bottom: 3rem;
  width: 100%;
  gap: 10px;
`;

const BoardRoot = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;

  overflow-y: scroll;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;
