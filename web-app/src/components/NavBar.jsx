import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { me as callMe, logout } from '../api/account'
import { fetchBoards } from '../api/board';
import chroma from 'chroma-js';
import { FiMenu } from 'react-icons/fi';
import {RiDiscussFill} from 'react-icons/ri';
import { BsFillBarChartFill } from 'react-icons/bs';
import { Text } from './index';
import { useThread } from '../hooks/useThread';
import { SquareButton } from './index';
import { detectMobile } from '../util/window';
import ReactModal from 'react-modal';
import { Header } from './index';
import { GoGear } from 'react-icons/go';
import {useComponentVisible} from '../hooks/useComponentVisible';
import { AccountSettings } from './AccountSettings';
import { Login } from './Login';

const customStyle = {
  overlay: {
    inset: 0,
    zIndex: 2,
  },
  content: {
    inset: 0,
    right: 0,
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: '0px',
    border: 'none'
  },
};

export const WithNavBar = ({component}) => {

  const [me, setMe] = useState(null);
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    async function getAuth() {
      try { 
        const res = await callMe();
        setMe(res);
      } catch(e) {
        setMe(null);
      }
    }
    async function getBoards() {
      try {
        const res = await fetchBoards();
        setBoards(res.data);
      } catch (e) {
        setBoards(null);
      }
    }
    getAuth();
    getBoards();
  },[]);

  const history = useHistory();

  const isMobile = detectMobile();

  const handleLogout = async() => {
    await logout();
    window.location.reload();
  }

  const [drawerOpen, setDrawerOpen] = useState(false);

  // const toggleDrawer = () => {
  //   setDrawerOpen(!drawerOpen);
  // }

  const openDrawer = () => {
    setDrawerOpen(true);
  }

  const closeDrawer = () => {
    setDrawerOpen(false);
  }

  const redirectHome = () => {
    history.push("/");
  }

  const [popUp, setPopUp] = useState(false);

  const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

  const toggleVisible = () => {
    setIsComponentVisible(!isComponentVisible)
  }

  const [accountIsOpen, setAccountIsOpen] = useState(false)

  const closeAccount = () => setAccountIsOpen(false);

  const openAccount = () => setAccountIsOpen(true);



  const [loginOpen, setLoginOpen] = useState(false)

  const closeLogin = () => setLoginOpen(false);

  const openLogin = () => setLoginOpen(true);


  const customStyle = {
    overlay: {
      zIndex: 2,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: '0',
      border: 'none',
      borderRadius: '0px',
      background: 'none'
    },
  };

  return (
    <BoardRoot>
      <ReactModal style={customStyle} isOpen={accountIsOpen} onRequestClose={closeAccount}><AccountSettings/></ReactModal>
      <ReactModal style={customStyle} isOpen={loginOpen} onRequestClose={closeLogin}><Login/></ReactModal>
      <HomeNavBar>
        <HamburgerMenu onClick={openDrawer}/>
        <Header bold onClick={redirectHome}>conj.app</Header>
        <IconContainer>
          <SettingsIcon onClick={toggleVisible}/>
          <SettingsContent visible={isComponentVisible} ref={ref}>
              {me === null ? <Link onClick={openLogin}><SettingText align="center">Login</SettingText></Link> : null}
              {me !== null ? <Link onClick={handleLogout}><SettingText align="center">Logout</SettingText></Link> : null}
              {me !== null ? <Link onClick={openAccount}><SettingText align="center">Account</SettingText></Link> : null}
            </SettingsContent>
        </IconContainer>
      </HomeNavBar>
      <Page>
        { !isMobile ? <BoardDrawer boards={boards}/> : <ReactModal style={customStyle} isOpen={drawerOpen} onRequestClose={closeDrawer}><BoardDrawer boards={boards}/></ReactModal>}
        {component}
      </Page>
    </BoardRoot>
  )
}

const BoardDrawer = (props) => {

  const { boards } = props; 

  const history = useHistory();

  const { board } = useThread(); 

  const handleSubmit = (e) => {
    e.preventDefault();
  }

  const handleClick = (board) => {
    console.log(board);
    history.push(`/boards/${board}`)
  }

  return(
    <BoardDrawerRoot>
      <TitleContainer>
        <Header bold>Most Popular Boards</Header>
      </TitleContainer>
      <BoardList>
        <BoardRow><BoardIcon/><BarChartIcon/></BoardRow>
        {boards != null ? boards.map(b => <HighlightBoardRow onClick={() => handleClick(b)} selected={b === board}><BoardItem>/{b}/</BoardItem><Text size={"medium"} align="right" color={"black"} bold>10+</Text></HighlightBoardRow>) : <Text bold size={"medium"}>No Boards Found</Text>}
      </BoardList>
      <SearchForm onSubmit={handleSubmit}>
        <Input type="text"/>
      </SearchForm>
    </BoardDrawerRoot>
  )
}

const Page = styled.div`
  display: flex;
  justify-content: flex-start;
  padding-top: 5rem;
  flex-direction: row;
  margin: 0 auto;
  margin-bottom: 1rem;
  gap: 3rem;
  max-height: calc(100vh - 5rem);

  @media all and (min-width: 1024px) {
    width: 40%;
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

const SearchForm = styled.form`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
`;

const Input = styled.input`
  border-radius: 80px;
  font-size: 2rem;
  width: 60%;
  margin-bottom: 10px;
  padding: 0;
`;

const Content = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction column;
  background-color: ${props => props.theme.colors.grey};
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
  padding-left: 1rem;
  padding-right: 1rem;
  border-radius: 9000px;
`;

const HighlightBoardRow = styled(BoardRow)`
  background-color: ${props => props.selected ? chroma(props.theme.colors.primary).brighten(2.5).hex() : "inherit"};
  &:hover {
    background-color: ${props => chroma(props.theme.colors.primary).brighten(2.5).hex()};
    cursor: pointer;
  }
  min-width: 250px;
`;

const BoardItem = styled(Text).attrs(props => ({bold: true}))`
  color: ${props => props.theme.colors.black};
  border-radius: 12px; 
  padding: 8px;
  user-select: none;
`;

const BoardDrawerRoot = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  gap: 2rem;
  width: 25%;
  height: fit-content;
  border-radius: 8px;
  margin-right: 1rem;
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

const TitleContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
`

const HomeNavBar = styled.div`
  display: flex;
  position: fixed;
  z-index: 1;
  justify-content: space-between;
  gap: 10px;
  flex-direction: row;
  background-color: ${props => props.theme.colors.white};
  align-items: center;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;

  @media all and (min-width: 1024px) {
    width: 60%;
    padding-left: 20%;
    padding-right: 20%;
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

const HamburgerMenu = styled(FiMenu)`
  color: ${props => props.theme.colors.black};
  width: 48px;
  height: 48px;
  padding-right: 10px;

  @media all and (min-width: 1024px) {
    visibility: hidden;
  }
  
  @media all and (min-width: 768px) and (max-width: 1024px) {
    visibility: hidden;
  }
  
  @media all and (min-width: 480px) and (max-width: 768px) {
    visibility: visible;
   }
  
  @media all and (max-width: 480px) { 
    visibility: visible;
  }
`;

const BoardIcon = styled(RiDiscussFill)`
  color: ${props => props.theme.colors.primary};
  width: 48px;
  height: 48px;
`;

const BarChartIcon = styled(BsFillBarChartFill)`
  color: ${props => props.theme.colors.primary};
  width: 48px;
  height: 48px;
`;

const ToolTip = styled.span`
  visibility: ${props => props.visibility ? "visible" : "hidden"};
  width: 100%;
  background-color: ${props => props.theme.colors.grey};
  color: white;
  font-weight: 650;
  text-align: center;
  border-radius: 6px;
  padding: 10px;
  position: relative;
  z-index: 1;
  bottom: 60px;
  left: 15%;
  margin-left: -100px;

  &:after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: ${props => props.theme.colors.grey} transparent transparent transparent;
  };
`;


const SettingsContent = styled.div`
  display: ${props => props.visible ? "block" : "none"};
  position: absolute;
  width: 160px;
  background-color: ${props => props.theme.colors.white};
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  transform: translate(55%, 28%) translate(-100%, 0px);
  border-radius: 8px;
  padding: 12px 16px;
  align-items: center;
`;

const SettingsIcon = styled(GoGear)`
  cursor: pointer;
  width: 40px;
  align-self: center;
  height: 40px;
  display: inline-block;
  position: relative;
  
`;


const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 9000px;
  display: flex;
  justify-content: center;
  background-color: ${props => chroma(props.theme.colors.grey).brighten(0.6).hex()};
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
      background-color: ${props => chroma(props.theme.colors.grey).brighten(0.6).hex()};
    }
`;