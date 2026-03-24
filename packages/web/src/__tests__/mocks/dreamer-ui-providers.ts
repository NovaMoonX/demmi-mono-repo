import React from 'react';

export function ToastProvider({ children }: React.PropsWithChildren) {
  return React.createElement(React.Fragment, null, children);
}

export function ActionModalProvider({ children }: React.PropsWithChildren) {
  return React.createElement(React.Fragment, null, children);
}

export function DreamerUIProvider({ children }: React.PropsWithChildren) {
  return React.createElement(React.Fragment, null, children);
}
