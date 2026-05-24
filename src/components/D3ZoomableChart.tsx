import { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { RotateCcw, ZoomIn, ZoomOut, SlidersHorizontal, Info, Award, Calendar, Weight, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkoutEntry } from '../types';

interface D3ZoomableChartProps {
  muscleName: string;
  entries: WorkoutEntry[];
  onClose?: () => void;
}

interface ChartDataPoint {
  id: string;
  date: Date;
  dateStr: string;
  weight: number;
  reps: number;
  sets: number;
  exercise: string;
  isPR?: boolean;
}

export default function D3ZoomableChart({ muscleName, entries, onClose }: D3ZoomableChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Track zoom transform state to display to user zoom level
  const [zoomScale, setZoomScale] = useState(1);
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  
  // Clean, prepare and sort the data chronologically
  const chartData = useMemo<ChartDataPoint[]>(() => {
    return [...entries]
      .filter(e => e.weight > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((e, idx) => ({
        id: `${e.date}-${idx}`,
        date: new Date(e.date),
        dateStr: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        weight: e.weight,
        reps: e.reps || 0,
        sets: e.sets || 0,
        exercise: e.exerciseName || 'Strength Exercise',
        isPR: e.isPR,
      }));
  }, [entries]);

  // Handle panel/container resizing dynamically matching desktop/tablet/mobile fluidity
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((observedEntries) => {
      if (!observedEntries || observedEntries.length === 0) return;
      const { width, height } = observedEntries[0].contentRect;
      // Subtract margins/headers for internal dimensions if necessary
      setDimensions({ width, height: Math.max(height, 280) });
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Primary D3 rendering & Zoom attachment useEffect
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || chartData.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Dynamic clean render to prevent residual node stack leaks

    const margin = { top: 25, right: 30, bottom: 45, left: 45 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Define clip path to bound the path and grid to container during extreme zooms
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'chart-clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    // Primary Container group Offset by Margins
    const chartGroup = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // X scale (Chronological Time Scale) & Y scale (Strength Weight Progress)
    const xExtent = d3.extent(chartData, d => d.date) as [Date, Date];
    // Pad date ranges slightly so the first and last points don't clip against card borders
    const xMin = d3.timeDay.offset(xExtent[0], -2);
    const xMax = d3.timeDay.offset(xExtent[1], 2);

    const xScale = d3.scaleTime()
      .domain([xMin, xMax])
      .range([0, width]);

    const yMin = d3.min(chartData, d => d.weight) || 0;
    const yMax = d3.max(chartData, d => d.weight) || 100;
    // Pad Y axis bounds slightly for comfortable visualization padding
    const yMargin = Math.max((yMax - yMin) * 0.15, 5);
    const yScale = d3.scaleLinear()
      .domain([Math.max(0, yMin - yMargin), yMax + yMargin])
      .range([height, 0]);

    // Create Base Axes Generator Elements
    const xAxisGenerator = d3.axisBottom(xScale)
      .ticks(Math.min(chartData.length, width > 600 ? 8 : 4))
      .tickFormat(d3.timeFormat('%b %d') as any)
      .tickSizeOuter(0);

    const yAxisGenerator = d3.axisLeft(yScale)
      .ticks(6)
      .tickFormat(d => `${d}kg`)
      .tickSizeOuter(0);

    // Create Gridlines within the clip frame
    const xGrid = d3.axisBottom(xScale)
      .tickSize(-height)
      .tickFormat(() => '');

    const yGrid = d3.axisLeft(yScale)
      .tickSize(-width)
      .tickFormat(() => '');

    const gridGroup = chartGroup.append('g')
      .attr('class', 'grid-lines')
      .attr('clip-path', 'url(#chart-clip)');

    const xGridSelection = gridGroup.append('g')
      .attr('class', 'x-grid text-neutral-800/25')
      .attr('transform', `translate(0, ${height})`)
      .call(xGrid);

    const yGridSelection = gridGroup.append('g')
      .attr('class', 'y-grid text-neutral-800/25')
      .call(yGrid);

    // Style and apply low opacity to grid lines
    gridGroup.selectAll('.grid-lines line')
      .style('stroke', 'rgba(255, 255, 255, 0.05)')
      .style('stroke-dasharray', '3,3');

    // Create Axises Render Elements
    const xAxisEl = chartGroup.append('g')
      .attr('class', 'x-axis text-[10px] sm:text-xs font-mono font-black text-neutral-400')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxisGenerator);

    const yAxisEl = chartGroup.append('g')
      .attr('class', 'y-axis text-[10px] sm:text-xs font-mono font-black text-neutral-400')
      .call(yAxisGenerator);

    xAxisEl.select('.domain').style('stroke', 'rgba(255, 255, 255, 0.1)');
    yAxisEl.select('.domain').style('stroke', 'rgba(255, 255, 255, 0.1)');

    // Path generators
    const lineGenerator = d3.line<ChartDataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.weight))
      .curve(d3.curveMonotoneX);

    const areaGenerator = d3.area<ChartDataPoint>()
      .x(d => xScale(d.date))
      .y1(d => yScale(d.weight))
      .y0(height)
      .curve(d3.curveMonotoneX);

    // Create linear gradient for beautiful neon glow/fade area
    const gradientId = `d3-neon-gradient-${muscleName.toLowerCase()}`;
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'var(--accent)')
      .attr('stop-opacity', 0.28);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'var(--accent)')
      .attr('stop-opacity', 0.00);

    // Draw area path under line first
    const chartPlotGroup = chartGroup.append('g')
      .attr('class', 'chart-plots')
      .attr('clip-path', 'url(#chart-clip)');

    const areaPath = chartPlotGroup.append('path')
      .datum(chartData)
      .attr('class', 'area-path')
      .attr('fill', `url(#${gradientId})`)
      .attr('d', areaGenerator);

    // Draw main connection line
    const strokeLinePath = chartPlotGroup.append('path')
      .datum(chartData)
      .attr('class', 'stroke-line-path')
      .attr('fill', 'none')
      .attr('stroke', 'var(--accent)')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('d', lineGenerator);

    // Hover helper group for dynamic pointer inspection
    const focusGroup = chartGroup.append('g')
      .attr('class', 'focus-group')
      .style('display', 'none');

    // Guidelines for precision hover tracking
    const verticalHoverLine = focusGroup.append('line')
      .attr('class', 'v-line')
      .style('stroke', 'var(--accent)')
      .style('stroke-width', '1.5px')
      .style('stroke-dasharray', '4,4')
      .style('opacity', 0.85)
      .attr('y1', 0)
      .attr('y2', height);

    const horizontalHoverLine = focusGroup.append('line')
      .attr('class', 'h-line')
      .style('stroke', 'var(--accent)')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '4,4')
      .style('opacity', 0.5)
      .attr('x1', 0)
      .attr('x2', width);

    // Custom circle halo for selected target node
    const focusCircleHalo = focusGroup.append('circle')
      .attr('r', 8)
      .attr('fill', 'var(--accent)')
      .attr('opacity', 0.25)
      .attr('class', 'animate-ping');

    const focusCircle = focusGroup.append('circle')
      .attr('r', 5)
      .attr('fill', '#fff')
      .attr('stroke', 'var(--accent)')
      .attr('stroke-width', 3);

    // Render original interactive nodes
    const dataNodes = chartPlotGroup.selectAll('.data-node')
      .data(chartData)
      .enter()
      .append('g')
      .attr('class', 'data-node')
      .attr('transform', d => `translate(${xScale(d.date)}, ${yScale(d.weight)})`);

    // Inner filled points
    dataNodes.append('circle')
      .attr('r', d => d.isPR ? 6 : 4)
      .attr('fill', d => d.isPR ? 'var(--yellow)' : 'var(--accent)')
      .attr('stroke', '#000')
      .attr('stroke-width', 1.5)
      .style('filter', d => d.isPR ? 'drop-shadow(0px 0px 4px rgba(255, 204, 0, 0.75))' : 'none');

    // Attach d3 zoom functionality
    const d3Zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10]) // Limit zooming from 1x magnification to 10x max precision
      .translateExtent([[0, 0], [dimensions.width, dimensions.height]])
      .extent([[0, 0], [dimensions.width, dimensions.height]])
      .on('zoom', (event) => {
        const transform = event.transform;
        setZoomScale(transform.k); // Update level trigger react UI

        // Rescale scales
        const rescaledX = transform.rescaleX(xScale);
        const rescaledY = transform.rescaleY(yScale);

        // Re-generate and translate grids dynamically
        xGridSelection.call(xGrid.scale(rescaledX));
        yGridSelection.call(yGrid.scale(rescaledY));

        // Re-generate axis
        xAxisEl.call(xAxisGenerator.scale(rescaledX));
        yAxisEl.call(yAxisGenerator.scale(rescaledY));

        // Style the dynamic update lines/grids nicely
        gridGroup.selectAll('.grid-lines line')
          .style('stroke', 'rgba(255, 255, 255, 0.05)')
          .style('stroke-dasharray', '3,3');

        // Apply visual updates to area & stroke connection paths
        const updatedLineGenerator = d3.line<ChartDataPoint>()
          .x(d => rescaledX(d.date))
          .y(d => rescaledY(d.weight))
          .curve(d3.curveMonotoneX);

        const updatedAreaGenerator = d3.area<ChartDataPoint>()
          .x(d => rescaledX(d.date))
          .y1(d => rescaledY(d.weight))
          .y0(height)
          .curve(d3.curveMonotoneX);

        strokeLinePath.attr('d', updatedLineGenerator);
        areaPath.attr('d', updatedAreaGenerator);

        // Reposition data nodes matching zooming offsets
        dataNodes.attr('transform', d => `translate(${rescaledX(d.date)}, ${rescaledY(d.weight)})`);
      });

    // Mount zoom hook to SVG context
    svg.call(d3Zoom);

    // Interactive mouse / touch listening overlay grid rect
    const interactiveOverlay = svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    // Pointer helper math logic to find the closest data coordinates 
    const handlePointerAction = (event: any) => {
      // Retreive zoom transform mapping or fallback to default
      const currentTransform = d3.zoomTransform(svgRef.current!);
      const currentXScale = currentTransform.rescaleX(xScale);
      const currentYScale = currentTransform.rescaleY(yScale);

      // Extract raw event coordinates
      const [mouseX] = d3.pointer(event);
      
      // Select Date according to inverse scale lookup coordinates
      const datePointerValue = currentXScale.invert(mouseX);

      // Perform standard bisection lookup to locate index
      const bisectDate = d3.bisector<ChartDataPoint, Date>(d => d.date).left;
      const index = bisectDate(chartData, datePointerValue, 1);
      
      // Compare both sides of the point index to choose the genuinely closest point
      const p0 = chartData[index - 1];
      const p1 = chartData[index];
      
      let nearestPoint = p0;
      if (p0 && p1) {
        nearestPoint = (datePointerValue.getTime() - p0.date.getTime()) > (p1.date.getTime() - datePointerValue.getTime()) 
          ? p1 
          : p0;
      } else if (p1) {
        nearestPoint = p1;
      }

      if (nearestPoint) {
        const pointX = currentXScale(nearestPoint.date);
        const pointY = currentYScale(nearestPoint.weight);

        // Show horizontal/vertical alignment coordinates
        focusGroup.style('display', null);
        verticalHoverLine.attr('x1', pointX).attr('x2', pointX);
        horizontalHoverLine.attr('y1', pointY).attr('y2', pointY);
        focusCircle.attr('cx', pointX).attr('cy', pointY);
        focusCircleHalo.attr('cx', pointX).attr('cy', pointY);

        setHoveredPoint(nearestPoint);
      }
    };

    interactiveOverlay
      .on('mouseover touchstart', () => focusGroup.style('display', null))
      .on('mousemove touchmove', handlePointerAction)
      .on('mouseout touchend', () => {
        focusGroup.style('display', 'none');
        setHoveredPoint(null);
      });

    // Expose reset trigger on global window for component control trigger compatibility
    (svgRef.current as any).resetChartZoom = () => {
      svg.transition()
        .duration(750)
        .ease(d3.easeCubicOut)
        .call(d3Zoom.transform, d3.zoomIdentity);
    };

    (svgRef.current as any).zoomInChart = () => {
      svg.transition().duration(250).call(d3Zoom.scaleBy, 1.3);
    };

    (svgRef.current as any).zoomOutChart = () => {
      svg.transition().duration(250).call(d3Zoom.scaleBy, 1 / 1.3);
    };

  }, [chartData, dimensions, muscleName]);

  const handleResetZoomCmd = () => {
    if (svgRef.current && (svgRef.current as any).resetChartZoom) {
      (svgRef.current as any).resetChartZoom();
    }
  };

  const handleZoomInCmd = () => {
    if (svgRef.current && (svgRef.current as any).zoomInChart) {
      (svgRef.current as any).zoomInChart();
    }
  };

  const handleZoomOutCmd = () => {
    if (svgRef.current && (svgRef.current as any).zoomOutChart) {
      (svgRef.current as any).zoomOutChart();
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full w-full">
      {/* Title Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-black uppercase text-white tracking-widest flex items-center gap-2">
            <span className="text-[var(--accent)]">⚡</span> {muscleName} High-Precision Inspector
          </h3>
          <p className="text-[10px] text-[var(--muted)] font-mono uppercase tracking-widest mt-0.5">
            D3 Zoomable Timeline System & bullseye tracking
          </p>
        </div>
        
        {/* Controls Row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/5 font-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
            <SlidersHorizontal size={10} className="text-neutral-500 mr-1" />
            Zoom: <span className="text-white font-black">{zoomScale.toFixed(1)}x</span>
          </div>

          <div className="flex items-center gap-1 bg-black/35 rounded-xl border border-white/5 p-1">
            <button
              onClick={handleZoomInCmd}
              title="Zoom In"
              className="p-1.5 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white active:scale-95 transition-all cursor-pointer"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={handleZoomOutCmd}
              title="Zoom Out"
              className="p-1.5 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white active:scale-95 transition-all cursor-pointer"
            >
              <ZoomOut size={14} />
            </button>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <button
              onClick={handleResetZoomCmd}
              title="Reset Zoom Scale"
              className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw size={10} />
              Reset
            </button>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 hover:border-white/15 text-white font-mono text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer leading-none"
            >
              Close x
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive SVG Wrapper Frame */}
      <div className="relative flex-1 bg-gradient-to-b from-[#09090c] to-[#040406] border border-white/[0.05] rounded-3xl p-4 sm:p-6 overflow-hidden min-h-[300px] flex flex-col justify-end">
        {/* Zoom Instructions Hint overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 rounded-xl border border-white/5 pointer-events-none text-neutral-400 text-[9px] font-mono uppercase tracking-widest">
          <Info size={11} className="text-[var(--accent)] animate-pulse" />
          <span>💡 Mousewheel or Pinch to Zoom • Drag to Pan</span>
        </div>

        {/* Dynamic target node tooltips inside the overlay viewbox */}
        <div 
          ref={containerRef} 
          className="relative w-full h-[320px] select-none flex items-center justify-center cursor-crosshair"
        >
          {chartData.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center justify-center bg-black/20 w-full h-full border border-dashed border-white/5 rounded-2xl">
              <RefreshCw size={24} className="text-neutral-500 animate-spin mb-2" />
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-black">Waiting for strength matrix</span>
            </div>
          ) : (
            <svg 
              ref={svgRef} 
              className="w-full h-full text-white overflow-visible"
              style={{ maxHeight: '100%', minHeight: '100%' }}
            />
          )}
        </div>
      </div>

      {/* Bullseye Precision Tooltip HUD Panel */}
      <div className="glass-card bg-[#0a0a0e]/95 border border-white/[0.08] rounded-2xl p-5 shadow-2xl transition-all duration-300">
        {hoveredPoint ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center animate-in fade-in duration-250">
            {/* Exercise & PR Banner */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                hoveredPoint.isPR ? "bg-[var(--yellow)]/10 text-[var(--yellow)] border border-[var(--yellow)]/20" : "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/15"
              )}>
                {hoveredPoint.isPR ? <Award size={20} className="animate-bounce" /> : <Weight size={20} />}
              </div>
              <div className="min-w-0">
                <div className="text-[8px] font-mono font-black uppercase text-neutral-400 tracking-widest leading-none mb-1">SELECTED EXERCISE</div>
                <h4 className="text-xs font-black uppercase text-white tracking-widest truncate leading-tight">
                  {hoveredPoint.exercise}
                </h4>
                {hoveredPoint.isPR && (
                  <span className="inline-block text-[8px] font-mono font-black uppercase text-[var(--yellow)] tracking-widest mt-1">
                    🏆 Personal Peak PR!
                  </span>
                )}
              </div>
            </div>

            {/* Weight / Sets Metrics */}
            <div className="flex items-center gap-4 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
              <div className="flex-1">
                <div className="text-[8px] font-mono font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">PEAK LIFT</div>
                <div className="text-base font-mono font-black text-white tracking-tight">
                  {hoveredPoint.weight}kg
                </div>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex-1">
                <div className="text-[8px] font-mono font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">VOLUME STATE</div>
                <div className="text-xs font-mono font-black text-white">
                  {hoveredPoint.sets} Sets × {hoveredPoint.reps} Reps
                </div>
              </div>
            </div>

            {/* Timestamp date */}
            <div className="flex items-center gap-3 justify-end">
              <Calendar size={13} className="text-neutral-500 shrink-0" />
              <div>
                <div className="text-[8px] font-mono font-black text-neutral-500 uppercase tracking-widest leading-none text-right mb-0.5">COMPLETED ON</div>
                <div className="text-[11px] font-mono font-black text-neutral-300 uppercase tracking-widest text-right leading-none">
                  {hoveredPoint.dateStr}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-[10px] sm:text-xs text-neutral-500 font-mono font-black uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
            <span>Hover or Touch screen data-nodes to activate precision HUD metrics</span>
          </div>
        )}
      </div>
    </div>
  );
}
