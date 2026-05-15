<template>
  <div class="drone-illustration" :style="cssStyle">
    <svg viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="di-glow">
          <stop offset="0%" stop-color="var(--di-color)" stop-opacity="0.28" />
          <stop offset="60%" stop-color="var(--di-color)" stop-opacity="0.06" />
          <stop offset="100%" stop-color="var(--di-color)" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- 中心辉光 -->
      <circle cx="240" cy="240" r="220" fill="url(#di-glow)" />

      <!-- 旋转的雷达环 -->
      <g class="di-rings">
        <circle class="di-ring di-ring-1" cx="240" cy="240" r="218" />
        <circle class="di-ring di-ring-2" cx="240" cy="240" r="170" />
        <circle class="di-ring di-ring-3" cx="240" cy="240" r="118" />
      </g>

      <!-- 罗盘十字 -->
      <g class="di-compass">
        <line x1="240" y1="6" x2="240" y2="34" />
        <line x1="240" y1="446" x2="240" y2="474" />
        <line x1="6" y1="240" x2="34" y2="240" />
        <line x1="446" y1="240" x2="474" y2="240" />
      </g>

      <!-- 散点坐标 -->
      <g class="di-coords">
        <circle cx="80" cy="120" r="2" />
        <circle cx="402" cy="98" r="2.5" />
        <circle cx="98" cy="378" r="2" />
        <circle cx="392" cy="380" r="2.5" />
        <circle cx="160" cy="58" r="1.5" />
        <circle cx="56" cy="200" r="1.5" />
        <circle cx="424" cy="220" r="1.5" />
        <circle cx="200" cy="430" r="1.5" />
        <circle cx="350" cy="60" r="1.5" />
        <circle cx="300" cy="420" r="2" />
      </g>

      <!-- 信号波 -->
      <g class="di-signals">
        <g class="di-wave-wrap">
          <circle class="di-wave" cx="240" cy="240" r="48" />
        </g>
        <g class="di-wave-wrap">
          <circle class="di-wave di-wave-2" cx="240" cy="240" r="48" />
        </g>
        <g class="di-wave-wrap">
          <circle class="di-wave di-wave-3" cx="240" cy="240" r="48" />
        </g>
      </g>

      <!-- 无人机本体（漂浮动画） -->
      <g class="di-drone">
        <g class="di-drone-float" transform="translate(240 240)">
          <!-- 阴影 -->
          <ellipse class="di-shadow" cx="0" cy="98" rx="80" ry="9" />

          <!-- 机臂（X 形） -->
          <g class="di-arms">
            <rect x="-92" y="-6" width="184" height="12" rx="3" transform="rotate(45)" />
            <rect x="-92" y="-6" width="184" height="12" rx="3" transform="rotate(-45)" />
          </g>

          <!-- 4 个螺旋桨 -->
          <g class="di-prop" transform="translate(-65 -65)">
            <circle class="di-prop-ring" r="28" />
            <g class="di-prop-spin">
              <ellipse class="di-blade" rx="26" ry="2.5" />
              <ellipse class="di-blade" rx="2.5" ry="26" />
            </g>
            <circle class="di-prop-hub" r="5" />
          </g>
          <g class="di-prop" transform="translate(65 -65)">
            <circle class="di-prop-ring" r="28" />
            <g class="di-prop-spin di-prop-spin-rev">
              <ellipse class="di-blade" rx="26" ry="2.5" />
              <ellipse class="di-blade" rx="2.5" ry="26" />
            </g>
            <circle class="di-prop-hub" r="5" />
          </g>
          <g class="di-prop" transform="translate(-65 65)">
            <circle class="di-prop-ring" r="28" />
            <g class="di-prop-spin di-prop-spin-rev">
              <ellipse class="di-blade" rx="26" ry="2.5" />
              <ellipse class="di-blade" rx="2.5" ry="26" />
            </g>
            <circle class="di-prop-hub" r="5" />
          </g>
          <g class="di-prop" transform="translate(65 65)">
            <circle class="di-prop-ring" r="28" />
            <g class="di-prop-spin">
              <ellipse class="di-blade" rx="26" ry="2.5" />
              <ellipse class="di-blade" rx="2.5" ry="26" />
            </g>
            <circle class="di-prop-hub" r="5" />
          </g>

          <!-- 机身 -->
          <rect class="di-body" x="-36" y="-36" width="72" height="72" rx="15" />
          <rect class="di-body-inner" x="-26" y="-26" width="52" height="52" rx="10" />

          <!-- 摄像头 -->
          <circle class="di-camera-housing" r="14" />
          <circle class="di-camera-lens" r="8" />
          <circle class="di-camera-glint" cx="-2.5" cy="-2.5" r="2.2" />

          <!-- 4 个状态指示灯 -->
          <circle class="di-led di-led-front" cx="0" cy="-30" r="2.6" />
          <circle class="di-led di-led-back" cx="0" cy="30" r="2.6" />
          <circle class="di-led di-led-left" cx="-30" cy="0" r="2.6" />
          <circle class="di-led di-led-right" cx="30" cy="0" r="2.6" />
        </g>
      </g>
    </svg>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  /** 主题色，作用于发光、机臂、机身轮廓、桨叶等 */
  color?: string
  /** 辅助色，作用于左右两侧 LED */
  accent?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: '#2d8cf0',
  accent: '#5cadff',
})

const cssStyle = computed(() => ({
  '--di-color': props.color,
  '--di-accent': props.accent,
}))
</script>

<style lang="scss" scoped>
.drone-illustration {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  user-select: none;

  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
}

/* ========== 雷达环 ========== */
.di-ring {
  fill: none;
  stroke: var(--di-color);
  stroke-opacity: 0.22;
  stroke-width: 1;
}
.di-ring-1 {
  stroke-dasharray: 2 6;
  animation: di-rotate 60s linear infinite;
  transform-origin: 240px 240px;
}
.di-ring-2 {
  stroke-dasharray: 12 6;
  stroke-opacity: 0.16;
  animation: di-rotate 40s linear infinite reverse;
  transform-origin: 240px 240px;
}
.di-ring-3 {
  stroke-opacity: 0.3;
  stroke-dasharray: 1 4;
  animation: di-rotate 30s linear infinite;
  transform-origin: 240px 240px;
}

/* ========== 罗盘 ========== */
.di-compass line {
  stroke: var(--di-color);
  stroke-opacity: 0.55;
  stroke-width: 1.5;
  stroke-linecap: round;
}

/* ========== 坐标点 ========== */
.di-coords circle {
  fill: var(--di-color);
  fill-opacity: 0.45;
}

/* ========== 信号波 ========== */
.di-wave {
  fill: none;
  stroke: var(--di-color);
  stroke-width: 2;
  opacity: 0;
  animation: di-wave 3.6s ease-out infinite;
  transform-origin: 240px 240px;
}
.di-wave-2 {
  animation-delay: 1.2s;
}
.di-wave-3 {
  animation-delay: 2.4s;
}

@keyframes di-wave {
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  20% {
    opacity: 0.7;
  }
  100% {
    transform: scale(2.6);
    opacity: 0;
  }
}

/* ========== 无人机漂浮 ========== */
.di-drone-float {
  animation: di-float 4s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes di-float {
  0%, 100% {
    transform: translate(240px, 240px) translateY(0);
  }
  50% {
    transform: translate(240px, 240px) translateY(-14px);
  }
}

/* ========== 阴影 ========== */
.di-shadow {
  fill: rgba(0, 0, 0, 0.5);
  filter: blur(5px);
  animation: di-shadow 4s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes di-shadow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.55;
  }
  50% {
    transform: scale(0.82);
    opacity: 0.3;
  }
}

/* ========== 机臂 ========== */
.di-arms rect {
  fill: #1a2433;
  stroke: var(--di-color);
  stroke-width: 1;
  stroke-opacity: 0.45;
}

/* ========== 螺旋桨 ========== */
.di-prop-ring {
  fill: rgba(15, 25, 40, 0.65);
  stroke: var(--di-color);
  stroke-width: 1.2;
  stroke-opacity: 0.7;
}
.di-prop-hub {
  fill: #2a3548;
  stroke: var(--di-color);
  stroke-width: 0.6;
  stroke-opacity: 0.6;
}
.di-prop-spin {
  animation: di-spin 0.35s linear infinite;
  transform-box: fill-box;
  transform-origin: center;
}
.di-prop-spin-rev {
  animation-direction: reverse;
}
.di-blade {
  fill: var(--di-color);
  fill-opacity: 0.55;
}

@keyframes di-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========== 机身 ========== */
.di-body {
  fill: #1a2433;
  stroke: var(--di-color);
  stroke-width: 1.5;
  stroke-opacity: 0.55;
}
.di-body-inner {
  fill: #2a3548;
}

/* ========== 摄像头 ========== */
.di-camera-housing {
  fill: #0d1420;
  stroke: var(--di-color);
  stroke-width: 1;
  stroke-opacity: 0.7;
}
.di-camera-lens {
  fill: var(--di-color);
  fill-opacity: 0.35;
}
.di-camera-glint {
  fill: #ffffff;
  fill-opacity: 0.75;
}

/* ========== LED 状态灯 ========== */
.di-led {
  animation: di-blink 1.6s ease-in-out infinite;
  filter: drop-shadow(0 0 3px currentColor);
}
.di-led-front {
  fill: #ffffff;
  color: #ffffff;
}
.di-led-back {
  fill: #ff4d4f;
  color: #ff4d4f;
  animation-delay: 0.4s;
}
.di-led-left {
  fill: var(--di-accent);
  color: var(--di-accent);
  animation-delay: 0.8s;
}
.di-led-right {
  fill: var(--di-accent);
  color: var(--di-accent);
  animation-delay: 1.2s;
}

@keyframes di-blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

@keyframes di-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 减弱动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .di-ring-1,
  .di-ring-2,
  .di-ring-3,
  .di-wave,
  .di-drone-float,
  .di-shadow,
  .di-prop-spin,
  .di-led {
    animation: none;
  }
}
</style>
