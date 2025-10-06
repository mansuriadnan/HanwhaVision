import React, { useState, useRef, useEffect } from "react";

interface Point {
  x: number;
  y: number;
}

interface RectanglePolygonProps {
  initialPoints?: Point[];
  imageWidth: number;
  imageHeight: number;
  onSelectionChange?: (points: Point[]) => void;
  SelectedColor: string;
  isdragZone: boolean;
  zoom: number;
}

const RectanglePolygon: React.FC<RectanglePolygonProps> = ({
  initialPoints,
  imageWidth,
  imageHeight,
  onSelectionChange,
  SelectedColor,
  isdragZone,
  zoom,
}) => {
  const defaultPoints = [
    { x: 100, y: 100 },
    { x: 100, y: 200 },
    { x: 200, y: 200 },
    { x: 200, y: 100 },
  ];

  // const [points, setPoints] = useState<Point[]>(initialPoints || defaultPoints);
  const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(
    null
  );
  const [isDraggingPolygon, setIsDraggingPolygon] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  // Add state for tracking hovered point position on line
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
  // Add state to track if mouse is over a vertex
  const [hoveredVertex, setHoveredVertex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [points, setPoints] = useState<Point[]>(() => {
    // Only use initialPoints on first render
    return initialPoints || defaultPoints;
  });

  // Then modify your useEffect to prevent the cycle:
  useEffect(() => {
    // Only notify parent when points change due to internal state changes,
    // not from prop changes
    if (onSelectionChange && points) {
      onSelectionChange(points);
    }
  }, [points, onSelectionChange]);

  // Handle a click on a polygon edge to create a new point
  // const handleEdgeClick = (e: React.MouseEvent, edgeIndex: number) => {
  //   e.stopPropagation();
  //   e.preventDefault();

  //   const rect = containerRef.current?.getBoundingClientRect();
  //   if (!rect) return;

  //   // Use the hoverPoint if available, otherwise use the mouse position
  //   let x, y;
  //   if (hoverPoint) {
  //     x = hoverPoint.x;
  //     y = hoverPoint.y;
  //   } else {
  //     x = e.clientX - rect.left;
  //     y = e.clientY - rect.top;
  //     x = Math.max(0, Math.min(imageWidth, x));
  //     y = Math.max(0, Math.min(imageHeight, y));
  //   }

  //   // Create a new point at this position
  //   const newPoints = [...points];
  //   const insertAt = edgeIndex + 1;
  //   newPoints.splice(insertAt, 0, { x, y });

  //   setPoints(newPoints);
  //   setDraggedPointIndex(insertAt);
  // };

  const handleEdgeClick = (e: React.MouseEvent, edgeIndex: number) => {
    e.stopPropagation();
    e.preventDefault();

    const { x, y } = hoverPoint || getMousePosition(e);

    const newPoints = [...points];
    const insertAt = edgeIndex + 1;
    newPoints.splice(insertAt, 0, { x, y });

    setPoints(newPoints);
    setDraggedPointIndex(insertAt);
  };

  // Handle a click on a vertex point
  const handlePointClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggedPointIndex(index);
  };

  // Handle a click on the polygon shape (for moving the entire polygon)
  // const handlePolygonClick = (e: React.MouseEvent) => {
  //   e.preventDefault();

  //   const rect = containerRef.current?.getBoundingClientRect();
  //   if (!rect) return;

  //   const x = e.clientX - rect.left;
  //   const y = e.clientY - rect.top;

  //   if (isPointInPolygon(x, y, points)) {
  //     setIsDraggingPolygon(true);
  //     setDragStart({ x: e.clientX, y: e.clientY });
  //   }
  // };

  // Utility: normalize mouse to image coords
  // const getMousePosition = (e: React.MouseEvent) => {
  //   const rect = containerRef.current?.getBoundingClientRect();
  //   if (!rect) return { x: 0, y: 0 };

  //   // raw mouse coords inside container
  //   let x = (e.clientX - rect.left) / zoom;
  //   let y = (e.clientY - rect.top) / zoom;

  //   // clamp properly inside image bounds
  //   x = Math.max(0, Math.min(imageWidth, x));
  //   y = Math.max(0, Math.min(imageHeight, y));

  //   return { x, y };
  // };

  const getMousePosition = (e: React.MouseEvent) => {
    const svg = containerRef.current as SVGSVGElement | null;
    if (!svg) return { x: 0, y: 0 };

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };

    const transformed = pt.matrixTransform(ctm.inverse());

    let x = transformed.x / zoom;
    let y = transformed.y / zoom;

    // clamp to image size
    x = Math.max(0, Math.min(imageWidth, x));
    y = Math.max(0, Math.min(imageHeight, y));

    return { x, y };
  };

  const handlePolygonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const { x, y } = getMousePosition(e);

    if (isPointInPolygon(x, y, points)) {
      setIsDraggingPolygon(true);
      setDragStart({ x, y }); // ✅ store in image-space, not client-space
    }
  };

  // Handle mouse enter on a vertex point
  const handlePointMouseEnter = (index: number) => {
    setHoveredVertex(index);
  };

  // Handle mouse leave on a vertex point
  const handlePointMouseLeave = () => {
    setHoveredVertex(null);
  };

  // Find the closest point on a line segment
  const findClosestPointOnLine = (
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): Point => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    return { x: xx, y: yy };
  };

  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const { x, y } = getMousePosition(e);

    // const x = Math.max(0, Math.min(imageWidth, e.clientX - rect.left));
    // const y = Math.max(0, Math.min(imageHeight, e.clientY - rect.top));

    // const x = Math.max(0, Math.min(imageWidth, (e.clientX - rect.left) / zoom));
    // const y = Math.max(0, Math.min(imageHeight, (e.clientY - rect.top) / zoom));

    // If dragging a point, update its position
    if (draggedPointIndex !== null) {
      const newPoints = [...points];
      // newPoints[draggedPointIndex] = { x, y };
      newPoints[draggedPointIndex] = {
        x: Math.max(0, Math.min(imageWidth, x)),
        y: Math.max(0, Math.min(imageHeight, y)),
      };
      setPoints(newPoints);
      return;
    }

    // If dragging the polygon, move all points
    // if (isDraggingPolygon && dragStart) {
    //   const dx = e.clientX - dragStart.x;
    //   const dy = e.clientY - dragStart.y;

    //   const newPoints = points.map((point) => ({
    //     x: Math.max(0, Math.min(imageWidth, point.x + dx)),
    //     y: Math.max(0, Math.min(imageHeight, point.y + dy)),
    //   }));

    //   setPoints(newPoints);
    //   setDragStart({ x: e.clientX, y: e.clientY });
    //   return;
    // }

    // Drag polygon
    if (isDraggingPolygon && dragStart) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      const newPoints = points.map((p) => ({
        x: Math.max(0, Math.min(imageWidth, p.x + dx)),
        y: Math.max(0, Math.min(imageHeight, p.y + dy)),
      }));

      setPoints(newPoints);
      setDragStart({ x, y });
      return;
    }

    // Check if we're hovering over a vertex first
    const vertexThreshold = 10;
    let isOverVertex = false;

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const distance = Math.sqrt(
        Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
      );

      if (distance < vertexThreshold) {
        isOverVertex = true;
        break;
      }
    }

    // If we're over a vertex, don't show the hover point on the line
    if (isOverVertex) {
      setHoveredSegment(null);
      setHoverPoint(null);
      return;
    }

    // If not over a vertex and not dragging, detect which segment (edge) the mouse is over
    const threshold = 10;
    let closestEdge = null;
    let minDistance = threshold;
    let closestPoint = null;

    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];

      const distance = pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);

      if (distance < minDistance) {
        minDistance = distance;
        closestEdge = i;

        // Calculate the actual closest point on the line segment
        closestPoint = findClosestPointOnLine(x, y, p1.x, p1.y, p2.x, p2.y);
      }
    }

    setHoveredSegment(closestEdge);
    setHoverPoint(closestPoint);
  };

  // Handle mouse up - reset dragging states
  const handleMouseUp = () => {
    setDraggedPointIndex(null);
    setIsDraggingPolygon(false);
    setDragStart(null);
  };

  // Check if point is inside polygon
  const isPointInPolygon = (
    x: number,
    y: number,
    polyPoints: Point[]
  ): boolean => {
    let inside = false;
    for (let i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
      const xi = polyPoints[i].x;
      const yi = polyPoints[i].y;
      const xj = polyPoints[j].x;
      const yj = polyPoints[j].y;

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Calculate distance from point to line segment
  const pointToLineDistance = (
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;

    return Math.sqrt(dx * dx + dy * dy);
  };

  // Get cursor style based on current interaction
  const getCursorStyle = () => {
    if (draggedPointIndex !== null) return "grabbing";
    if (isDraggingPolygon) return "grabbing";
    if (hoveredSegment !== null || hoveredVertex !== null) return "crosshair";
    return "move";
  };

  // Function to check if a vertex point should be visible
  const isVertexVisible = (index: number) => {
    return draggedPointIndex === index || hoveredVertex === index;
  };

  return (
    <div
      // ref={containerRef}
      // style={{
      //   position: "relative",
      //   width: "100%",
      //   height: "100%",
      //   // position:"absolute",
      //   // width:imageWidth,
      //   // height:imageHeight,

      //   cursor: getCursorStyle(),
      //   overflow: "hidden",
      //   border:"1px solid gray"
      // }}
      style={{ cursor: isdragZone ? "move" : "default" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={containerRef}
        width={imageWidth}
        height={imageHeight}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Base polygon with fill - if fill="none" then not able to drag polygon*/}
        <polygon
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="rgba(0, 0, 0, 0)"
          // fill="rgba(0, 0, 255, 0.2)"
          stroke="none"
          onMouseDown={isdragZone ? handlePolygonClick : undefined}
        />

        {/* Separate line segments for better edge interaction */}
        {points.map((point, index) => {
          const nextIndex = (index + 1) % points.length;
          const nextPoint = points[nextIndex];

          return (
            <line
              key={`edge-${index}`}
              x1={point.x}
              y1={point.y}
              x2={nextPoint.x}
              y2={nextPoint.y}
              stroke={SelectedColor}
              strokeWidth={5}
              // stroke={
              //   hoveredSegment === index ? "rgba(0, 0, 255, 0.8)" : "blue"
              // }
              // strokeWidth={hoveredSegment === index ? 3 : 2}
              style={{ cursor: isdragZone ? "crosshair" : "default" }}
              onMouseDown={(e) =>
                isdragZone ? handleEdgeClick(e, index) : null
              }
            />
          );
        })}

        {/* Invisible larger hit area for each vertex */}
        {points.map((point, index) => (
          <circle
            key={`hit-area-${index}`}
            cx={point.x}
            cy={point.y}
            r={10}
            fill="transparent"
            onMouseEnter={() => handlePointMouseEnter(index)}
            onMouseLeave={handlePointMouseLeave}
            onMouseDown={(e) =>
              isdragZone ? handlePointClick(e, index) : null
            }
            style={{ cursor: isdragZone ? "pointer" : "default" }}
          />
        ))}

        {/* Visible points at each vertex - only visible when being dragged or hovered */}
        {points.map((point, index) => (
          <circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r={5}
            fill="white"
            stroke={SelectedColor}
            // stroke="blue"
            strokeWidth={1}
            style={{
              cursor: isdragZone ? "pointer" : "default",
              opacity: isVertexVisible(index) ? 1 : 0,
              transition: "opacity 0.15s ease",
            }}
            pointerEvents="none"
          />
        ))}

        {/* Hover point on line segment */}
        {hoveredSegment !== null &&
          hoverPoint &&
          !draggedPointIndex &&
          hoveredVertex === null && (
            <circle
              cx={hoverPoint.x}
              cy={hoverPoint.y}
              r={3}
              fill="white"
              stroke={SelectedColor}
              // stroke="blue"
              strokeWidth={2}
              style={{ cursor: isdragZone ? "pointer" : "default" }}
              onMouseDown={(e) =>
                isdragZone ? handleEdgeClick(e, hoveredSegment) : null
              }
            />
          )}
      </svg>
    </div>
  );
};

export { RectanglePolygon };
