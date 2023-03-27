import styled from "styled-components";
import chroma from "chroma-js";
import { BsFillPersonFill } from "react-icons/bs";
import { BiArrowBack } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";
import { InputHTMLAttributes, ReactNode, useState } from "react";
import * as RadixSwitch from "@radix-ui/react-switch";
import * as RadixDialog from "@radix-ui/react-dialog";

interface RadixModalProps {
  children?: any;
  className?: string;
  trigger?: ReactNode;
  open?: any;
  onOpenChange?: any;
}

export const RadixModal = (props: RadixModalProps) => {
  return (
    <RadixDialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      {props.trigger ? <RadixTrigger>{props.trigger}</RadixTrigger> : null}
      <RadixDialog.Portal>
        <RadixOverlay />
        <RadixContent>
          <RadixClose>
            <CloseButton />
          </RadixClose>
          {props.children}
        </RadixContent>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

const RadixTrigger = styled(RadixDialog.Trigger)`
  all: unset;
  width: inherit;
`;

const RadixOverlay = styled(RadixDialog.Overlay)`
  background-color: black;
  opacity: 0.5;
  position: fixed;
  inset: 0;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const CloseButton = styled(RxCross2)`
  all: unset;
  border-radius: 100%;
  height: 25px;
  width: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.colors.black};
  position: absolute;
  top: 10px;
  right: 10px;

  &:hover {
    cursor: pointer;
  }
`;

const RadixContent = styled(RadixDialog.Content)`
  background-color: ${(props) => props.theme.colors.white};
  border-radius: 6px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: fit-content;
  max-width: 90vw;
  max-height: 85vh;
  padding: 25px;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);

  @media all and (min-width: 1024px) and (max-width: 1280px) {
  }

  @media all and (min-width: 768px) and (max-width: 1024px) {
  }

  @media all and (min-width: 480px) and (max-width: 768px) {
    width: 80%;
  }

  @media all and (max-width: 480px) {
    width: 80%;
  }
`;

export const RadixClose = styled(RadixDialog.Close)`
  all: unset;
  display: block;
  /* width: 0;
  height: 0; */
`;

// interface OffsetProps {
//   distance: string;
// }

// const Offset = styled.div<OffsetProps>`
//   margin-right: ${(props) => props.distance};
// `;

interface HRProps {
  width?: string;
}

export const HR = styled.hr<HRProps>`
  width: ${(props) => props.width ?? "100%"};
  border: none;
  height: 2px;
  background-color: ${(props) => props.theme.colors.grey};
  border-radius: 8px;
`;

export enum Size {
  Small,
  Medium,
  Large,
  Xlarge,
}

const sizeCompute = (tag: string, size: string) => {
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

// interface Color {
//   black: string
// }

const computeColor = (colors: any, selectedColor: string | undefined) => {
  return colors[selectedColor ?? "black"];
};

export interface TextProps {
  bold?: boolean;
  size?: string;
  align?: string;
  noOverflow?: boolean;
  color?: string;
  width?: string;
}

export const Text = styled.p<TextProps>`
  font-weight: ${(props) => (props.bold ? 700 : 500)};
  font-size: ${(props) =>
    props.size ? sizeCompute("p", props.size) : sizeCompute("p", "medium")};
  text-align: ${(props) => props.align ?? "left"};
  font-family: "Inter", arial, sans-serif;
  color: ${(props) => computeColor(props.theme.colors, props.color)};
  width: ${(props) => props.width ?? "auto"};
  padding: 0;
  margin: 0;
  overflow-wrap: ${(props) => (props.noOverflow ? "initial" : "break-word")};
`;

interface SpanTextProps {
  bold?: boolean;
  size?: string;
  align?: string;
}

export const SpanText = styled.span<SpanTextProps>`
  font-weight: ${(props) => (props.bold ? 700 : 500)};
  font-size: ${(props) =>
    props.size
      ? sizeCompute("span", props.size)
      : sizeCompute("span", "medium")};
  text-align: ${(props) => props.align ?? "left"};
  font-family: "Inter", arial, sans-serif;
  word-wrap: break-word;
  color: ${(props) => computeColor(props.theme.colors, props.color)};
`;

interface HeaderProps {
  bold?: boolean;
  align?: string;
  color?: string;
  size?: string;
}

export const Header = styled.h1<HeaderProps>`
  font-weight: ${(props) => (props.bold ? 700 : 500)};
  text-align: ${(props) => props.align ?? "center"};
  font-family: "Inter", arial, sans-serif;
  color: ${(props) => computeColor(props.theme.colors, props.color)};
  padding: 5px;
  margin: 0;
  border-radius: 4px;
  font-size: ${(props) =>
    props.size ? sizeCompute("h1", props.size) : sizeCompute("h1", "medium")};

  &:hover {
    cursor: pointer;
  }
`;

interface RoundButtonProps {
  size?: string;
  color?: string;
}

export const RoundButton = styled.button<RoundButtonProps>`
  color: ${(props) => props.theme.colors.white};
  background-color: ${(props) =>
    props.color ? props.theme.colors[props.color] : props.theme.colors.black};
  border: none;
  border-radius: 9000px;
  font-size: ${(props) =>
    props.size
      ? sizeCompute("button", props.size)
      : sizeCompute("button", "medium")};
  padding: 12px;
  padding-left: 18px;
  padding-right: 18px;

  ${(props) =>
    props.disabled
      ? `cursor: not-allowed;
   pointer-events: none;`
      : null}

  &:hover {
    /* background-color: ${(props) =>
      chroma(props.color ?? props.theme.colors.black)
        .darken()
        .hex()}; */
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
  align-self: flex-start;

  &:hover {
    cursor: pointer;
  }
`;

interface AvatarProps {
  avatar?: string | null;
  onClick?(): void;
}

export const Avatar = ({ avatar, onClick }: AvatarProps) => {
  if (avatar) {
    return <ExistingAvatar onClick={onClick} src={avatar} />;
  } else {
    return <AnonymousAvatar />;
  }
};

export const AnonymousAvatar = styled(BsFillPersonFill)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  align-self: flex-start;

  &:hover {
    cursor: pointer;
  }
`;

export const Link = styled.a`
  color: ${(props) => props.theme.colors.black};
`;

interface CheckboxProps {
  label?: string;
  onChange(): void;
  checked?: boolean;
  disabled?: boolean;
}

export const Checkbox = ({
  label,
  onChange,
  checked,
  disabled,
}: CheckboxProps) => {
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

interface SwitchProps {
  disabled?: boolean;
  checked: boolean;
  onCheckedChange: () => void;
  label?: string;
}

export const Switch = (props: SwitchProps) => {
  return (
    <SwitchRoot>
      {props.label ? <Label>{props.label}</Label> : null}
      <SwitchBody {...props}>
        <SwitchThumb />
      </SwitchBody>
    </SwitchRoot>
  );
};

const SwitchRoot = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const SwitchBody = styled(RadixSwitch.Root)`
  all: unset;
  width: 38px;
  height: 20px;
  background-color: grey;
  border-radius: 9999px;
  position: relative;
  /* box-shadow: 0 2px 10px ${(props) => props.theme.colors.black}; */
  box-shadow: 0 0 0 2px ${(props) => props.theme.colors.black};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  &:focus {
    /* box-shadow: 0 0 0 2px ${(props) => props.theme.colors.black}; */
  }

  &[data-state="checked"] {
    background-color: ${(props) => props.theme.colors.black};
  }
`;

const SwitchThumb = styled(RadixSwitch.Thumb)`
  display: block;
  width: 20px;
  height: 20px;
  background-color: ${(props) => props.theme.colors.white};
  border-radius: 9999px;
  box-shadow: 0 2px 2px ${(props) => props.theme.colors.black};
  transition: transform 100ms;
  transform: translateX(1px);
  will-change: transform;

  &[data-state="checked"] {
    transform: translateX(19px);
  }
`;

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  type?: string;
  form?: any;
  secret?: boolean;
  autocomplete?: boolean;
  field?: any;
}

export const InputField = (props: InputFieldProps) => {
  const { label, field, form, secret } = props;

  const type = props.type ?? "text";

  const autocomplete = props.autocomplete ?? "false";

  const handleChange = (e: any) => {
    e.preventDefault();
    form.setFieldValue(field.name, e.target.value);
  };

  return (
    <InputFieldRoot>
      {label ? <Label>{label}</Label> : null}
      <TextField
        type={type}
        name={type}
        autocomplete={autocomplete}
        secret={secret}
        // placeholder={placeholder}
        onChange={handleChange}
        {...props}
      />
    </InputFieldRoot>
  );
};

interface InputFileProps {
  field: any;
  form: any;
  placeholder: string;
}

export const InputFile = ({ field, form, placeholder }: InputFileProps) => {
  const [avatar, setAvatar] = useState(placeholder);

  const handleClick = (e: any) => {
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

const InputFieldRoot = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  margin: 0 auto;
`;

const Label = styled.label`
  display: flex;
  justify-content: flex-start;
  font-size: 1em;
  font-weight: 650;
  margin-bottom: 6px;
  color: ${(props) => props.theme.colors.black};
`;

interface TextFieldProps {
  secret?: boolean;
}

const TextField = styled.input<TextFieldProps>`
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
