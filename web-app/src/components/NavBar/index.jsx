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

  const [error, setError] = useState(null);

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
    setError(null);
    try {
      const res = await upsertThread(post, location.pathname);
      const thread = res.data;
      const newThread = thread.length === 1;
      dispatch(swapThread(thread))
      if(newThread) {
        history.push(`/thread/${res.data[0].id}`);
        history.go()
      }
    } catch (error) {
      setError(error.response.data);
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
          <PostContainer>
            <SubmitPost handleSubmit={handleSubmit}/>
            <ErrorText>{error}</ErrorText>
          </PostContainer>
        </AccountRoot> 
        } 
      <HR/>
    </NavRoot>
  )
}

const PostContainer = styled.div`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media all and (min-width: 1024px) and (max-width: 1280px) {
    min-width: 40%;
    max-width: 40%;
  }
  
  @media all and (min-width: 768px) and (max-width: 1024px) { 
    min-width: 40%;
    max-width: 40%;
  }
  
  @media all and (min-width: 480px) and (max-width: 768px) { 
    min-width: 100%;
    max-width: 100%;
  }
  
  @media all and (max-width: 480px) { 
    min-width: 100%;
    max-width: 100%;
  }
`;

const ErrorText = styled.p`
  color: red;
  margin: 0 auto;
  width: fit-content;
`;

// const CenteredSubmitPost = styled(SubmitPost)`
//   min-width: 100%;
// `;

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
