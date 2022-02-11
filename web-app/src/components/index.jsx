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
