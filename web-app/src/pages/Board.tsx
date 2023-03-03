import styled from "styled-components";
import { Text } from "../components";
import { ThreadView } from "../components/Thread";
import * as _ from "lodash";
import { useFetchThreadsQuery } from "../api/thread";
import toast from "react-hot-toast";
import { useThread } from "../hooks/useThread";
import { Thread } from "../types";

export const BoardPage = () => {
  const { board } = useThread();

  const {
    data: threads,
    error,
    isError,
    isLoading,
  } = useFetchThreadsQuery(board ?? "");

  if (!board) {
    return <div />;
  }

  if (error && "status" in error) {
    toast.error(error.data as any);
  }

  if (isLoading || !threads) {
    return <div />;
  }

  return (
    <BoardRoot>
      <ThreadPreview threads={threads} board={board} />
    </BoardRoot>
  );
};

interface ThreadPreviewProps {
  threads: Thread[];
  board: string;
}

const ThreadPreview = ({ threads, board }: ThreadPreviewProps) => {
  return (
    <ThreadPreviewRoot>
      {threads && threads.length > 0 ? (
        _.orderBy(threads, (o) => o[o.length - 1].id, ["desc"]).map(
          (thread, index) => (
            <ThreadView
              board={board}
              key={index}
              preview={true}
              thread={thread}
            />
          )
        )
      ) : (
        <TextWrapper>
          <Text bold size="xx-large" align="center">
            {threads
              ? "No threads yet. Make one?"
              : "This board does not exist"}
          </Text>
        </TextWrapper>
      )}
    </ThreadPreviewRoot>
  );
};

const TextWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  height: 100%;
`;

const ThreadPreviewRoot = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
  height: 100%;
`;

const BoardRoot = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
  /* overflow-y: scroll; */
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;
