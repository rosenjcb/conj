
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import styled from 'styled-components';

export const AccountDetails = (props) => {

  useEffect(async () => {
    const res = await axios.get("/accounts/4")
    setUser(res.data)
  },[])

  const [user, setUser] = useState({})
  
  const email = user.email ?? null


  return (
      <Root>
          <Info>Welcome Back {email}</Info>
      </Root>
  );
}

const Info = styled.h1`
  width: 80%;
  margin: 0 auto;
  text-align: center;
`

const Root = styled.div`
  width: 50%;
  height: 10rem;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  border: 1px solid black;
`
