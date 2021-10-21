import styled from 'styled-components'

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start
  height: auto;
`

export const FieldName = styled.div`
  background-color: ${props => props.theme.post.primary};
  color: #000;
  font-weight: 700;
  border: 1px solid #000;
  padding: 0 5px;
  font-size: 10pt
`
  