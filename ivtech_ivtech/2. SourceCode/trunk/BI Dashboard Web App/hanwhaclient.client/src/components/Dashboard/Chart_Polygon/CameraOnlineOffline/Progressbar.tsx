import { useEffect, useRef } from "react";
import { ProgressBarProps } from "../../../../interfaces/IChart";
import * as d3 from "d3";
import { theme } from "antd";
import { useThemeContext } from "../../../../context/ThemeContext";

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  percentage,
  count,
  total,
  color,
  Pwidth,
  Pheight,
}) => {
  const ref = useRef<SVGSVGElement | null>(null);
    const { theme } = useThemeContext();
  

  useEffect(() => {
    if (!ref.current || !Pwidth || !Pheight) return;

    const width = 142;
    const height = 18;
    const radius = 3; // Dynamic rounded corners
    const safePercentage = isNaN(Number(percentage)) ? 0 : Number(percentage);
    const filledWidth = (safePercentage / 100) * width;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const gradientId = `gradient-${label.replace(/\s+/g, "")}`;
    const patternId = `pattern-${label.replace(/\s+/g, "")}`;

    const defs = svg.append("defs");

    // Gradient
    const gradient = defs
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", color);

    gradient.append("stop").attr("offset", "100%").attr("stop-color", "white");

    // Pattern
    const pattern = defs
      .append("pattern")
      .attr("id", patternId)
      .attr("width", 6)
      .attr("height", 6)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("patternTransform", "rotate(80)");

    pattern
      .append("rect")
      .attr("width", 6)
      .attr("height", 6)
      .attr("fill", theme === 'light' ? 'white' : '#1D1E21');

    pattern
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 6)
      .attr("y2", 6)
      .attr("stroke",  theme === 'light' ? '#5E5E5E' : '#E8E8E8')
      .attr("stroke-width", 0.5);

    // Background
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("rx", radius)
      .attr("ry", radius)
      .attr("fill", `url(#${patternId})`);


    // Filled progress
    svg
      .append("rect")
      .attr("width", filledWidth ?? 0)
      .attr("height", height)
      .attr("rx", radius)
      .attr("ry", radius)
      .attr("fill", `url(#${gradientId})`);
    svg
      .append("rect")
      .attr("width", filledWidth)
      .attr("height", height)
      .attr("rx", radius)
      .attr("ry", radius)
      .attr("fill", "none")
      .attr("stroke", "#DFDFDF") 
      .attr("stroke-width", 1.5); // Or 2 for more emphasis
  }, [percentage, color, label, Pwidth, Pheight,theme]);

  return (
    <div className="on-off-cameras-prog">
      <div className="on-off-cameras-prog-title">
        <p>{label}</p>
        <span>{percentage}%</span>
      </div>
      <svg ref={ref} width={parseInt(Pwidth) + 80} height={20}></svg>
      <div className="on-off-cameras-prog-count">
        <p>
          {count}/<span>{total}</span> Cameras
        </p>
      </div>
    </div>
  );
};

export { ProgressBar };
