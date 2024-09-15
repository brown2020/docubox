import React from "react";

interface IProps {
  size: string;
}
const Spinner = ({ size }: IProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="50"
        cy="50"
        r="40"
        stroke="#e0e0e0"
        strokeWidth="8"
        fill="none"
      />
      <circle
        cx="50"
        cy="50"
        r="40"
        stroke="#3498db"
        strokeWidth="8"
        fill="none"
        strokeDasharray="251.2"
        strokeDashoffset="62.8"
        transform="rotate(-90 50 50)">
        <animate
          attributeName="stroke-dashoffset"
          from="251.2"
          to="0"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

export default Spinner;
