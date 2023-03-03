import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      [color: string]: string;
    };
  }
}
