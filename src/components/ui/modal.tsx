"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Modal = Dialog.Root;
export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;

export function ModalContent({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
      <Dialog.Content
        className={cn(
          "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-warm-white p-6 sm:p-8 shadow-2xl focus:outline-none data-[state=open]:animate-pop",
          className
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <Dialog.Title className="font-serif text-2xl text-ink">{title}</Dialog.Title>
          <Dialog.Close className="text-ink-mute hover:text-ink cursor-pointer" aria-label="Close">
            <X size={20} />
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
