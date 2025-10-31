import React from "react";

interface WantedClassListItemProps {
  id: BigInteger;
  className: string;
  type: string;
  location: string;
  onClick?: () => void;
}

export default function WantedClassListItem({
  id,
  className,
  type,
  location,
  onClick,
}: WantedClassListItemProps) {
  return (
    <div></div>
  );
}