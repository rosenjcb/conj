import React from 'react';
import styled from 'styled-components';

export const processPostText = (opNo, text) => {
  if(text === null || text === undefined || text === "") return text;

  const textTrimmed = text.trim();

  const lines = textTrimmed.split(/\r?\n/);

  let nodes = [];

  for(var i = 0; i < lines.length; i++){ 
    const line = lines[i];
    if(line === '') { 
      nodes.push(<br key={i}/>); 
      continue;
    }

    if(line.match(/^[#]{1}[0-9]*$/)) {
      if(i !== 0) nodes.push(<br key={i}/>);
      nodes.push(<PostLink href={discoverHashLink(opNo, line)}>{line}</PostLink>)
      continue;
    }

    if(line.match("^[>]")) {
      if(i !== 0) nodes.push(<br key={i}/>);
      nodes.push(<GreenText>{line}</GreenText>);
      continue;
    }

    if(i !== 0) nodes.push(<br key={i}/>);
    nodes.push(line);
  }

  return <div style={{width: '100%'}}>{nodes}</div>;
}

const discoverHashLink = (opNo, reply) => {
  const hashNumber = reply.substr(1);
  return `${opNo}#${hashNumber}`;
}

const GreenText = styled.span`
  color: green;
`;

const PostLink = styled.a`
  color: ${props => props.theme.colors.white};
`;
