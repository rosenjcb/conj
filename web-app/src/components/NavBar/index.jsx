import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SubmitPost } from '../../components/SubmitPost';
import { useLocation, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HR } from '../index';
import { swapThread } from '../../slices/threadSlice';
import { AccountDetails } from '../AccountDetails';
import { upsertThread } from '../../api/thread';
import { Login } from '../Login';
import { me as callMe } from '../../api/account'

export function NavBar() {
  const location = useLocation();
  const history = useHistory(); 
  const dispatch = useDispatch();

  const [me, setMe] = useState("none"); 

  useEffect(async() => {
    try { 
      const res = await callMe();
      setMe(res);
    } catch(e) {
      setMe(null);
    }
  },[])

  const handleSubmit = async(post) => {
    console.log(post);
    const res = await upsertThread(post, location.pathname);
    const thread = res.data;
    const newThread = thread.length === 1;
    dispatch(swapThread(thread))
    if(newThread) {
      history.push(`/thread/${res.data[0].id}`);
      history.go()
    }
  }

  return (
    <NavRoot>
      <Title href="/">/b/ - Random</Title>
      <HR width="90%"/>
      {!me 
        ? 
          <Login/>
        : 
        <AccountRoot>
          <HR width="50%"/>
          <AccountDetails/> 
          <CenteredSubmitPost handleSubmit={handleSubmit}/>
        </AccountRoot> 
        } 
      <HR/>
    </NavRoot>
  )
}

const CenteredSubmitPost = styled(SubmitPost)`
  margin: 0 auto;
  width: fit-content;
`;

const NavRoot = styled.div`
  background-color: #eef2ff; 
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

const AccountRoot = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 10px;
`;

const Title = styled.a`
  font-family: ${props => props.theme.title.fontFamily};
  font-size: ${props => props.theme.title.fontSize};
  font-weight: ${props => props.theme.title.fontWeight};
  letter-spacing: ${props => props.theme.title.letterSpacing};
  text-align: center;
  color: ${props => props.theme.title.color};
  text-decoration: none;

  &:hover {
    cursor: pointer;  
  }
`;
