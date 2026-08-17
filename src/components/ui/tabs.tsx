"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = ({
  className,
  ...props
}: TabsPrimitive.TabsListProps) => (
  <TabsPrimitive.List
    className={cn(
      "flex items-center gap-6 border-b border-line overflow-x-auto no-scrollbar",
      className
    )}
    {...props}
  />
);

export const TabsTrigger = ({
  className,
  ...props
}: TabsPrimitive.TabsTriggerProps) => (
  <TabsPrimitive.Trigger
    className={cn(
      "relative shrink-0 py-4 text-sm font-medium text-ink-mute transition-colors cursor-pointer hover:text-ink data-[state=active]:text-ink after:absolute after:left-0 after:right-0 after:-bottom-px after:h-[2px] after:bg-ink after:scale-x-0 after:transition-transform data-[state=active]:after:scale-x-100",
      className
    )}
    {...props}
  />
);

export const TabsContent = ({
  className,
  ...props
}: TabsPrimitive.TabsContentProps) => (
  <TabsPrimitive.Content
    className={cn("pt-8 data-[state=active]:animate-fade-in", className)}
    {...props}
  />
);
