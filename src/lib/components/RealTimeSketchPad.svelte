<script lang="ts">
  import { onMount } from 'svelte';

  let windowHeight: number;
  let windowWidth: number;

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

  onMount(() => {
    context = canvas.getContext('2d');

    function fade() {
      context.fillStyle = 'rgba(255,255,255,0.3)';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    let interval = setInterval(() => {
      context.fillStyle = 'rgba(255,255,255,0.3)';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }, 100);

    return () => clearInterval(interval);
  });

  type Point = [number, number];

  let lastPoint: Point | undefined;

  const setLastPoint = (p: Point) => {
    lastPoint = p;
  };

  let isDrawing = false;

  const handleStartLine = () => {
    isDrawing = true;
  };

  const handleEndLine = () => {
    isDrawing = false;
    lastPoint = undefined;
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    drawLine([e.clientX - rect.left, e.clientY - rect.top]);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    drawLine([e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top]);
  };

  const drawLine = (point: Point) => {
    if (isDrawing && lastPoint) {
      context.beginPath();
      context.moveTo(lastPoint[0], lastPoint[1]);
      context.lineTo(point[0], point[1]);
      context.stroke();
    }

    setLastPoint(point);
  };
</script>

<svelte:window bind:innerHeight={windowHeight} bind:innerWidth={windowWidth} />

<canvas
  class="rounded-xl border-2 border-slate-200"
  bind:this={canvas}
  height="300px"
  width="300px"
  on:mousedown={handleStartLine}
  on:touchstart={handleStartLine}
  on:mousemove={handleMouseMove}
  on:touchmove={handleTouchMove}
  on:mouseup={handleEndLine}
  on:mouseleave={handleEndLine}
  on:touchend={handleEndLine}
/>
