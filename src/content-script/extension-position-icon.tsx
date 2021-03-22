import * as React from 'react';

interface Props {
  width: number;
  height: number;
  viewBox: string;
  rotate: number;
  onClick: () => void;

}

export const ExtensionPositionIcon = ({ rotate, ...restProps }: Props) => (
  <svg
    transform={`rotate(${rotate})`}
    {...restProps}
  >
    <g xmlns="http://www.w3.org/2000/svg" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <path fill="#FFF" d="M-1422-175H110v903h-1532z" />
      <path fill="#F8F9FB" d="M-1376-10H64v36h-1440z" />
      <path
        d="M15 4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h14zm0 1H1v6h14V5zm-1 4v1H2V9h12z"
        fill="#1B191B"
        fillRule="nonzero"
      />
    </g>
  </svg>
);
