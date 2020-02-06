import React, { FC, useEffect, useRef } from '../../lib/teact/teact';

import './ProgressSpinner.scss';

const ProgressSpinner: FC<{
  radius?: number;
  progress?: number;
  smaller?: boolean;
  onClick?: () => void;
}> = ({
  radius = 28,
  progress = 0,
  smaller,
  onClick,
}) => {
  const strokeWidth = 2;
  const circleRadius = radius - strokeWidth * 2;
  const borderRadius = radius - 1;
  const circumference = circleRadius * 2 * Math.PI;
  const container = useRef<HTMLDivElement>();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  useEffect(() => {
    if (!container.current) {
      return;
    }

    const svg = container.current.firstElementChild;
    const strokeDashOffset = circumference - Math.min(Math.max(0.05, progress), 0.95) * circumference;

    if (svg === null) {
      container.current.innerHTML = `<svg
        viewBox="0 0 ${borderRadius * 2} ${borderRadius * 2}"
        height="${borderRadius * 2}"
        width="${borderRadius * 2}"
      >
        <circle
          stroke="white"
          fill="transparent"
          stroke-width=${strokeWidth}
          stroke-dasharray="${circumference} ${circumference}"}
          stroke-dashoffset="${strokeDashOffset}"
          r=${circleRadius}
          cx=${borderRadius}
          cy=${borderRadius}
        />
      </svg>`;
    } else {
      (svg.firstElementChild as SVGElement).setAttribute('stroke-dashoffset', strokeDashOffset.toString());
    }
  }, [container, circumference, borderRadius, circleRadius, progress]);

  return (
    <div
      ref={container}
      className={`ProgressSpinner not-implemented ${smaller ? 'smaller' : ''}`}
      // @ts-ignore teact feature
      style={`width: ${borderRadius * 2}px; height: ${borderRadius * 2}px`}
      onClick={handleClick}
    />
  );
};

export default ProgressSpinner;
