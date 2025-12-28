import type { ComponentConfig } from "@measured/puck";

export const GridBlock: ComponentConfig<{
  columns?: 1 | 2 | 3 | 4;
  gap?: number;
}> = {
  fields: {
    content: {
      type: "slot",
    },
    columns: {
      type: "select",
      options: [
        { label: "1 Column", value: 1 },
        { label: "2 Columns", value: 2 },
        { label: "3 Columns", value: 3 },
        { label: "4 Columns", value: 4 },
      ],
    },
    gap: {
      type: "number",
    },
  },
  defaultProps: {
    columns: 2,
    gap: 16,
  },
  render: ({ columns, gap, content: Content }) => {
    return (
      <Content
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns || 2}, 1fr)`,
          gap: `${gap || 16}px`,
        }}
      />
    );
  },
};
