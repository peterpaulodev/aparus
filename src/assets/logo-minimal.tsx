import { LogoProps } from './logo-props';

export const LogoMinimal = ({
  width = 500,
  height = 500,
  color = "#000000",
  lineColor = "#ffffff",
}: LogoProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={width}
    zoomAndPan="magnify"
    viewBox="0 0 375 374.999991"
    height={height}
    preserveAspectRatio="xMidYMid meet"
    version="1.0"
  >
    <defs>
      <g />
      <clipPath id="9fdfe3323d">
        <rect x="0" width="205" y="0" height="299" />
      </clipPath>
    </defs>
    <g transform="matrix(1, 0, 0, 1, 85, 56)">
      <g clip-path="url(#9fdfe3323d)">
        <g fill={color} fill-opacity="1">
          <g transform="translate(9.057528, 213.399322)">
            <g>
              <path d="M 114.171875 -196.640625 L 193.546875 0 L 145.40625 0 L 130.859375 -39.328125 L 56.015625 -39.328125 L 41.46875 0 L -6.671875 0 L 72.703125 -196.640625 Z M 115.609375 -78.65625 L 93.671875 -135.859375 L 93.203125 -135.859375 L 71.265625 -78.65625 Z M 115.609375 -78.65625 " />
            </g>
          </g>
        </g>
      </g>
    </g>
    <path
      stroke-linecap="butt"
      transform="matrix(0.708789, -0.245191, 0.245191, 0.708789, 40.787455, 229.614945)"
      fill="none"
      stroke-linejoin="miter"
      d="M 0.00205426 14.498236 L 403.947851 14.499608 "
      stroke={lineColor}
      stroke-width="29"
      stroke-opacity="1"
      stroke-miterlimit="4"
    />
  </svg>
);
