'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

type Props = {
  children: ReactNode;
  /** Use icon size on dense tables */
  triggerSize?: 'default' | 'icon';
};

/**
 * Uncontrolled row menu — avoids Radix bugs with a shared `open` state across many table rows.
 * High z-index so the portal renders above cards/dialog overlays.
 */
export function AdminRowActionsMenu({ children, triggerSize = 'default' }: Props) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={triggerSize === 'icon' ? 'icon' : 'sm'}
          aria-label="Row actions"
          className="relative z-20 shrink-0"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={4}
        collisionPadding={16}
        className="z-[9999]"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
