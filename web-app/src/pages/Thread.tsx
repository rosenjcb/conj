import { useEffect, useRef } from "react";
import styled from "styled-components";
import { ThreadView } from "../components/Thread";
import { useThread } from "../hooks/useThread";
import { useFetchThreadQuery } from "../api/thread";

export function ThreadPage() {
  // const {current, localReplyCount} = useSelector(state => state.thread);

  // const dispatch = useDispatch();

  const { board, threadNo, replyNo } = useThread();

  const threadRef = useRef<HTMLElement[]>([]);

  const { data: current } = useFetchThreadQuery({ board, threadNo });

  //This stuff is broken and needs to be fixed.
  const replyIndex =
    replyNo && current ? current.findIndex((p: any) => p.id === replyNo) : null;

  const lastPostRef = threadRef.current[(current?.length ?? 1) - 1];

  //when post link is clicked
  useEffect(() => {
    if (replyIndex && threadRef.current[replyIndex]) {
      threadRef.current[replyIndex].scrollIntoView();
    }
  }, [replyIndex]);

  //when thread is appended/changes (e.g. when a user creates a new post)
  useEffect(() => {
    // console.log(`thread has been updated ${JSON.stringify(result, null, 2)}`)
    // console.log(`This is your threadRef: ${JSON.stringify(threadRef, null, 2)}`);
    if (lastPostRef !== undefined && lastPostRef !== null) {
      // console.log(`This is your lastPostRef: ${JSON.stringify(lastPostRef, null, 2)}`);
      lastPostRef.scrollIntoView({ behavior: "smooth" });
    }
  }, [lastPostRef]);

  if (!(current && current.length > 0)) {
    return <div>Loading???</div>;
  }

  if (board === null) {
    return <div>Can't find the board</div>;
  }

  return (
    <Root>
      <ThreadView
        replyIndex={replyIndex}
        threadRef={threadRef}
        preview={false}
        thread={current}
        board={board}
      />
    </Root>
  );
}

const Root = styled.div`
  width: 100%;
  margin: 0 auto;
  /* overflow-y: scroll; */

  &::-webkit-scrollbar {
    display: none;
  }
`;
