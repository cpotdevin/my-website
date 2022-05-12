<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import RealTimeSketchPad from '$lib/components/RealTimeSketchPad.svelte';
</script>

<svelte:head><title>ptd.vin</title></svelte:head>

<Header />

<div class="mx-auto w-full max-w-screen-xl px-2">
  <div class="my-20 flex flex-col items-center justify-between lg:my-36 lg:mx-36 lg:flex-row">
    <div>
      <h1
        class="w-fit bg-gradient-to-r from-teal-500 via-violet-500 to-pink-500 bg-clip-text text-4xl font-bold text-transparent md:text-6xl"
      >
        Christian Potdevin
      </h1>
      <p class="mt-2 text-2xl text-gray-600 lg:ml-6">
        Welcome to my <span class="underline">personal</span> website
      </p>
    </div>

    <div class="mt-10 lg:mt-0">
      <p class="mb-2 text-base text-slate-600">Realtime Sketch Pad</p>
      <RealTimeSketchPad />
      <p class="mt-2 text-xs text-slate-400">
        Made with WebSockets in Go (
        <a class="underline" href="https://github.com/cpotdevin/my-backend">view on GitHub</a>
        )
      </p>
    </div>
  </div>
</div>
