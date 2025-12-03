declare module "*.svg" {
  const content: string;
  export default content;
}

declare var triggerIntersection: (element: Element, isIntersecting?: boolean) => void;
