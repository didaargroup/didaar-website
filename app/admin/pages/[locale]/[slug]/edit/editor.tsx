"use client";

import { Puck, Config } from "@measured/puck";
 
type Props = {
  HeadingBlock: { children: string };
};

// Create Puck component config
const config: Config<Props> = {
  components: {
    HeadingBlock: {
      fields: {
        children: {
          type: "text",
        },
      },
      render: ({ children }) => {
        return <h1>{children}</h1>;
      },
    },
  },
};
 
// Describe the initial data
const initialData = {};
 
// Save the data to your database
const save = (data: any) => {};
 
// Render Puck editor
export default function Editor() {
  return <Puck config={config} data={initialData} onPublish={save} />;
}