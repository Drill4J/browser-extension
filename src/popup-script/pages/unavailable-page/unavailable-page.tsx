/* eslint-disable max-len */
import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';

import styles from './unavailable-page.module.scss';

interface Props {
  className?: string;
}

const unavailablePage = BEM(styles);

export const UnavailablePage = unavailablePage(({ className }: Props) => (
  <div className={className}>
    <Content>
      <LogoWrapper>
        <svg viewBox="0 0 64 64" width="64pt" height="64pt">
          <g clipPath="url(#_clipPath_MXCI7ZQWY2m6z5AxbxtPlSmpJRlHoXHx)">
            <path d=" M 55.863 22.98 L 55.908 23.025 L 63.375 30.491 C 64.193 31.309 64.208 32.626 63.42 33.462 L 63.375 33.508 L 55.908 40.975 L 55.863 41.02 C 55.026 41.808 53.709 41.793 52.892 40.975 C 52.074 40.157 52.059 38.84 52.847 38.004 L 52.892 37.958 L 58.849 32 L 52.892 26.042 C 52.058 25.209 52.058 23.858 52.892 23.025 C 53.709 22.207 55.026 22.192 55.863 22.98 Z  M 8.137 22.98 C 8.974 22.192 10.291 22.207 11.108 23.025 C 11.926 23.843 11.941 25.16 11.153 25.996 L 11.108 26.042 L 5.151 32 L 11.108 37.958 C 11.942 38.791 11.942 40.142 11.108 40.975 C 10.291 41.793 8.974 41.808 8.137 41.02 L 8.092 40.975 L 0.625 33.508 C -0.208 32.675 -0.208 31.324 0.625 30.491 L 8.092 23.025 L 8.137 22.98 Z " fillRule="evenodd" fill="rgb(0,112,255)" />
            <path d=" M 23.025 37.958 C 23.843 37.14 25.16 37.125 25.996 37.913 L 26.042 37.958 L 40.975 52.891 C 41.793 53.709 41.808 55.026 41.02 55.862 L 40.975 55.908 L 33.508 63.375 C 33.115 63.769 32.605 63.976 32.089 63.998 L 32.03 64 L 31.97 64 C 31.458 63.992 30.947 63.802 30.546 63.427 L 30.492 63.375 L 23.025 55.908 L 22.98 55.862 C 22.192 55.026 22.207 53.709 23.025 52.891 C 23.843 52.073 25.16 52.058 25.996 52.847 L 26.042 52.891 L 32 58.849 L 36.449 54.4 L 23.025 40.975 L 22.98 40.929 C 22.192 40.093 22.207 38.776 23.025 37.958 Z  M 23.025 23.025 C 23.843 22.207 25.16 22.192 25.996 22.98 L 26.042 23.025 L 40.975 37.958 L 41.02 38.004 C 41.808 38.84 41.793 40.157 40.975 40.975 C 40.157 41.793 38.84 41.808 38.004 41.02 L 37.958 40.975 L 23.025 26.042 L 22.98 25.996 C 22.192 25.16 22.207 23.843 23.025 23.025 Z  M 32.03 0 C 32.542 0.007 33.053 0.198 33.454 0.572 L 33.508 0.625 L 40.975 8.091 L 41.02 8.137 C 41.808 8.973 41.793 10.29 40.975 11.108 C 40.157 11.926 38.84 11.941 38.004 11.153 L 37.958 11.108 L 32 5.15 L 27.551 9.6 L 40.975 23.025 L 41.02 23.071 C 41.808 23.907 41.793 25.224 40.975 26.042 C 40.157 26.86 38.84 26.874 38.004 26.086 L 37.958 26.042 L 23.025 11.108 L 22.98 11.062 C 22.207 10.242 22.207 8.958 22.98 8.137 L 23.025 8.091 L 30.492 0.625 C 30.9 0.216 31.434 0.007 31.97 0 L 32.03 0 L 32.03 0 Z " fill="rgb(27,25,27)" />
          </g>
        </svg>
      </LogoWrapper>
      <Title>Drill4J not found</Title>
      <Instructions>If an agent is installed on this site, try refreshing the page.</Instructions>
    </Content>
  </div>
));

const Content = unavailablePage.content('div');
const Title = unavailablePage.title('div');
const Instructions = unavailablePage.instructions('div');
const LogoWrapper = unavailablePage.logoWrapper('div');
