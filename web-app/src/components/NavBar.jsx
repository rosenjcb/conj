import React, { useState } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { useLogoutMutation } from "../api/account";
import { useFetchBoardsQuery } from "../api/board";
import chroma from "chroma-js";
import { FiMenu } from "react-icons/fi";
import { RiDiscussFill } from "react-icons/ri";
import { BsFillBarChartFill } from "react-icons/bs";
import { Text, Modal } from "./index";
import { useThread } from "../hooks/useThread";
import { detectMobile } from "../util/window";
import { Header } from "./index";
import { GoGear } from "react-icons/go";
import { useComponentVisible } from "../hooks/useComponentVisible";
import { AccountSettings, CompleteOnboarding } from "./AccountSettings";
import { Login } from "./Login";
import { useMeQuery } from "../api/account";
import toast from "react-hot-toast";

export const WithNavBar = ({ component }) => {
  const [logout] = useLogoutMutation();

  const { data: me, isLoading } = useMeQuery();

  const { is_onboarding } = me || {};

  const { data: boards } = useFetchBoardsQuery();

  const history = useHistory();

  const isMobile = detectMobile();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => {
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const redirectHome = () => {
    history.push("/");
  };

  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);

  const toggleVisible = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (e) {
      if (e.data) toast.error(e.data);
    } finally {
      setIsComponentVisible(false);
    }
  };
  const [accountIsOpen, setAccountIsOpen] = useState(false);

  const closeAccount = () => setAccountIsOpen(false);

  const openAccount = () => setAccountIsOpen(true);

  const [loginOpen, setLoginOpen] = useState(false);

  const closeLogin = () => setLoginOpen(false);

  const openLogin = () => setLoginOpen(true);

  if (isLoading) {
    return <div />;
  }

  return (
    <BoardRoot>
      <Modal isOpen={is_onboarding} title="Let's Finish Account Setup" noExit>
        <CompleteOnboarding />
      </Modal>
      <Modal
        isOpen={accountIsOpen}
        onRequestClose={closeAccount}
        title="Account Info"
      >
        <AccountSettings onFinish={closeAccount} />
      </Modal>
      <Modal isOpen={loginOpen} onRequestClose={closeLogin} title="Login">
        <Login completeAction={closeLogin} />
      </Modal>
      <HomeNavBar>
        <Header bold onClick={redirectHome}>
          Conj
        </Header>
        <NavItemsContainer>
          {isMobile ? (
            <IconContainer>
              <HamburgerMenu onClick={openDrawer} />
            </IconContainer>
          ) : null}
          <IconContainer>
            <SettingsIcon onClick={toggleVisible} />
            <SettingsContent visible={isComponentVisible} ref={ref}>
              {me === null ? (
                <Link onClick={openLogin}>
                  <SettingText align="center">Login</SettingText>
                </Link>
              ) : null}
              {me !== null ? (
                <Link onClick={handleLogout}>
                  <SettingText align="center">Logout</SettingText>
                </Link>
              ) : null}
              {me !== null ? (
                <Link onClick={openAccount}>
                  <SettingText align="center">Account</SettingText>
                </Link>
              ) : null}
            </SettingsContent>
          </IconContainer>
        </NavItemsContainer>
      </HomeNavBar>
      <Page>
        {!isMobile ? (
          <BoardDrawer boards={boards} />
        ) : (
          <Modal
            isOpen={drawerOpen}
            onRequestClose={closeDrawer}
            title="Most Popular Boards"
          >
            <BoardDrawer fill={true} boards={boards} />
          </Modal>
        )}
        <FixedWidth>{component}</FixedWidth>
      </Page>
    </BoardRoot>
  );
};

const FixedWidth = styled.div`
  margin: 0 auto;
  border-left: 2px solid ${(props) => props.theme.colors.grey};
  border-right: 2px solid ${(props) => props.theme.colors.grey};

  @media all and (min-width: 1024px) {
    width: 900px;
  }

  @media all and (min-width: 768px) and (max-width: 1024px) {
    width: 100%;
  }

  @media all and (min-width: 480px) and (max-width: 768px) {
    width: 100%;
  }

  @media all and (max-width: 480px) {
    width: 100%;
  }
`;

const BoardDrawer = (props) => {
  const { boards, fill } = props;

  const history = useHistory();

  const { board } = useThread();

  const handleClick = (board) => {
    console.log(board);
    history.push(`/boards/${board}`);
  };

  return (
    <BoardDrawerRoot fill={fill}>
      <BoardList>
        <BoardRow>
          <BoardIcon />
          <BarChartIcon />
        </BoardRow>
        {boards != null ? (
          boards.map((b) => (
            <HighlightBoardRow
              onClick={() => handleClick(b)}
              selected={b === board}
              key={b}
            >
              <BoardItem>/{b}/</BoardItem>
              <Text size={"medium"} align="right" color={"black"} bold>
                10+
              </Text>
            </HighlightBoardRow>
          ))
        ) : (
          <Text bold size={"medium"}>
            No Boards Found
          </Text>
        )}
      </BoardList>
    </BoardDrawerRoot>
  );
};

const NavItemsContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 2px;
  flex-direction: row;
`;

const Page = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  margin: 0 auto;
  height: 100%;

  @media all and (min-width: 1024px) {
    width: 100%;
  }

  @media all and (min-width: 768px) and (max-width: 1024px) {
    width: 100%;
  }

  @media all and (min-width: 480px) and (max-width: 768px) {
    width: 100%;
  }

  @media all and (max-width: 480px) {
    width: 100%;
  }
`;

const BoardList = styled.ul`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin: 0;
  padding-left: 10px;
  padding-right: 10px;
`;

const BoardRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  flex-direction: row;
  margin-left: 1rem;
  margin-right: 1rem;
  border-radius: 4px;
`;

const HighlightBoardRow = styled(BoardRow)`
  background-color: ${(props) =>
    props.selected
      ? chroma(props.theme.colors.primary).brighten(2.5).hex()
      : "inherit"};
  &:hover {
    background-color: ${(props) =>
      chroma(props.theme.colors.primary).brighten(2.5).hex()};
    cursor: pointer;
  }
  min-width: 250px;
`;

const BoardItem = styled(Text).attrs((props) => ({ bold: true }))`
  color: ${(props) => props.theme.colors.black};
  border-radius: 12px;
  padding: 8px;
  user-select: none;
`;

const BoardDrawerRoot = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  background-color: ${(props) =>
    props.fill ? props.theme.colors.white : "inherit"};
  gap: 2rem;
  height: fit-content;
  /* border-radius: 8px; */
  width: 300px;
  border-right: 2px solid ${(props) => props.theme.colors.grey};
  height: 100%;

  @media all and (max-width: 480px) {
    width: 100%;
    height: 100%;
    padding: 0;
    border-radius: 0px;
  }
`;

const BoardRoot = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  width: 100%;
  max-height: 100vh;
  height: 100%;
`;

const HomeNavBar = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  z-index: 1;
  justify-content: space-between;
  gap: 10px;
  flex-direction: row;
  background-color: ${(props) => props.theme.colors.white};
  align-items: center;
  border-bottom: 2px solid ${(props) => props.theme.colors.grey};
  width: calc(100% - 8px);
  padding: 4px;
`;

const HamburgerMenu = styled(FiMenu)`
  color: ${(props) => props.theme.colors.black};
  width: 36px;
  height: 36px;
`;

const BoardIcon = styled(RiDiscussFill)`
  color: ${(props) => props.theme.colors.primary};
  width: 48px;
  height: 48px;
`;

const BarChartIcon = styled(BsFillBarChartFill)`
  color: ${(props) => props.theme.colors.primary};
  width: 48px;
  height: 48px;
`;

// const ToolTip = styled.span`
//   visibility: ${props => props.visibility ? "visible" : "hidden"};
//   width: 100%;
//   background-color: ${props => props.theme.colors.grey};
//   color: white;
//   font-weight: 650;
//   text-align: center;
//   border-radius: 6px;
//   padding: 10px;
//   position: relative;
//   z-index: 1;
//   bottom: 60px;
//   left: 15%;
//   margin-left: -100px;

//   &:after {
//     content: "";
//     position: absolute;
//     top: 100%;
//     left: 50%;
//     margin-left: -5px;
//     border-width: 5px;
//     border-style: solid;
//     border-color: ${props => props.theme.colors.grey} transparent transparent transparent;
//   };
// `;

const SettingsContent = styled.div`
  display: ${(props) => (props.visible ? "block" : "none")};
  position: absolute;
  width: 160px;
  background-color: ${(props) => props.theme.colors.white};
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  transform: translate(55%, 28%) translate(-100%, 0px);
  border-radius: 8px;
  padding: 12px 16px;
  align-items: center;
`;

const SettingsIcon = styled(GoGear)`
  cursor: pointer;
  width: 36px;
  height: 36px;
  align-self: center;
  display: inline-block;
  position: relative;
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 9000px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.colors.grey};
`;

const Link = styled.div`
  display: flex;
  align-self: center;
  cursor: pointer;
  width: 100%;
`;

const SettingText = styled(Text)`
  padding: 12px 16px;
  border-radius: 8px;

  &:hover {
    background-color: ${(props) =>
      chroma(props.theme.colors.grey).brighten(0.6).hex()};
  }
`;
