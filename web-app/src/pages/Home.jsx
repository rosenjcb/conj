import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import * as _ from "lodash";
import { Thread } from "../components/Thread";
import { HR } from "../components";

export function Home() {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    async function fetchThreads() {
      const res = await axios.get("/threads");
      setThreads(res.data);
    }
    fetchThreads();
  }, []);

  return (
    <HomeRoot>
      <ThreadsContainer>
        {_.orderBy(threads, (o) => o[o.length - 1].id, ["desc"]).map(
          (thread, index) => (
            <div key={index}>
              <Thread preview={true} thread={thread} />
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
