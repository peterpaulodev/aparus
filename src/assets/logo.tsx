import { LogoProps } from "./logo-props";

export const Logo = ({
  width = 500,
  height = 500,
  color = "#eab308",
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
      <clipPath id="ecf0a1b86c">
        <rect x="0" width="243" y="0" height="338" />
      </clipPath>
    </defs>
    <rect
      x="-37.5"
      width="450"
      fill="#ffffff"
      y="-37.499999"
      height="449.999989"
      fill-opacity="1"
    />
    <rect
      x="-37.5"
      width="450"
      fill="#000000"
      y="-37.499999"
      height="449.999989"
      fill-opacity="1"
    />
    <g transform="matrix(1, 0, 0, 1, 66, 37)">
      <g clip-path="url(#ecf0a1b86c)">
        <g fill="#eab308" fill-opacity="1">
          <g transform="translate(9.668898, 256.645513)">
            <g>
              <path d="M 136.640625 -235.34375 L 231.640625 0 L 174.015625 0 L 156.609375 -47.0625 L 67.03125 -47.0625 L 49.640625 0 L -7.984375 0 L 87 -235.34375 Z M 138.359375 -94.140625 L 112.109375 -162.59375 L 111.53125 -162.59375 L 85.296875 -94.140625 Z M 138.359375 -94.140625 " />
            </g>
          </g>
        </g>
      </g>
    </g>
    <path
      stroke-linecap="butt"
      transform="matrix(0.708789, -0.245191, 0.245191, 0.708789, 11.997079, 244.904324)"
      fill="none"
      stroke-linejoin="miter"
      d="M -0.00133162 16.998686 L 483.459408 17.000436 "
      stroke="#000000"
      stroke-width="34"
      stroke-opacity="1"
      stroke-miterlimit="4"
    />
  </svg>
);
