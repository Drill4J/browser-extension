import * as React from 'react';

interface Props {
  width: number;
  height: number;
  viewBox: string;
  rotate: number;
  onClick: () => void;

}

export const ExtensionPosition = ({
  width, height, viewBox, onClick, rotate,
}: Props) => (
  <svg
    viewBox={viewBox}
    width={`${width}`}
    height={`${height}`}
    transform={`rotate(${rotate})`}
    onClick={onClick}
  >
    <g>
      <path
        d="M15 4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h14zm0 1H1v6h14V5zm-1 4v1H2V9h12z"
        fill="#1B191B"
        fillRule="nonzero"
      />
    </g>
  </svg>
);
