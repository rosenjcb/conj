import styled from 'styled-components';

export const Root = styled.div`
    background-color: ${props => props.isOriginalPost ? "inherit" : props.theme.post.backgroundColor};
    border: 1px solid ${props => props.isOriginalPost ? "none" : props.theme.post.border};
    font-size: ${props => props.theme.post.fontSize};
    font-family: ${props => props.theme.post.fontFamily};
    border-left: none;
    border-top: none;
    display: ${props => props.isOriginalPost ? "block" : "table"};
    margin-top: 2px;
    margin-bottom: 4px;
    padding: 2px;
`;

export const PostInfo = styled.div`
    display: flex;
    justify-content: flex-start;
    gap: 4px;
    flex-direction: row;
    align-items: center;
`;

export const PostContent = styled.div`
    display: block;
    align-items: center;
`;

export const ThumbnailLink = styled.a`
    float: left;
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 3px;
    margin-bottom: 5px;
`;

export const Name = styled.span`
    font-weight: 700;
    color: ${props => props.theme.post.name.color};
`;

export const Subject = styled.span`
    color: ${props => props.theme.post.subject.color};
    font-weight: 700;
`;

const ArrowRoot = styled.span`
    margin-left: 5px;
    text-decoration: none;
    line-height: 1em;
    display: inline-block;
    width: 1em;
    height: 1em;
    text-align: center;
    outline: none;
    opacity: 0.8;
    color: #34345c;
`;

export const SideArrowRoot = styled.div`
    color: #b7c5d9;
    float: left;
    margin-right: 2px;
    margin-top: 0;
    margin-left: 2px;
    font-family: ${props => props.theme.fontFamily };
    font-size: ${props => props.theme.fontSize};
`


export function PostMenuArrow(props) {
    return (
        <ArrowRoot>▶</ArrowRoot>
    )
}

export function SideArrow(props) {
    return (
        <SideArrowRoot>{'>>'}</SideArrowRoot>
    )
}
