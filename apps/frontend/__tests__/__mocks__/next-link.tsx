import React from 'react';

// Mock next/link as a simple anchor
const Link = ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: any }) => (
  <a href={href} {...props}>{children}</a>
);

export default Link;
