import styled from 'styled-components';

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
`;
