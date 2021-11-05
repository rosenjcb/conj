import React, { useState, useEffect } from 'react';
import { Thread } from '../../components/Thread';
import { SubmitPost } from '../../components/SubmitPost';
import { useParams } from 'react-router'
import axios from 'axios'

export function ThreadPage(props) {

  const [thread, setThread] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    axios.get(`/threads/${id}`)
        .then((resp) => {
            // console.log(resp);
            setThread(resp.data);
        });
  },[]);

  const handleSubmit = (post) => {
    axios.put(`/threads/${id}`, post);
  }

  return(
    <div>
      <SubmitPost handleSubmit={handleSubmit}/>
      <Thread thread={thread}/>
    </div>
  )
}
