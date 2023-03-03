import { useState } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { useLogoutMutation } from "../api/account";
import { useFetchBoardsQuery } from "../api/board";
import chroma from "chroma-js";
import { FiMenu } from "react-icons/fi";
import { Text, Modal } from "./index";
import { useThread } from "../hooks/useThread";
import { detectMobile } from "../util/window";
import { Header } from "./index";
import { GoGear } from "react-icons/go";
import { useComponentVisible } from "../hooks/useComponentVisible";
import { AccountSettings } from "./AccountSettings";
import { Login } from "./Login";
import { useMeQuery } from "../api/account";
import toast from "react-hot-toast";
import { Reply } from "./Reply";

interface WithNavBarProps {
  component: JSX.Element;
}

export const WithNavBar = ({ component }: WithNavBarProps) => {
  const [logout] = useLogoutMutation();

  const { data: me, isLoading } = useMeQuery();

  const { board, threadNo } = useThread();

  const isNewThread = threadNo === null ? true : false;

  // const { is_onboarding } = me || {};

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
    useComponentVisible<HTMLDivElement>(false);

  const toggleVisible = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (e: any) {
      if (e && "status" in e) toast.error(e.data);
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
              {me !== null ? (
                <Link onClick={openAccount}>
                  <SettingText align="center">Account</SettingText>
                </Link>
              ) : null}
              {me === null ? (
                <Link onClick={openLogin}>
                  <SettingText align="center">Login</SettingText>
                </Link>
              ) : (
                <Link onClick={handleLogout}>
                  <SettingText align="center">Logout</SettingText>
                </Link>
              )}
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
            <BoardDrawer isMobile={isMobile} fill={true} boards={boards} />
          </Modal>
        )}
        <PageWrapper>
          <FixedWidth>
            {!isMobile && board ? <Reply isNewThread={isNewThread} /> : null}
            {component}
          </FixedWidth>
          {isMobile && board ? <StyledReply isNewThread={isNewThread} /> : null}
        </PageWrapper>
      </Page>
    </BoardRoot>
  );
};

const PageWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
`;

const StyledReply = styled(Reply)`
  position: fixed;
  bottom: 0;
`;

interface FixedWidthProps {
  mobile?: boolean;
}

const FixedWidth = styled.div<FixedWidthProps>`
  margin: 0 auto;
  overflow-y: hidden;
  height: calc(
    100vh - 40px - 8px - 2px - ${(props) => (props.mobile ? "54px" : "0px")}
  ); //full height - fixed navbar height - fixed navbar padding - border - fixed reply height)
  overflow-y: scroll;
  border-left: ${(props) => (!props.mobile ? "2" : "0")}px solid
    ${(props) => props.theme.colors.grey};
  border-right: ${(props) => (!props.mobile ? "2" : "0")}px solid
    ${(props) => props.theme.colors.grey};

  ::-webkit-scrollbar {
    display: none;
  }

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

interface BoardDrawerProps {
  boards?: string[];
  fill?: boolean;
  isMobile?: boolean;
}

const BoardDrawer = ({ boards, fill, isMobile }: BoardDrawerProps) => {
  const history = useHistory();

  const { board } = useThread();

  const handleClick = (board: string) => {
    history.push(`/boards/${board}`);
  };

  return (
    <BoardDrawerRoot fill={fill}>
      <BoardList>
        <BoardRow>
          {!isMobile ? (
            <Text size={"large"} align="center" bold>
              Most Popular Boards
            </Text>
          ) : null}
        </BoardRow>
        {boards !== undefined ? (
          boards.map((b) => (
            <HighlightBoardRow
              onClick={() => handleClick(b)}
              selected={b === board}
              key={b}
            >
              <BoardItem align={isMobile ? "center" : "inherit"}>
                /{b}/
              </BoardItem>
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
  padding-top: 48px;
  margin-top: -48px;
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

interface HighlightBoardRowProps {
  selected: boolean;
}

const HighlightBoardRow = styled(BoardRow)<HighlightBoardRowProps>`
  background-color: ${(props) =>
    props.selected ? props.theme.colors.white : "inherit"};
  &:hover {
    background-color: ${(props) => props.theme.colors.white};
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

interface BoardDrawerRootProps {
  fill?: boolean;
}

const BoardDrawerRoot = styled.div<BoardDrawerRootProps>`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  background-color: ${(props) =>
    props.fill ? props.theme.colors.grey : "inherit"};
  gap: 2rem;
  height: fit-content;
  /* border-radius: 8px; */
  min-width: 300px;
  border-right: 2px solid ${(props) => props.theme.colors.grey};
  background-color: ${(props) => props.theme.colors.grey};
  min-height: 100%;
  height: auto;

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
  position: fixed;
  z-index: 1;
  top: 0;
  justify-content: space-between;
  gap: 10px;
  flex-direction: row;
  background-color: ${(props) => props.theme.colors.white};
  align-items: center;
  border-bottom: 2px solid ${(props) => props.theme.colors.grey};
  width: calc(100% - 8px);
  height: 40px;
  padding: 4px;
`;

const HamburgerMenu = styled(FiMenu)`
  color: ${(props) => props.theme.colors.black};
  width: 36px;
  height: 36px;
`;

interface SettingsContentProps {
  visible?: boolean;
}

const SettingsContent = styled.div<SettingsContentProps>`
  display: ${(props) => (props.visible ? "block" : "none")};
  position: absolute;
  width: 160px;
  background-color: ${(props) => props.theme.colors.white};
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  transform: translate(55%, 28%) translate(-100%, 0px);
  border-radius: 8px;
  padding: 12px 16px;
  align-items: center;
  z-index: 1;
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
