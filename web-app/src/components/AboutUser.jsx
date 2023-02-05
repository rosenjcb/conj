import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useMeQuery } from "../api/account";
import { Text, Avatar } from "./index.jsx";

export const AboutUser = () => {
  const { data: me } = useMeQuery();

  return (
    <Root>
      <AvatarModal size={100} avatar={me.avatar} />
      <DetailsContainer />
    </Root>
  );
};

const Root = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 25px;
  gap: 20px;
  margin: 0 auto;
`;

const AvatarModal = styled(Avatar)`
  align-self: flex-start;
  margin-top: 1.5rem;
  background-size: cover;
`;

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 25px;
  gap: 20px;
  margin: 0 auto;
`;
