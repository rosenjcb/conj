import styled from 'styled-components';
import Helmet from 'react-helmet';

export function AboutPage() {
  
  return (
    <Root>
      <Helmet>
        <title>About</title>
      </Helmet>
      <DetailsContainer>
        <h1>Pepechan</h1>
        <h2>Vision</h2>
        <Paragraph>
          Pepechan was heavily inspired by a Youtube short titled {<a href="https://www.youtube.com/watch?v=QFj_JU6mzgQ">Rare Pepe market crashes and ruins lives</a>}. 
          The premise that there were Pepes you could collect and trade was so funny that I decided to make a website centered around the entire concept.
          Pepechan is an imageboard with the gimmick that you can only post images of Pepes that you have collected. Each Pepe is disposable and will disappear from your inventory once posted. You may have multiple copies of a unique Pepe.
        </Paragraph>
        <h2>How It Works</h2>
        <Paragraph>
          Everytime you post, a random Pepe will be inserted into your inventory. Creating a new thread requires at least one Pepe. If you run out of Pepes, you won't be able to make new threads. 
          This shouldn't be a problem if you regularly reply to other threads.
          Don't worry. You {<strong>will</strong>} be Anonymous by default.  
        </Paragraph>
        <h2>Trial Run</h2>
        <Paragraph>
          The site as presented is a trial run. You were probably invited directly or by a friend. However, your identity here will likely be {<strong>wiped</strong>} after the trial ends. This is becauase the site is constantly changing
          and starting with a fresh DB will probably be easier than migrating it to the next version.
        </Paragraph>
        <h2>FAQ</h2>
        <FaqList>
          <Faq question={"Am I anonymous?"} answer={"You will always be anonymous (or have the option to insert a name) for each post. Creating a persistent inventory for each user is the reason behind the login requirement. Your username/email is not public info."}/>
          <Faq question={"Are my credentials safe?"} answer={"I salt and hash every password created before inserting into the DB. I take precaution to guard your personal data but be smart and use a new password for this account (I can't guarantee anything)."}/>
        </FaqList>
        <a href="http://localhost:3000/">[Back to Home]</a>
      </DetailsContainer>
    </Root>
  )
}

const Faq = ({question, answer}) => {

  return (
    <FaqRoot>
      <strong>{question}</strong>
      <p>{answer}</p>
    </FaqRoot>
  )
}

const FaqRoot = styled.li`
  display: flex;
  flex-direction: column;
`

const FaqList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`

const Root = styled.div`
  min-height: 100vh;
  min-width: 100wh;
  text-align: center;
`
const DetailsContainer = styled.div`
  width: 50%;
  margin: 0 auto;
` 

const Paragraph = styled.p`
  text-align: left;
`
