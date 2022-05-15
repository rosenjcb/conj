import React from 'react';
import styled from 'styled-components';

export const processPostText = (opNo, text) => {
  if(text === null || text === undefined) return text;

  const textTrimmed = text.trim();

  const lines = textTrimmed.split(/\r?\n/);

  let nodes = [];

  for(var i = 0; i < lines.length; i++){ 
    const line = lines[i];
    if(line === '') { 
      nodes.push(<br/>); 
      continue;
    }

    if(line.match(/^[>]{2}[0-9]*$/)) {
      if(i !== 0) nodes.push(<br/>);
      nodes.push(<a href={discoverHashLink(opNo, line)}>{line}</a>)
      continue;
    }

    if(line.match("^[>]")) {
      if(i !== 0) nodes.push(<br/>);
      nodes.push(<GreenText>{line}</GreenText>);
      continue;
    }

    if(i !== 0) nodes.push(<br/>)
    nodes.push(<span key={i}>{line}</span>)
  }

  return <span>{nodes}</span>
}

const discoverHashLink = (opNo, reply) => {
  const hashNumber = reply.substr(2);
  return `/thread/${opNo}#${hashNumber}`;
}

const GreenText = styled.span`
  color: green;
`;
