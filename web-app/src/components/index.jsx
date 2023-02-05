import PropTypes from "prop-types";
import styled from "styled-components";
import chroma from "chroma-js";
import { BsFillPersonFill } from "react-icons/bs";
import { BiArrowBack } from "react-icons/bi";
import { useState } from "react";
import ReactModal from "react-modal";

const ModalBase = ({
  children,
  isOpen,
  onRequestClose,
  className,
  title,
  noExit,
}) => {
  const contentClassName = `${className}__content`;
  const overlayClassName = `${className}__overlay`;

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      ariaHideApp={false}
      portalClassName={className}
      overlayClassName={overlayClassName}
      className={contentClassName}
    >
      <ModalRoot>
        <TitleBar>
          <Back onClick={onRequestClose} />
          <Offset distance={"28px"}>
            <Header size="medium" bold>
              {title}
            </Header>
          </Offset>
          <span />
        </TitleBar>
        {children}
      </ModalRoot>
    </ReactModal>
  );
};

ModalBase.propTypes = {
  isOpen: PropTypes.bool,
  onRequestClose: PropTypes.func,
  title: PropTypes.string,
};

const Offset = styled.div`
  margin-right: ${(props) => props.distance};
`;

const ModalRoot = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
`;

const TitleBar = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  /* @media all and (min-width: 1024px) and (max-width: 1280px) {
    justify-content: center;
  }

  @media all and (min-width: 768px) and (max-width: 1024px) {
    justify-content: center;
  }

  @media all and (min-width: 480px) and (max-width: 768px) {
    justify-content: center;
  }

  @media all and (max-width: 480px) {
    justify-content: space-between;
  } */
`;

export const Modal = styled(ModalBase)`
  &__content {
    z-index: 99999;
    position: absolute;
    top: 50%;
    left: 50%;
    right: auto;
    bottom: auto;
    margin-right: -50%;
    transform: translate(-50%, -50%);
    padding: 8px;
    border: none;
    border-radius: 4px;
    background-color: ${(props) => props.theme.colors.white};
    width: fit-content;

    @media all and (min-width: 1024px) and (max-width: 1280px) {
      border-radius: 4px;
    }

    @media all and (min-width: 768px) and (max-width: 1024px) {
      border-radius: 4px;
    }

    @media all and (min-width: 480px) and (max-width: 768px) {
      border-radius: 4px;
    }

    @media all and (max-width: 480px) {
      border-radius: 0px;
      padding: 0px;
      width: 100%;
    }
  }

  &__overlay {
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background-color: rgba(0, 0, 0, 0.3);
  }
`;

export const HR = styled.hr`
  width: ${(props) => props.width ?? "100%"};
  border: none;
  height: 2px;
  background-color: ${(props) => props.theme.colors.grey};
  border-radius: 8px;
`;

export const BoldTitle = styled.span`
  font-size: 10pt;
  text-align: center;
  color: ${(props) => props.theme.primary};
  font-family: ${(props) => props.theme.fontFamily};
  font-weight: 700;
`;

const pickColor = (rarity) => {
  const colorMap = {
    common: "grey",
    uncommon: "green",
    rare: "blue",
    epic: "purple",
  };
  return colorMap[rarity] ?? "white";
};

export const RarityImage = styled.img`
  border: 6px ridge ${(props) => pickColor(props.rarity)};
`;

const sizeCompute = (tag, size) => {
  let res = "1rem";
  let multiplier = 1;
  switch (tag) {
    case "p":
      break;
    case "h1":
      multiplier = 1.25;
      break;
    case "button":
      break;
    default:
      break;
  }
  switch (size) {
    case "small":
      res = `${0.75 * multiplier}em`;
      break;
    case "medium":
      res = `${1 * multiplier}em`;
      break;
    case "large":
      res = `${1.25 * multiplier}em`;
      break;
    case "x-large":
      res = `${1.5 * multiplier}em`;
      break;
    case "xx-large":
      res = `${2 * multiplier}em`;
      break;
    default:
      res = "rem";
  }
  return res;
};

const computeColor = (colors, selectedColor) => {
  return colors[selectedColor] ?? colors["black"];
};

export const Text = styled.p`
  font-weight: ${(props) => (props.bold ? 700 : 500)};
  font-size: ${(props) =>
    props.size ? sizeCompute("p", props.size) : sizeCompute("p", "medium")};
  text-align: ${(props) => props.align ?? "left"};
  font-family: "Inter", arial, sans-serif;
  color: ${(props) => computeColor(props.theme.colors, props.color)};
  width: 100%;
  padding: 0;
  margin: 0;
  overflow-wrap: ${(props) => (props.noOverflow ? "initial" : "break-word")};
`;

export const SpanText = styled.span`
  font-weight: ${(props) => (props.bold ? 700 : 500)};
  font-size: ${(props) =>
    props.size
      ? sizeCompute("span", props.size)
      : sizeCompute("span", "medium")};
  text-align: ${(props) => props.align ?? "left"};
  font-family: "Inter", arial, sans-serif;
  color: ${(props) => computeColor(props.theme.colors, props.color)};
`;

export const Header = styled.h1`
  font-weight: ${(props) => (props.bold ? 700 : 500)};
  text-align: ${(props) => props.align ?? "center"};
  font-family: "Inter", arial, sans-serif;
  color: ${(props) => computeColor(props.theme.colors, props.color)};
  padding: 0;
  margin: 0;
  font-size: ${(props) =>
    props.size ? sizeCompute("h1", props.size) : sizeCompute("h1", "medium")};
`;

export const RoundButton = styled.button`
  color: ${(props) => chroma(props.theme.colors.white)};
  background-color: ${(props) =>
    props.theme.colors[props.color] ?? props.theme.colors.primary};
  border: none;
  border-radius: 9000px;
  font-size: ${(props) =>
    props.size
      ? sizeCompute("button", props.size)
      : sizeCompute("button", "medium")};
  padding: 12px;
  padding-left: 18px;
  padding-right: 18px;

  &:hover {
    background-color: ${(props) =>
      chroma(props.theme.colors.primary).darken().hex()};
    cursor: pointer;
  }
`;

export const SquareButton = styled(RoundButton)`
  border-radius: 4px;
  font-size: 1rem;
`;

export const AccentButton = styled(RoundButton)`
  background-color: ${(props) => props.theme.colors.accent};
  color: ${(props) => props.theme.colors.white};
  border-color: transparent;
  //border-radius: 8px;

  &:hover {
    background-color: ${(props) =>
      chroma(props.theme.colors.accent).darken().hex()};
    cursor: pointer;
  }
`;

export const RoundImage = styled.img`
  max-width: 100%;
  margin: 0 auto;
  aspect-ratio: 16/9;
  border-radius: 8px;
`;

const ExistingAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;

  &:hover {
    cursor: pointer;
  }
`;

export const Avatar = ({ avatar, onClick }) => {
  if (avatar) {
    return <ExistingAvatar onClick={onClick} src={avatar} />;
  } else {
    return <AnonymousAvatar onClick={onClick} />;
  }
};

export const AnonymousAvatar = styled(BsFillPersonFill)`
  width: 48px;
  height: 48px;
  border-radius: 50%;

  &:hover {
    cursor: pointer;
  }
`;

export const Link = styled.a`
  color: ${(props) => props.theme.colors.black};
`;

export const Checkbox = ({ label, onChange, checked, disabled }) => {
  return (
    <CheckBoxContainer>
      <StyledCheckbox
        disabled={disabled}
        checked={checked}
        onChange={onChange}
      />
      {label ? (
        <Text bold noOverflow size="medium">
          {label}
        </Text>
      ) : null}
    </CheckBoxContainer>
  );
};

export const InputField = (props) => {
  const { label, field, form, secret } = props;

  const type = props.type ?? "text";

  const autocomplete = props.autocomplete ?? "false";

  const handleChange = (e) => {
    e.preventDefault();
    form.setFieldValue(field.name, e.target.value);
  };

  return (
    <InputFieldRoot>
      <Label>{label}</Label>
      <TextField
        type={type}
        name={type}
        autocomplete={autocomplete}
        secret={secret}
        placeholder={props.placeholder}
        onChange={handleChange}
      />
    </InputFieldRoot>
  );
};

export const InputFile = ({ field, form, placeholder }) => {
  const [avatar, setAvatar] = useState(placeholder);

  const handleClick = (e) => {
    e.preventDefault();
    form.setFieldValue(field.name, e.target.files[0]);
    setAvatar(URL.createObjectURL(e.target.files[0]));
    console.log(e.target.files[0]);
  };

  return (
    <label>
      <Avatar avatar={avatar} />
      <input onChange={handleClick} type="file" style={{ display: "none" }} />
    </label>
  );
};

const StyledInput = styled.input`
  background-color: green;
`;

const InputFieldRoot = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 70%;
  margin: 0 auto;
  margin-top: 12px;
  margin-bottom: 12px;
`;

const Label = styled.label`
  display: flex;
  justify-content: flex-start;
  font-size: 1em;
  font-weight: 650;
  margin-bottom: 6px;
  color: ${(props) => props.theme.colors.black};
`;

const TextField = styled.input`
  -webkit-text-security: ${(props) => (props.secret ? "circle" : "none")};
  border-radius: 5px;
  background-color: ${(props) => props.theme.colors.white};
  min-height: 2rem;
  border: 1px solid ${(props) => props.theme.colors.grey}; ;
`;

const CheckBoxContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  /* max-width: 200px; */
  align-items: center;
`;

const StyledCheckbox = styled.input.attrs((props) => ({ type: "checkbox" }))`
  min-height: 24px;
  min-width: 24px;
`;

export const Back = styled(BiArrowBack)`
  width: 28px;
  height: 28px;
  border-radius: 50%;

  &:hover {
    cursor: pointer;
  }
`;
