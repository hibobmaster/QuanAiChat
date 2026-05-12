declare module "*.jpg";
declare module "*.png";
declare module "*.woff2";
declare module "*.woff";
declare module "*.ttf";
declare module "*.module.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.svg";
