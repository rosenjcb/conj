import React from "react";
import styled from "styled-components";
import * as _ from "lodash";
import { SpanText } from "../components";

const reHash = /#[1-9]\d*\b/g;
const reNewLine = /\r?\n/g;

const processLine = (opNo: number, line: string) => {
  if (line === "") return <span key={opNo} />;
  if (line[0] === ">") return <GreenText>{line}</GreenText>;
  const matches = line.match(reHash);
  const links =
    matches && matches.length > 0
      ? matches.map((m) => (
          <PostLink key={m} href={`${opNo}${m}`}>
            {m}
          </PostLink>
        ))
      : [];
  const rest = line
    .split(reHash)
    .filter((t) => t !== "")
    .map((t, i) => <SpanText key={i}>{t}</SpanText>);
  const res = _.zip(links, rest);
  return res;
};

export const processPostText = (opNo: number, text: string) => {
  const textTrim = text.trim();
  const lines = textTrim.split(reNewLine);

  const processedLines = lines.map((line) => processLine(opNo, line));

  return <Root>{processedLines}</Root>;
};

export const PostLink = styled.a`
  color: ${(props) => props.theme.colors.primary};
`;

export const Root = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
`;

export const GreenText = styled(SpanText)`
  color: green;
`;
