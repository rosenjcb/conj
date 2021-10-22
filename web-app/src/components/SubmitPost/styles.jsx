import styled from 'styled-components'
import { Field, Textarea } from 'formik'

export const Root = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: auto;
`

export const FieldRoot = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 1px;
`;

export const FieldName = styled.span`
  display: inline-flex;
  align-items: center;
  background-color: ${props => props.theme.post.primary};
  width: 100px;
  text-align: left;
  color: #000;
  font-weight: 700;
  border: 1px solid #000;
  padding: 0 5px;
  font-size: 10pt;
  vertical-align: center;
`

export const FieldInput = styled(Field)`
  margin: 0;
  width: ${props => props.fill ? '292px' : '244px'};
  margin-right: 2px;
  padding: 2px 4px 3px;
  border: 1px solid #aaa;
  outline: none;
  font-family: aria, helvetica, sans-serif;
  font-size: 10pt;
  -webkit-appearance: none;

  &:focus {
        outline: none;
    }
`;

// export const FieldInputArea = styled(Field)`
//   margin: 0;
//   width: 292px;
//   margin-right: 2px;
//   padding: 2px 4px 3px;
//   font-family: aria, helvetica, sans-serif;
//   font-size: 10pt;
//   -webkit-appearance: none;

//   &:focus {
//         outline: none;
//     }
// `;

export const FieldInputFile = styled.input`
  margin: 0;
  width: 292px;
  appearance: none;
  border: 0 none;
  outline: none;
  font-family: aria, helvetica, sans-serif;
  font-size: 10pt;

  &:focus {
        outline: none;
    }
`;