import React from "react";
import styled from "styled-components";
import Helmet from "react-helmet";
import { Text, Header } from "../components";
import { Login } from "../components/Login";
import { Thread } from "../components/Thread";
import { detectMobile } from "../util/window";

const exampleThread = [
  {
    id: 1,
    name: "cl0jure",
    comment: "Here's my first post, everyone!",
    subject: "Hello World",
    image: { location: "dinosaur.jpg" },
  },
];

// const introText =
// `
//   Social media is experience a slump blah blah blah.
// `;

const threadText = `
  Come join the discussion today on one of our many boards. Create a new thread or reply to one of the many other posts. 
`;

export function AboutPage() {
  return (
    <Root>
      <Helmet>
        <title>About</title>
      </Helmet>
      <Header bold size="xx-large">
        Welcome to Conj
      </Header>
      <Header bold size="large">
        A Social Media Reboot
      </Header>
      <DetailsContainer>
        <Info
          reverse
          text={threadText}
          component={<Thread preview={true} thread={exampleThread} />}
        />
        <Info
          text="epsum lorem lololo"
          component={<Thread preview={true} thread={exampleThread} />}
        />
      </DetailsContainer>
      <Login />
    </Root>
  );
}

const Info = ({ text, component, reverse }) => {
  const isMobile = detectMobile();

  const content =
    reverse && !isMobile
      ? [
          <Item>
            <Text bold size="large" align="left">
              {text}
            </Text>
          </Item>,
          <Item>{component}</Item>,
        ]
      : [
          <Item>{component}</Item>,
          <Item>
            <Text bold align="right" size="large">
              {text}
            </Text>
          </Item>,
        ];

  return <InfoRoot>{content}</InfoRoot>;
};

const InfoRoot = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  min-height: 30vh;
  gap: 5rem;
  margin: 0 auto;

  @media all and (min-width: 1024px) {
    flex-direction: row;
  }

  @media all and (min-width: 768px) and (max-width: 1024px) {
    flex-direction: column;
  }

  @media all and (min-width: 480px) and (max-width: 768px) {
    flex-direction: column;
  }

  @media all and (max-width: 480px) {
    flex-direction: column;
  }
`;

const Item = styled.div`
  min-width: 45%;
  display: flex;
  height: fit-content;
  margin: 0 auto;
  justify-content: flex-start;
  align-self: center;
`;

const Root = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  margin-left: 1rem;
  margin-right: 1rem;
  width: 100%;
  text-align: center;
  overflow-y: scroll;
  gap: 3rem;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const DetailsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  gap: 3rem;
  margin: 0 auto;
  margin-top: 1rem;
  margin-bottom: 1rem;
`;
