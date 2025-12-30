import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export const FormSection = ({
  heading,
  children,
}: {
  heading: ReactNode;
  children: React.ReactNode;
}) => (
  <>
    <section
      className={cn(
        "border rounded-lg overflow-hidden shadow-md/5 gap-6",
        "@2xl:grid @2xl:border-none @2xl:rounded-none @2xl:overflow-auto @2xl:shadow-none"
      )}
      style={{ gridTemplateColumns: "minmax(20ch, auto) 1fr" }}
    >
      <div className="">{heading}</div>
      <div
        className={cn(
          "p-4 bg-white max-w-2xl",
          "@2xl:p-6 @2xl:rounded-lg @2xl:overflow-hidden @2xl:border @2xl:shadow-md/5"
        )}
      >
        {children}
      </div>
    </section>
  </>
);
export const HeadingSection = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <>
    <h3 className="text-lg font-semibold text-foreground p-3 border-b @2xl:p-0 @2xl:border-none">
      {title}
    </h3>
    <p className="text-sm text-muted-foreground mt-1 hidden @2xl:block">
      {description}
    </p>
  </>
);
