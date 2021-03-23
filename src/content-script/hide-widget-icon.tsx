import * as React from 'react';

interface Props {
  width: number;
  height: number;
  viewBox: string;
  onClick: () => void;

}

export const HideWidgetIcon = (props: Props) => (
  <svg {...props}>
    <g xmlns="http://www.w3.org/2000/svg" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <path fill="#FFF" d="M-1453-357H79V894h-1532z" />
      <path fill="#F8F9FB" d="M-1408-10H32v36h-1440z" />
      <path d="M0 0h16v16H0z" />
      <path d="M12.5 7.5a.5.5 0 0 1 .09.992l-.09.008h-9a.5.5 0 0 1-.09-.992L3.5 7.5h9z" fill="#1B191B" fillRule="nonzero" />
    </g>
  </svg>
);
