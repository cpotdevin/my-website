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

  let alreadyConnectedOnce = false;
  let isSocketConnected = false;
  let userCount = 0;

  const onOpen = () => {
    alreadyConnectedOnce = true;
    isSocketConnected = true;
  };

  const onClose = () => {
    if (isSocketConnected) {
      isSocketConnected = false;
      connect();
    }
  };

  const connect = () => {
    setTimeout(() => {
      if (!isSocketConnected) {
        connectToSketchPadWebSocket(onOpen, onClose, onMessage);
        connect();
      }
    }, 2000);
  };

  const onMessage = (message: MessageEvent) => {
    const body = JSON.parse(JSON.parse(message.data).body);

    if (typeof body === 'number') {
      userCount = body;
    } else if (body.from && body.to) {
      drawLine(body.from, body.to);
    }
  };

  onMount(() => {
    context = canvas.getContext('2d');
    context.lineCap = 'round';

    connect();

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

<div class="mt-1">
  {#if isSocketConnected}
    <div class="flex items-center gap-1 text-sm text-slate-400">
      <div>
        <div class="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400" />
        <div class="h-2 w-2 rounded-full bg-emerald-400" />
      </div>

      Connected with {Math.max(userCount - 1, 0)} other
      {userCount - 1 === 1 ? 'person' : 'people'}
    </div>
  {:else}
    <div class="flex items-center gap-1 text-sm text-slate-400">
      <div>
        <div class="absolute h-2 w-2 animate-ping rounded-full bg-red-400" />
        <div class="h-2 w-2 rounded-full bg-red-400" />
      </div>

      {#if alreadyConnectedOnce}
        Connection lost, reconnecting...
      {:else}
        Connecting...
      {/if}
    </div>
  {/if}
</div>
