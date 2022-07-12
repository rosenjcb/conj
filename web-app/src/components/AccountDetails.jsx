
import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import { me, logout } from '../api/account';

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
  word-wrap: break-word;
  margin: 0 auto;
  text-align: center;


  @media all and (min-width: 1024px) and (max-width: 1280px) {
    font-size: 2rem; 
  }
  
  @media all and (min-width: 768px) and (max-width: 1024px) { 
    font-size: 2rem; 
  }
  
  @media all and (min-width: 480px) and (max-width: 768px) { 
    font-size: 1rem; 
  }
  
  @media all and (max-width: 480px) { 
    font-size: 1rem; 
  }
`;

const Root = styled.div`
  width: 50%;
  height: 10rem;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  margin-top: 10px;
  margin-bottom: 10px;
  padding-left: 5px;
  padding-right: 5px;
  border: 1px solid black;
  gap: 2rem;
  overflow: hidden;
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
