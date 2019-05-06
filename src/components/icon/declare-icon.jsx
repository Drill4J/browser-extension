/* eslint-disable react/prop-types */
import React from 'react';
import { GenericIcon } from './generic-icon';

export function declareIcon(path, settings = {}) {
  const { defaultWidth = 16, defaultHeight = 16, fillRule = 'evenodd', viewBox } = settings;
  return ({ width = defaultWidth, height = defaultHeight, ...rest }) => (
    <GenericIcon
      path={path}
      width={width}
      height={height}
      viewBox={viewBox || `0 0 ${defaultWidth} ${defaultHeight}`}
      fillRule={fillRule}
      {...rest}
    />
  );
}
