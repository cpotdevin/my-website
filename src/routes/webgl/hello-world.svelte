<script lang="ts">
  import Header from '$lib/Components/Header.svelte';

  import { onMount } from 'svelte';

  let canvas;

  var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// all shaders have a main function
void main() {

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

  var fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  // Just set the output to a constant redish-purple
  outColor = u_color;
}
`;

  function createShader(gl: WebGLRenderingContext, type: number, source: string) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

  function createProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
  ) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  function resizeCanvasToDisplaySize(canvas, multiplier = 1) {
    const width = (canvas.clientWidth * multiplier) | 0;
    const height = (canvas.clientHeight * multiplier) | 0;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
    return false;
  }

  function randomInt(range: number) {
    return Math.floor(Math.random() * range);
  }

  function setRectangle(
    gl: WebGLRenderingContext,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;

    // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
    // whatever buffer is bound to the `ARRAY_BUFFER` bind point
    // but so far we only have one buffer. If we had more than one
    // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
      gl.STATIC_DRAW,
    );
  }

  onMount(() => {
    if (canvas instanceof HTMLCanvasElement) {
      const gl = canvas.getContext('webgl2');

      if (!gl) {
        return;
      }

      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

      const program = createProgram(gl, vertexShader, fragmentShader);

      const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
      const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
      var colorLocation = gl.getUniformLocation(program, 'u_color');

      const positionBuffer = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      const positions = [10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      gl.enableVertexAttribArray(positionAttributeLocation);

      const size = 2; // 2 components per iteration
      const type = gl.FLOAT; // the data is 32bit floats
      const normalize = false; // don't normalize the data
      const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
      let offset = 0; // start at the beginning of the buffer
      gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

      resizeCanvasToDisplaySize(gl.canvas);

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Clear the canvas
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

      for (var ii = 0; ii < 50; ++ii) {
        // Setup a random rectangle
        setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));

        // Set a random color.
        gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);

        // Draw the rectangle.
        var primitiveType = gl.TRIANGLES;
        offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);
      }
    }
  });
</script>

<Header />

<div class="mx-auto w-full max-w-screen-md px-2">
  <div class="my-10">
    <h1
      class="w-fit bg-gradient-to-r from-teal-500 via-violet-500 to-pink-500 bg-clip-text py-1 text-4xl font-bold text-transparent"
    >
      Testing out WebGL
    </h1>
    <h2 class="text-gray-500">2022-03-21</h2>
  </div>

  <canvas bind:this={canvas} class="mx-auto rounded-lg border border-gray-300" />
</div>
