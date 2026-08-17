"use client";

import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCartStore, type CartLine } from "@/store/cart-store";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  item,
  quantity = 1,
  className,
  children,
  openDrawer = true,
  disabled,
  ...props
}: {
  item: Omit<CartLine, "key" | "quantity">;
  quantity?: number;
  openDrawer?: boolean;
  children?: React.ReactNode;
} & ButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    addItem({ ...item, quantity }, openDrawer);
    setJustAdded(true);
    if (!openDrawer) {
      toast.success(`Added ${item.name} to your bag`);
    }
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {justAdded ? (
        <span className="flex items-center gap-1.5 animate-pop">
          <Check size={16} /> Added
        </span>
      ) : (
        children ?? (
          <span className="flex items-center gap-1.5">
            <ShoppingBag size={16} /> Add to Cart
          </span>
        )
      )}
    </Button>
  );
}
