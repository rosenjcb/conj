import styled from 'styled-components';

export const HR = styled.hr`
  width: ${props => props.width ?? "100%"};
  border: none;
  border-top: 1px solid ${props => props.theme.lineBreak.borderTop};
`
