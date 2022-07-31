import styled from 'styled-components';
import chroma from 'chroma-js';
import { BsFillPersonFill } from 'react-icons/bs';

export const HR = styled.hr`
  width: ${props => props.width ?? "100%"};
  border: none;
  height: 2px;
  background-color ${props => props.theme.colors.grey};
  border-radius: 8px;
`;

export const BoldTitle = styled.span`
  font-size: 10pt;
  text-align: center;
  color: ${props => props.theme.primary};
  font-family: ${props => props.theme.fontFamily};
  font-weight: 700;
`;

const pickColor = (rarity) => {
    const colorMap = {
        "common": "grey",
        "uncommon": "green",
        "rare": "blue",
        "epic": "purple"
    }
    return colorMap[rarity] ?? 'white';
}

export const RarityImage = styled.img`
    border: 6px ridge ${props => pickColor(props.rarity)};
`;

const sizeCompute = (tag, size) => {
  let res = "1rem";
  let multiplier = 1;
  switch(tag) {
    case "p":
      break;
    case "h1":
      multiplier = 2;
      break;
  };
  switch(size) {
    case "small": 
      res = `${0.75 * multiplier}rem`;
      break;
    case "medium": 
      res = `${1 * multiplier}rem`;
      break;
    case "large": 
      res = `${1.25 * multiplier}rem`;
      break;
    case "x-large": 
      res = `${1.5 * multiplier}rem`;
      break;
    case "xx-large": 
      res = `${2 * multiplier}rem`;
      break;
  };
  return res;
}

const computeColor = (colors, selectedColor) => {
  return colors[selectedColor]  ?? colors['black'];
}

export const Text = styled.p`
  font-weight: ${props => props.bold ? 700 : 500}; 
  font-size: ${props => props.size ? sizeCompute("p", props.size) : sizeCompute("p", "medium")};
  text-align: ${props => props.align ?? 'left'};
  font-family: "Inter",arial,sans-serif;
  color: ${props => computeColor(props.theme.colors, props.color)};
  width: 100%;
  padding: 0;
  margin: 0;
`;

export const Header = styled.h1`
  font-weight: ${props => props.bold ? 700 : 500};
  text-align ${props => props.align ?? 'center'};
  font-family: "Inter",arial,sans-serif;
  color: ${props => computeColor(props.theme.colors, props.color)};
  padding: 0;
  margin: 0;
  font-size: ${props => props.size ? sizeCompute("h1", props.size) : sizeCompute("h1", "medium")};
`;

export const RoundButton = styled.button`
  color: ${props => chroma(props.theme.colors.white)};
  background-color: ${props => props.theme.colors.primary};
  border: none;
  border-radius: 9000px; 
  font-size: 1.5rem;
  padding: 10px;
  padding-left: 20px;
  padding-right: 20px;

  &:hover {
    background-color: ${props => chroma(props.theme.colors.primary).darken().hex()};
    cursor: pointer;
  }
`;

export const SquareButton = styled(RoundButton)`
  border-radius: 4px;
  font-size: 1rem;
`;


export const AccentButton = styled(RoundButton)`
  background-color: ${props => props.theme.colors.accent};
  color: ${props => props.theme.colors.white};
  border-color: transparent;
  //border-radius: 8px;

  &:hover {
    background-color: ${props => chroma(props.theme.colors.accent).darken().hex()};
    cursor: pointer;
  }
`;

export const RoundImage = styled.img`
  max-width: 100%;
  margin: 0 auto;
  aspect-ratio: 16/9;
  border-radius: 8px;
`;

export const Avatar = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;

  &:hover {
    cursor: pointer;
  }
`;

export const AnonymousAvatar = styled(BsFillPersonFill)`
  width: 64px;
  height: 64px;
  border-radius: 50%;

  &:hover {
    cursor: pointer;
  }
`;

export const Link = styled.a`
  color: ${props => props.theme.colors.black};
`;

export const Checkbox = ({label, onClick, checked}) => {

  return(
    <CheckBoxContainer>
      <StyledCheckbox checked={checked} onClick={onClick}/>
      {label ? <Text bold size="medium">{label}</Text> : null }
    </CheckBoxContainer>
  )
}

const CheckBoxContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  max-width: 100px;
  align-items: center;
`;

const StyledCheckbox = styled.input.attrs(props => ({type: "checkbox"}))`
  min-height: 24px;
  min-width: 24px;
`;