import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router';
import { Thread } from '../../components/Thread';
import { SubmitPost } from '../../components/SubmitPost';
import { useParams } from 'react-router'
import axios from 'axios'
import { Root } from './styles';

export function ThreadPage(props) {

  const [thread, setThread] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    axios.get(`/threads/${id}`)
        .then((resp) => {
            if(resp.data == "") {
              window.location = "/";
              // return (<Redirect to="/thread/1"/>);
            }
            setThread(resp.data);
        });
  },[]);

  const handleSubmit = async (post) => {
    const res = await axios.put(`/threads/${id}`, post);
    setThread(res.data);
  }

  return(
    <Root>
      <Thread thread={thread}/>
    </Root>
  )
}
