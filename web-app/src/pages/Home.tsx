import styled from "styled-components";
import * as _ from "lodash";
import { ThreadView } from "../components/Thread";
import { HR } from "../components";
import { useFetchThreadsQuery } from "../api/thread";
import { useThread } from "../hooks/useThread";

export function Home() {
  const { data: threads, isLoading } = useFetchThreadsQuery("");

  const { board } = useThread();

  if (isLoading) {
    return <div>loading???</div>;
  }

  if (!board) {
    return <div>Not even sure how you got here.</div>;
  }

  return (
    <HomeRoot>
      <ThreadsContainer>
        {_.orderBy(threads, (o) => o[o.length - 1].id, ["desc"]).map(
          (thread, index) => (
            <div key={index}>
              <ThreadView board={board} preview={true} thread={thread} />
              <HR />
            </div>
          )
        )}
      </ThreadsContainer>
    </HomeRoot>
  );
}

const HomeRoot = styled.div``;

const ThreadsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;
