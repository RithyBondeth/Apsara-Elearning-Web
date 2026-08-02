"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { cn } from "@/lib/utils"

interface AnimatedShaderBackgroundProps {
  className?: string
}

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float iTime;
  uniform float iDark;
  uniform vec2 iResolution;

  #define NUM_OCTAVES 3

  float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);

    float res = mix(
      mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
      mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
      u.y
    );
    return res * res;
  }

  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.3;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
      v += a * noise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.4;
    }
    return v;
  }

  void main() {
    vec2 p = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.y
      * mat2(6.0, -4.0, 4.0, 6.0);
    vec2 v;
    vec4 o = vec4(0.0);
    float f = 2.0 + fbm(p + vec2(iTime * 1.35, 0.0)) * 0.5;

    for (float i = 0.0; i < 35.0; i++) {
      v = p + cos(
        i * i + (iTime + p.x * 0.08) * 0.025
        + i * vec2(13.0, 11.0)
      ) * 3.5;

      float tailNoise = fbm(v + vec2(iTime * 0.28, i))
        * 0.3 * (1.0 - (i / 35.0));
      vec4 auroraColors = vec4(
        0.06 + 0.20 * sin(i * 0.2 + iTime * 0.25),
        0.22 + 0.40 * cos(i * 0.3 + iTime * 0.30),
        0.68 + 0.28 * sin(i * 0.4 + iTime * 0.20),
        1.0
      );
      vec4 contribution = auroraColors * exp(sin(i * i + iTime * 0.45))
        / length(max(v, vec2(v.x * f * 0.015, v.y * 1.5)));
      float thinness = smoothstep(0.0, 1.0, i / 35.0) * 0.6;
      o += contribution * (1.0 + tailNoise * 0.8) * thinness;
    }

    o = tanh(pow(max(o / 94.0, vec4(0.0)), vec4(1.55)));
          vec3 darkColor = vec3(0.006, 0.018, 0.055) + o.rgb * 1.25;

          // Keep light mode airy while giving the moving shader enough
          // contrast to remain visible against the pale page background.
          float lightFlow = clamp(length(o.rgb) * 1.7, 0.0, 0.58);
          float violetMix = clamp(o.r * 2.2, 0.0, 1.0);
          vec3 lightRibbon = mix(
            vec3(0.30, 0.66, 0.98),
            vec3(0.62, 0.43, 0.94),
            violetMix
          );
          vec3 lightColor = mix(
            vec3(0.945, 0.97, 1.0),
            lightRibbon,
            lightFlow
          );
    gl_FragColor = vec4(mix(lightColor, darkColor, iDark), 1.0);
  }
`

export function AnimatedShaderBackground({
  className,
}: AnimatedShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
      })
    } catch {
      return
    }

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iDark: {
          value: document.documentElement.classList.contains("dark") ? 1 : 0,
        },
        iResolution: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader,
      fragmentShader,
    })
    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    const clock = new THREE.Clock()
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    scene.add(mesh)
    renderer.domElement.className = "absolute inset-0 size-full"
    renderer.domElement.setAttribute("aria-hidden", "true")
    container.appendChild(renderer.domElement)

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      const safeWidth = Math.max(1, width)
      const safeHeight = Math.max(1, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setSize(safeWidth, safeHeight, false)
      material.uniforms.iResolution.value.set(
        safeWidth * renderer.getPixelRatio(),
        safeHeight * renderer.getPixelRatio()
      )
    }

    let frameId = 0
    const render = () => {
      material.uniforms.iTime.value = clock.getElapsedTime()
      renderer.render(scene, camera)
      if (!reduceMotion) frameId = requestAnimationFrame(render)
    }

    const resizeObserver = new ResizeObserver(resize)
    const themeObserver = new MutationObserver(() => {
      material.uniforms.iDark.value = document.documentElement.classList.contains(
        "dark"
      )
        ? 1
        : 0
      if (reduceMotion) renderer.render(scene, camera)
    })
    resizeObserver.observe(container)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    resize()
    render()

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      themeObserver.disconnect()
      scene.remove(mesh)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden bg-[#f3f7ff] dark:bg-[#020817]",
        className
      )}
    />
  )
}
