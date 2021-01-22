/* eslint-disable max-len */
import * as React from 'react';

interface Props {
  width: number;
  height: number;
  viewBox: string;
}

export const Logo = ({ width, height, viewBox }: Props) => (
  <svg viewBox={viewBox} width={`${width}`} height={`${height}`}>
    {height > 16 ? (
      <g clipPath="url(#_clipPath_MXCI7ZQWY2m6z5AxbxtPlSmpJRlHoXHx)" fillOpacity="0.2">
        <path d=" M 55.863 22.98 L 55.908 23.025 L 63.375 30.491 C 64.193 31.309 64.208 32.626 63.42 33.462 L 63.375 33.508 L 55.908 40.975 L 55.863 41.02 C 55.026 41.808 53.709 41.793 52.892 40.975 C 52.074 40.157 52.059 38.84 52.847 38.004 L 52.892 37.958 L 58.849 32 L 52.892 26.042 C 52.058 25.209 52.058 23.858 52.892 23.025 C 53.709 22.207 55.026 22.192 55.863 22.98 Z  M 8.137 22.98 C 8.974 22.192 10.291 22.207 11.108 23.025 C 11.926 23.843 11.941 25.16 11.153 25.996 L 11.108 26.042 L 5.151 32 L 11.108 37.958 C 11.942 38.791 11.942 40.142 11.108 40.975 C 10.291 41.793 8.974 41.808 8.137 41.02 L 8.092 40.975 L 0.625 33.508 C -0.208 32.675 -0.208 31.324 0.625 30.491 L 8.092 23.025 L 8.137 22.98 Z " fillRule="evenodd" fill="rgb(0,112,255)" />
        <path d=" M 23.025 37.958 C 23.843 37.14 25.16 37.125 25.996 37.913 L 26.042 37.958 L 40.975 52.891 C 41.793 53.709 41.808 55.026 41.02 55.862 L 40.975 55.908 L 33.508 63.375 C 33.115 63.769 32.605 63.976 32.089 63.998 L 32.03 64 L 31.97 64 C 31.458 63.992 30.947 63.802 30.546 63.427 L 30.492 63.375 L 23.025 55.908 L 22.98 55.862 C 22.192 55.026 22.207 53.709 23.025 52.891 C 23.843 52.073 25.16 52.058 25.996 52.847 L 26.042 52.891 L 32 58.849 L 36.449 54.4 L 23.025 40.975 L 22.98 40.929 C 22.192 40.093 22.207 38.776 23.025 37.958 Z  M 23.025 23.025 C 23.843 22.207 25.16 22.192 25.996 22.98 L 26.042 23.025 L 40.975 37.958 L 41.02 38.004 C 41.808 38.84 41.793 40.157 40.975 40.975 C 40.157 41.793 38.84 41.808 38.004 41.02 L 37.958 40.975 L 23.025 26.042 L 22.98 25.996 C 22.192 25.16 22.207 23.843 23.025 23.025 Z  M 32.03 0 C 32.542 0.007 33.053 0.198 33.454 0.572 L 33.508 0.625 L 40.975 8.091 L 41.02 8.137 C 41.808 8.973 41.793 10.29 40.975 11.108 C 40.157 11.926 38.84 11.941 38.004 11.153 L 37.958 11.108 L 32 5.15 L 27.551 9.6 L 40.975 23.025 L 41.02 23.071 C 41.808 23.907 41.793 25.224 40.975 26.042 C 40.157 26.86 38.84 26.874 38.004 26.086 L 37.958 26.042 L 23.025 11.108 L 22.98 11.062 C 22.207 10.242 22.207 8.958 22.98 8.137 L 23.025 8.091 L 30.492 0.625 C 30.9 0.216 31.434 0.007 31.97 0 L 32.03 0 L 32.03 0 Z " fill="rgb(27,25,27)" />
      </g>
    )
      : (
        <g id="logo" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <path d="M13.9656361,5.74500393 L13.9771236,5.75615808 L15.8437903,7.62282474 C16.048283,7.82731746 16.0520011,8.15655557 15.8549444,8.36558449 L15.8437903,8.37707198 L13.9771236,10.2437386 L13.9656361,10.2548928 C13.7566072,10.4519494 13.4273691,10.4482314 13.2228764,10.2437386 C13.0183837,10.0392459 13.0146656,9.71000782 13.2117222,9.5009789 L13.2228764,9.48949141 L14.7123733,7.99994836 L13.2228764,6.51040531 C13.0145968,6.30212569 13.0145968,5.9644377 13.2228764,5.75615808 C13.4273691,5.55166536 13.7566072,5.54794731 13.9656361,5.74500393 Z" id="Path" fill="#0070FF" fillRule="nonzero" />
          <path d="M2.03436387,5.74500393 C2.24339279,5.54794731 2.5726309,5.55166536 2.77712362,5.75615808 C2.98161634,5.9606508 2.98533439,6.2898889 2.78827776,6.49891782 L2.77712362,6.51040531 L1.28762667,7.99994836 L2.77712362,9.48949141 C2.98540324,9.69777103 2.98540324,10.035459 2.77712362,10.2437386 C2.5726309,10.4482314 2.24339279,10.4519494 2.03436387,10.2548928 L2.02287638,10.2437386 L0.156209717,8.37707198 C-0.0520699056,8.16879235 -0.0520699056,7.83110437 0.156209717,7.62282474 L2.02287638,5.75615808 L2.03436387,5.74500393 Z" id="Path" fill="#0070FF" fillRule="nonzero" />
          <path d="M5.75620972,9.48949141 C5.96070244,9.28499869 6.28994054,9.28128064 6.49896946,9.47833726 L6.51045695,9.48949141 L10.2437903,13.2228247 C10.448283,13.4273175 10.4520011,13.7565556 10.2549444,13.9655845 L10.2437903,13.977072 L8.37712362,15.8437386 C8.27866416,15.9421981 8.15128567,15.9941131 8.02232979,15.9994836 L8.00744482,15.9998967 L7.99255518,15.9998967 C7.86438153,15.9981185 7.73672666,15.9504164 7.63638721,15.8567905 L7.62287638,15.8437386 L5.75620972,13.977072 L5.74505557,13.9655845 C5.54799895,13.7565556 5.551717,13.4273175 5.75620972,13.2228247 C5.96070244,13.018332 6.28994054,13.014614 6.49896946,13.2116706 L6.51045695,13.2228247 L8,14.71232 L9.11237333,13.5999467 L5.75620972,10.2437386 L5.74505557,10.2322512 C5.54799895,10.0232222 5.551717,9.69398413 5.75620972,9.48949141 Z M5.75620972,5.75615808 C5.96070244,5.55166536 6.28994054,5.54794731 6.49896946,5.74500393 L6.51045695,5.75615808 L10.2437903,9.48949141 L10.2549444,9.5009789 C10.4520011,9.71000782 10.448283,10.0392459 10.2437903,10.2437386 C10.0392976,10.4482314 9.71005946,10.4519494 9.50103054,10.2548928 L9.48954305,10.2437386 L5.75620972,6.51040531 L5.74505557,6.49891782 C5.54799895,6.2898889 5.551717,5.9606508 5.75620972,5.75615808 Z M8.00744482,0 C8.13561847,0.00177819757 8.26327334,0.0494802801 8.36361279,0.143106248 L8.37712362,0.156158077 L10.2437903,2.02282474 L10.2549444,2.03431223 C10.4520011,2.24334115 10.448283,2.57257926 10.2437903,2.77707198 C10.0392976,2.9815647 9.71005946,2.98528275 9.50103054,2.78822613 L9.48954305,2.77707198 L8,1.28757333 L6.88762667,2.39994667 L10.2437903,5.75615808 L10.2549444,5.76764557 C10.4520011,5.97667448 10.448283,6.30591259 10.2437903,6.51040531 C10.0392976,6.71489803 9.71005946,6.71861608 9.50103054,6.52155946 L9.48954305,6.51040531 L5.75620972,2.77707198 L5.74505557,2.76558449 C5.55164814,2.56042648 5.55164814,2.23947024 5.74505557,2.03431223 L5.75620972,2.02282474 L7.62287638,0.156158077 C7.72512274,0.0539117171 7.85855545,0.00185902473 7.99255518,0 L8.00744482,0 Z" id="Shape" fill="#1B191B" fillRule="nonzero" />
        </g>
      )}
  </svg>
);
