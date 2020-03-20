import React, { FC, useEffect, useRef } from '../../lib/teact/teact';

import './ProgressSpinner.scss';
import buildClassName from '../../util/buildClassName';

const RADIUS = 28;
const RADIUS_SMALL = 22;
const STROKE_WIDTH = 2;
const MIN_PROGRESS = 0.05;
const MAX_PROGRESS = 0.99;

const ProgressSpinner: FC<{
  progress?: number;
  smaller?: boolean;
  transparent?: boolean;
  onClick?: () => void;
}> = ({
  progress = 0,
  smaller,
  transparent,
  onClick,
}) => {
  const radius = smaller ? RADIUS_SMALL : RADIUS;
  const circleRadius = radius - STROKE_WIDTH * 2;
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
    const strokeDashOffset = circumference - Math.min(Math.max(MIN_PROGRESS, progress), MAX_PROGRESS) * circumference;

    if (svg === null) {
      container.current.innerHTML = `<svg
        viewBox="0 0 ${borderRadius * 2} ${borderRadius * 2}"
        height="${borderRadius * 2}"
        width="${borderRadius * 2}"
      >
        <circle
          stroke="white"
          fill="transparent"
          stroke-width=${STROKE_WIDTH}
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

  const className = buildClassName(
    'ProgressSpinner not-implemented',
    smaller && 'smaller',
    transparent && 'transparent',
  );

  return (
    <div
      ref={container}
      className={className}
      onClick={handleClick}
    />
  );
};

export default ProgressSpinner;
