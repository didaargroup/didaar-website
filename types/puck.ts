import type { ComponentData, Data, Slot } from "@measured/puck";

/**
 * Props for each component type in your Puck config
 * Add your component props here as you define them
 */
export type ComponentProps = {
  HeadingBlock: {
    title: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
  };
  GridBlock: {
    items: Slot;
    columns: 1 | 2 | 3 | 4;
    gap: number;
  };
  LinkBlock: {
    linkType: "internal" | "external";
    href?: string;
    pageId?: string;
    label: string;
    openInNewTab?: boolean | string;
  };
  TipTapBlock: {
    content: string;
  };
  SpacerBlock: {
    height: number;
  };
  ImageBlock: {
    url?: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
  };
};

/**
 * Root props for the Puck page
 */
export type RootProps = {
  title?: string;
  description?: string;
  published?: boolean;
  showNavbar?: boolean;
  showFooter?: boolean;
};

/**
 * Puck data type with your component props
 * This is the main type you'll use for page content
 */
export type PuckData = Data<
  ComponentProps,
  RootProps
>;

/**
 * Helper type to extract component data for a specific component type
 */
export type TypedComponentData<T extends keyof ComponentProps> = ComponentData<
  ComponentProps[T]
>;

/**
 * Example usage:
 *
 * // When saving page content to database
 * const pageData: PuckData = {
 *   content: [
 *     {
 *       type: "HeadingBlock",
 *       props: {
 *         id: "heading-1",
 *         title: "Hello World",
 *         level: 1
 *       }
 *     }
 *   ],
 *   root: {
 *     props: {
 *       title: "My Page"
 *     }
 *   },
 *   zones: {}
 * };
 *
 * // When reading from database
 * function renderPage(data: PuckData) {
 *   return data.content.map((item) => {
 *     if (item.type === "HeadingBlock") {
 *       return <h1>{item.props.title}</h1>;
 *     }
 *   });
 * }
 *
 * // Type-safe component prop access
 * function getHeadingProps(data: ComponentData<ComponentProps["HeadingBlock"]>) {
 *   // TypeScript knows data.props.title is a string
 *   return data.props.title;
 * }
 */
