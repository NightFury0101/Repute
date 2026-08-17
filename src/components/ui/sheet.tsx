"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

const sideClasses = {
  right: "inset-y-0 right-0 h-full w-full max-w-md data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right",
  left: "inset-y-0 left-0 h-full w-full max-w-sm data-[state=open]:animate-slide-in-left data-[state=closed]:animate-slide-out-left",
  bottom: "inset-x-0 bottom-0 max-h-[88vh] w-full rounded-t-3xl data-[state=open]:animate-slide-in-bottom data-[state=closed]:animate-slide-out-bottom",
};

export function SheetContent({
  side = "right",
  className,
  children,
  title,
  onOpenAutoFocus,
}: {
  side?: "left" | "right" | "bottom";
  className?: string;
  children: React.ReactNode;
  title: string;
  onOpenAutoFocus?: (e: Event) => void;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
      <Dialog.Content
        onOpenAutoFocus={onOpenAutoFocus}
        className={cn(
          "fixed z-50 bg-warm-white shadow-2xl flex flex-col focus:outline-none",
          sideClasses[side],
          className
        )}
      >
        <Dialog.Title className="sr-only">{title}</Dialog.Title>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function SheetCloseButton({ className }: { className?: string }) {
  return (
    <Dialog.Close
      className={cn(
        "rounded-full p-2 text-ink-soft hover:bg-ink/5 hover:text-ink transition-colors cursor-pointer",
        className
      )}
      aria-label="Close"
    >
      <X size={18} />
    </Dialog.Close>
  );
}
