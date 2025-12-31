import type { ComponentConfig } from "@measured/puck";

export const SpacerBlock: ComponentConfig<{
  height: number;
}> = {
  fields: {
    height: { type: "number" },
  },
  defaultProps: {
    height: 16,
  },
  render: ({ height }) => {
    return <div style={{ height: `${height}px` }} />;
  },
};
