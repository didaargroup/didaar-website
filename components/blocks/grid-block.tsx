import type { ComponentConfig, Slot } from "@measured/puck";

export type GridBlockProps = {
  items: Slot;
  columns: 1 | 2 | 3 | 4;
  gap: number;
};

export const GridBlock: ComponentConfig<GridBlockProps> = {
  fields: {
    items: {
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
      min: 0,
      max: 64,
    },
  },
  defaultProps: {
    items: [],
    columns: 2,
    gap: 16,
  },
  render: ({ columns, gap, items: Items }) => {
    return (
      <Items
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns || 2}, 1fr)`,
          gap: `${gap || 16}px`,
        }}
      />
    );
  },
};
