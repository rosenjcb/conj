import styled from 'styled-components';
import chroma from 'chroma-js';

export const HR = styled.hr`
  width: ${props => props.width ?? "100%"};
  border: none;
  border-top: 1px solid ${props => props.theme.lineBreak.borderTop};
`

export const BoldTitle = styled.span`
  font-size: 10pt;
  text-align: center;
  color: ${props => props.theme.primary};
  font-family: ${props => props.theme.fontFamily};
  font-weight: 700;
`

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
`

export const ErrorText = styled.p`
  color: red;
  margin: 0 auto;
  word-wrap: break-word;
`;

export const RoundButton = styled.button`
  color: ${props => chroma(props.theme.newTheme.colors.white)};
  background-color: ${props => chroma(props.theme.newTheme.colors.primary).brighten().hex()};
  border: none;
  border-radius: 9000px; 
  font-size: 1.5rem;
  padding: 10px;
  padding-left: 20px;
  padding-right: 20px;

  &:hover {
    background-color: ${props => chroma(props.theme.newTheme.colors.primary).hex()};
  }
`;

export const RoundImage = styled.img`
  max-width: 200px;
  aspect-ratio: 16/9;
  border-radius: 8px;
`;

