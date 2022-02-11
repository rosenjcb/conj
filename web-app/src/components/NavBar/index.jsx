import React from 'react';
import styled from 'styled-components';
import { SubmitPost } from '../../components/SubmitPost';
import { useLocation, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HR } from '../index';
import { swapThread } from '../../slices/threadSlice';
import { AccountDetails } from '../AccountDetails';
import { upsertThread } from '../../api/thread';

export function NavBar() {
  const location = useLocation();
  const history = useHistory(); 
  const dispatch = useDispatch();

  const handleSubmit = async(post) => {
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
      <AccountDetails/>
      <HR width="50%"/>
      <CenteredSubmitPost handleSubmit={handleSubmit}/>
      <HR/>
    </NavRoot>
  )
}

const CenteredSubmitPost = styled(SubmitPost)`
  margin: 0 auto;
`;

const NavRoot = styled.div`
  background-color: #eef2ff; 
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const Title = styled.a`
  font-family: ${props => props.theme.title.fontFamily};
  font-size: ${props => props.theme.title.fontSize};
  font-weight: ${props => props.theme.title.fontWeight};
  letter-spacing: ${props => props.theme.title.letterSpacing};
  text-align: center;
  color: ${props => props.theme.title.color};
  text-decoration: none;
`;
