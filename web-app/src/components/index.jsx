import styled from 'styled-components';
import chroma from 'chroma-js';

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

const sizeCompute = (size) => {
  let res = null;
  switch(size) {
    case "small": 
      res = "0.75rem";
      break;
    case "medium": 
      res = "1rem";
      break;
    case "large": 
      res = "1.25rem";
      break;
    case "x-large": 
      res = "1.5rem";
      break;
    case "xx-large": 
      res = "2rem";
      break;
  }
  return res;
}

const computeColor = (colors, selectedColor) => {
  return colors[selectedColor]  ?? colors['black'];
}

export const Text = styled.p`
  font-weight: ${props => props.bold ? 700 : 500}; 
  font-size: ${props => sizeCompute(props.size) ?? "1rem"};
  text-align: ${props => props.align ?? 'left'};
  font-family: "Inter",arial,sans-serif;
  line-height: 1.5rem;
  color: ${props => computeColor(props.theme.colors, props.color)};
  padding: 0;
  margin: 0;
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
`;

export const Link = styled.a`
  color: ${props => props.theme.colors.black};
`;


export const TitlePoint = styled.h2`
  color:  ${props => props.theme.colors.black};
`;