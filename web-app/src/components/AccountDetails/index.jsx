
import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import { me, logout } from '../../api/account';

export const AccountDetails = (props) => {

  useEffect(() => {
    async function fetchUser() {
      const res = await me(); 
      setUser(res.data)
    }
    fetchUser();
  },[])

  const handleLogout = async() => {
    await logout();
    window.location.reload();
  }

  const [user, setUser] = useState({})
  
  const email = user.email ?? null


  return (
      <Root>
          <Info>Welcome Back {email}</Info>
          <TextButton type="button" onClick={handleLogout}>[Logout?]</TextButton>
      </Root>
  );
}

const Info = styled.h1`
  font-size: 2rem;
  word-wrap: break-word;
  margin: 0 auto;
  text-align: center;
`;

const Root = styled.div`
  width: 50%;
  height: 10rem;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  border: 1px solid black;
  gap: 2rem;
`;

const TextButton = styled.button`
  color: blue;
  font-size: 1.3rem;
  border: none;
  background: none;
  padding: 0;
  text-decoration: underline;

  &:hover {
    cursor: pointer;
  }
`;
