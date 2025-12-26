import React, {forwardRef, HTMLAttributes} from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'id'> {
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: any;
  indicator?: boolean;
  indentationWidth: number;
  value: string;
  onCollapse?(): void;
  onRemove?(): void;
  wrapperRef?(node: HTMLLIElement): void;
}

export const TreeItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      collapsed,
      onCollapse,
      onRemove,
      style,
      value,
      wrapperRef,
      ...props
    },
    ref
  ) => {
    return (
      <li
        className={cn(
          "relative",
          clone && "opacity-50",
          ghost && "opacity-50",
          disableInteraction && "pointer-events-none"
        )}
        ref={wrapperRef}
        style={
          {
            '--spacing': `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
      >
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm transition-colors",
            !disableInteraction && "hover:bg-accent/50"
          )}
          ref={ref}
          style={style}
        >
          <Handle {...handleProps} />
          {onCollapse && (
            <Action
              onClick={onCollapse}
              className={cn(
                "flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors",
                collapsed && "rotate-0"
              )}
            >
              {collapseIcon}
            </Action>
          )}
          <span className="flex-1 truncate text-sm font-medium text-foreground">{value}</span>
          {!clone && onRemove && <Remove onClick={onRemove} />}
          {clone && childCount && childCount > 1 ? (
            <span className="text-xs text-muted-foreground">{childCount}</span>
          ) : null}
        </div>
      </li>
    );
  }
);

const collapseIcon = (
  <svg width="10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 41">
    <path d="M30.76 39.2402C31.885 40.3638 33.41 40.995 35 40.995C36.59 40.995 38.115 40.3638 39.24 39.2402L68.24 10.2402C69.2998 9.10284 69.8768 7.59846 69.8494 6.04406C69.822 4.48965 69.1923 3.00657 68.093 1.90726C66.9937 0.807959 65.5106 0.178263 63.9562 0.150837C62.4018 0.123411 60.8974 0.700397 59.76 1.76024L35 26.5102L10.24 1.76024C9.10259 0.700397 7.59822 0.123411 6.04381 0.150837C4.4894 0.178263 3.00632 0.807959 1.90702 1.90726C0.807714 3.00657 0.178019 4.48965 0.150593 6.04406C0.123167 7.59846 0.700153 9.10284 1.75999 10.2402L30.76 39.2402Z" />
  </svg>
);

interface HandleProps extends HTMLAttributes<HTMLButtonElement> {}

function Handle({ ...props }: HandleProps) {
  return (
    <button
      className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
      {...props}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}

interface ActionProps extends HTMLAttributes<HTMLButtonElement> {}

function Action({ ...props }: ActionProps) {
  return <button type="button" {...props} />;
}

interface RemoveProps extends HTMLAttributes<HTMLButtonElement> {}

function Remove({ ...props }: RemoveProps) {
  return (
    <button
      className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
      {...props}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}