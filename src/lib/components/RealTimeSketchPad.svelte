<script lang="ts">
  import { connectToSketchPadWebSocket, sendDrawMessage } from '$lib/api/drawingWebSocket';

  import { onMount } from 'svelte';

  let windowHeight: number;
  let windowWidth: number;

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

  type Point = [number, number];

  let lastPoint: Point | undefined;
  let isDrawing = false;

  const handleStartLine = () => {
    isDrawing = true;
  };

  const handleEndLine = () => {
    isDrawing = false;
    lastPoint = undefined;
  };

  const drawLine = (from: Point, to: Point) => {
    context.beginPath();
    context.moveTo(from[0], from[1]);
    context.lineTo(to[0], to[1]);
    context.stroke();
  };

  const handleNewPossiblePoint = (point: Point) => {
    if (isDrawing && lastPoint) {
      sendDrawMessage({ from: lastPoint, to: point });
      drawLine(lastPoint, point);
    }

    lastPoint = point;
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    handleNewPossiblePoint([e.clientX - rect.left, e.clientY - rect.top]);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    handleNewPossiblePoint([e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top]);
  };

  const messageCallback = (message: any) => {
    const body = JSON.parse(JSON.parse(message.data).body);
    if (body.from && body.to) {
      drawLine(body.from, body.to);
    }
  };

  onMount(() => {
    context = canvas.getContext('2d');
    context.lineCap = 'round';

    connectToSketchPadWebSocket(messageCallback);

    let interval = setInterval(() => {
      context.fillStyle = 'rgba(255,255,255,0.1)';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }, 100);

    return () => clearInterval(interval);
  });
</script>

<svelte:window bind:innerHeight={windowHeight} bind:innerWidth={windowWidth} />

<canvas
  class="cursor-crosshair rounded-xl border-2 border-slate-200"
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
