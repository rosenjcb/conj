import React from "react";
import styled from "styled-components";
import * as _ from "lodash";

const reHash = /#[1-9]\d*\b/g;
const reNewLine = /\r?\n/g;

const processLine = (opNo, line) => {
  if (line === "") return <br />;
  if (line[0] === ">") return <GreenText>{line}</GreenText>;
  const matches = line.match(reHash);
  const links =
    matches && matches.length > 0
      ? matches.map((m) => <PostLink href={`${opNo}${m}`}>{m}</PostLink>)
      : [];
  const rest = line
    .split(reHash)
    .filter((t) => t !== "")
    .map((t) => <span>{t}</span>);
  const res = _.zip(links, rest);
  return res;
};

export const processPostText = (opNo, text) => {
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

export const GreenText = styled.span`
  color: green;
`;
