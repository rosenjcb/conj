import React, { useState } from "react";
import styled from "styled-components";
import { useMeQuery } from "../api/account";
import { Text, Avatar } from "./index.jsx";

export const AboutUser = () => {
  const { data: me } = useMeQuery();

  //const user = useFetchUserQuery({username: 'daiizy'})

  return (
    <Root>
      <AvatarModal size={100} avatar={me.avatar} />
      <DetailsContainer>
        <Text>{me.username}</Text>
        <Text>test</Text>
      </DetailsContainer>
    </Root>
  );
};

const Root = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0 auto;
  padding: 1rem;
  align-self: center;
  background-color: white;
  border-radius: 4px;
`;

const AvatarModal = styled(Avatar)`
  align-self: flex-start;
  margin-top: 1.5rem;
  background-size: cover;
`;

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  align-self: flex-start;
  width: 70%;
  row-gap: 0.5rem;
  padding-left: 1rem;
`;
