import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { Candle } from '../../../shared/types';

interface D3ChartProps {
  data: Candle[];
  width?: number;
  height?: number;
}

export function D3Chart({ data, width = 800, height = 400 }: D3ChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear existing chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 20, right: 50, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.time)) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.low) as number * 0.999,
        d3.max(data, d => d.high) as number * 1.001
      ])
      .range([innerHeight, 0]);

    const volumeScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.volume) as number])
      .range([innerHeight, innerHeight * 0.7]);

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Add group for margins
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add gridlines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
      )
      .style('stroke-opacity', 0.1);

    // Add candlesticks
    g.selectAll('line.candlestick')
      .data(data)
      .enter()
      .append('line')
      .attr('class', 'candlestick')
      .attr('x1', d => xScale(new Date(d.time)))
      .attr('x2', d => xScale(new Date(d.time)))
      .attr('y1', d => yScale(d.low))
      .attr('y2', d => yScale(d.high))
      .attr('stroke', d => d.close > d.open ? 'var(--success)' : 'var(--destructive)')
      .attr('stroke-width', 1);

    g.selectAll('rect.candlestick')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'candlestick')
      .attr('x', d => xScale(new Date(d.time)) - 3)
      .attr('y', d => yScale(Math.max(d.open, d.close)))
      .attr('width', 6)
      .attr('height', d => Math.abs(yScale(d.open) - yScale(d.close)))
      .attr('fill', d => d.close > d.open ? 'var(--success)' : 'var(--destructive)');

    // Add volume bars
    g.selectAll('rect.volume')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'volume')
      .attr('x', d => xScale(new Date(d.time)) - 3)
      .attr('y', d => volumeScale(d.volume))
      .attr('width', 6)
      .attr('height', d => innerHeight - volumeScale(d.volume))
      .attr('fill', d => d.close > d.open ? 'var(--success)' : 'var(--destructive)')
      .attr('opacity', 0.3);

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => d3.timeFormat('%H:%M')(d as Date));

    const yAxis = d3.axisRight(yScale)
      .ticks(10)
      .tickFormat(d => d3.format(',.2f')(d));

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    g.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${innerWidth},0)`)
      .call(yAxis);

    // Add tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'var(--background)')
      .style('border', '1px solid var(--border)')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('pointer-events', 'none');

    // Add hover interaction
    const mouseover = (event: MouseEvent, d: Candle) => {
      tooltip.style('visibility', 'visible');
      
      const formattedTime = new Date(d.time).toLocaleTimeString();
      const content = `
        <div class="font-medium">Time: ${formattedTime}</div>
        <div>Open: ${d.open.toFixed(2)}</div>
        <div>High: ${d.high.toFixed(2)}</div>
        <div>Low: ${d.low.toFixed(2)}</div>
        <div>Close: ${d.close.toFixed(2)}</div>
        <div>Volume: ${d.volume.toFixed(2)}</div>
      `;
      
      tooltip.html(content);
    };

    const mousemove = (event: MouseEvent) => {
      tooltip
        .style('top', (event.pageY - 10) + 'px')
        .style('left', (event.pageX + 10) + 'px');
    };

    const mouseleave = () => {
      tooltip.style('visibility', 'hidden');
    };

    // Add hover areas
    g.selectAll('rect.hover-area')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'hover-area')
      .attr('x', d => xScale(new Date(d.time)) - 3)
      .attr('y', 0)
      .attr('width', 6)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave);

  }, [data, width, height]);

  return (
    <div className="w-full h-full bg-background rounded-lg border border-border">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
