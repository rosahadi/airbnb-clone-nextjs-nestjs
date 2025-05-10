"use client";

import React from "react";

interface MainContentProps {
  children: React.ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({
  children,
}) => {
  return <main className="pt-20 pb-12">{children}</main>;
};
