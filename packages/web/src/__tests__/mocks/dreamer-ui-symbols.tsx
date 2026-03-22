import React from 'react';

function createIcon(name: string) {
  return function Icon(props: Record<string, unknown>) {
    return React.createElement('span', { 'data-testid': `icon-${name.toLowerCase()}`, ...props });
  };
}

export const DotsVertical = createIcon('DotsVertical');
export const Plus = createIcon('Plus');
export const Trash = createIcon('Trash');
export const ChevronRight = createIcon('ChevronRight');
export const ChevronLeft = createIcon('ChevronLeft');
export const ChevronDown = createIcon('ChevronDown');
export const Search = createIcon('Search');
export const X = createIcon('X');
export const Check = createIcon('Check');
export const InfoCircled = createIcon('InfoCircled');
