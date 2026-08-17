"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Accordion = AccordionPrimitive.Root;
export const AccordionItem = ({
  className,
  ...props
}: AccordionPrimitive.AccordionItemProps) => (
  <AccordionPrimitive.Item
    className={cn("border-b border-line", className)}
    {...props}
  />
);

export const AccordionTrigger = ({
  className,
  children,
  ...props
}: AccordionPrimitive.AccordionTriggerProps) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      className={cn(
        "group flex flex-1 items-center justify-between py-5 text-left font-medium text-ink cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        size={18}
        className="shrink-0 text-ink-mute transition-transform duration-300 group-data-[state=open]:rotate-180"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);

export const AccordionContent = ({
  className,
  children,
  ...props
}: AccordionPrimitive.AccordionContentProps) => (
  <AccordionPrimitive.Content
    className={cn(
      "overflow-hidden text-sm text-ink-soft leading-relaxed data-[state=open]:animate-fade-in",
      className
    )}
    {...props}
  >
    <div className="pb-5">{children}</div>
  </AccordionPrimitive.Content>
);
