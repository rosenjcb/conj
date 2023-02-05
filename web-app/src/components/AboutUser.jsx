import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useMeQuery } from "../api/account";
import { Text, Avatar } from "./index.jsx";

export const AboutUser = () => {
  const { data: me } = useMeQuery();

  useEffect(() => {
    console.log(JSON.stringify(me, null, 2));
  }, []);

  //const user = useFetchUserQuery({username: 'daiizy'})

  return (
    <Root>
      <AvatarModal size={100} avatar={me.avatar} />
      <DetailsContainer>
        {/* <Form>
            <input type="text" placeholder={me.username} />
        </Form> */}
      </DetailsContainer>
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
