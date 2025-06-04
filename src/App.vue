<template>
  <div id="app" v-on:click="this.onClick">
    <div class="background-layer"></div>
    
    <div class="header">
      <img class="logo" src="/images/Logo.png" alt="Kinitro Logo" />
      <h1 class="title" v-html="isMobile ? 'KINITRO<br>RACING' : 'KINITRO RACING'"></h1>
    </div>

    <div id="lights-container">
      <div id="connector"></div>
      <LightStrip ref="lights" v-for="id in [0, 1, 2, 3, 4]" :key="id" />
    </div>

    <div class="instructions" v-html="isMobile ? 'Click or tap anywhere to start.<br>Click again when lights go off.' : 'Click or tap anywhere on the screen to start. Click again when lights go off.'"></div>

    <div class="results-section">
      <h1 class="time">{{ this.result !== null ? this.result : "" }}</h1>
      <div class="best-time">Your best: {{ this.format(this.best) }}</div>
    </div>

    <div class="avatar-container">
      <img class="avatar" src="/images/Avatar.png" alt="Avatar" />
    </div>
  </div>
</template>

<script>
import LightStrip from "./components/LightStrip.vue";

// Possible states
const IDLE = "idle";
const RUNNING = "running";
const WAITING = "waiting";

const LIGHT_ON_INTERVAL = 1000; // ms

export default {
  components: { LightStrip },

  data() {
    return {
      state: IDLE,
      nextLightStrip: 0,
      result: "00.000",
      startTime: null,
      timerId: null,
      fuzzerId: null,
      best: localStorage.best || 0,
      isMobile: false
    };
  },

    mounted() {
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.checkScreenSize);
  },


methods: {
  start() {
    this.nextLightStrip = 0;
    this.result = "00.000";
    this.startTime = null;
    this.clearLights();

    this.turnOnNextLight();
    this.timerId = setInterval(
      () => this.turnOnNextLight(),
      LIGHT_ON_INTERVAL
    );
  },

  turnOnNextLight() {
    if (this.nextLightStrip == 5) {
      this.fuzzedLightsOut();
      clearInterval(this.timerId);
    } else {
      this.$refs.lights[this.nextLightStrip].switchOn(true);
      this.nextLightStrip++;
    }
  },

  fuzzedLightsOut() {
    // random time between 4-7 sec
    const fuzzyInterval = Math.random() * 1800 + 2400;
    this.fuzzerId = setTimeout(() => {
      this.clearLights();
      this.startTime = Date.now();
      this.state = WAITING;
    }, fuzzyInterval);
  },

  clearLights() {
    this.$refs.lights.forEach(l => l.switchOn(false));
  },

  onClick() {
    if (this.state == RUNNING) {
      this.state = IDLE;
      this.result = "JUMP START!";
      clearInterval(this.timerId);
      clearTimeout(this.fuzzerId);
    } else if (this.state == IDLE) {
      this.state = RUNNING;
      this.start();
    } else if (this.state == WAITING) {
      this.state = IDLE;
      const timeDiff = Date.now() - this.startTime;
      // Reducir 100ms para hacer el delay más justo
      const adjustedTime = Math.max(0, timeDiff - 100);
      this.result = this.format(adjustedTime);
      this.best = this.best === 0 ? adjustedTime : Math.min(this.best, adjustedTime);
      localStorage.best = this.best;
    }
  },

  format(ms) {
    // Convert milliseconds to seconds.milliseconds format
    const secs = (ms / 1000).toFixed(3);
    return `${(parseInt(secs) < 10 ? "0" : "") + secs}`;
  },

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }
}
};
</script>

<style scoped>
#app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  font-family: 'Anton', sans-serif;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 30%, rgba(255, 140, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 69, 0, 0.08) 0%, transparent 50%),
    linear-gradient(45deg, transparent 30%, rgba(255, 140, 0, 0.03) 50%, transparent 70%);
  z-index: 1;
  pointer-events: none;
}

/* Flowing lines animation */
.background-layer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(45deg, transparent 48%, rgba(255, 140, 0, 0.1) 49%, rgba(255, 140, 0, 0.1) 51%, transparent 52%),
    linear-gradient(-45deg, transparent 48%, rgba(255, 69, 0, 0.08) 49%, rgba(255, 69, 0, 0.08) 51%, transparent 52%);
  background-size: 100px 100px, 150px 150px;
  animation: flow 20s linear infinite;
  opacity: 0.3;
}

@keyframes flow {
  0% { transform: translate(0, 0); }
  100% { transform: translate(200px, 200px); }
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  padding-top: 1rem;
  flex-shrink: 0;
}

.logo {
  height: clamp(50px, 12vw, 100px);
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 15px rgba(255, 140, 0, 0.5));
  z-index: 11;
}

.title {
  color: white;
  font-size: 2.5 rem;
  margin: 0 0 1rem 0;
  text-shadow: 
    0 0 10px rgba(255, 140, 0, 0.5),
    3px 3px 6px rgba(0, 0, 0, 0.7);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-align: center;
  line-height: 1.1;
}

#lights-container {
  position: relative;
  display: flex;
  flex-direction: row;
  z-index: 10;
  gap: 15px;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  border: 2px solid rgba(255, 140, 0, 0.3);
  backdrop-filter: blur(10px);
  margin-bottom: 1rem;
}

#connector {
  position: absolute;
  background: linear-gradient(90deg, rgba(255, 140, 0, 0.5), rgba(255, 69, 0, 0.5));
  height: 4px;
  top: 50%;
  width: 80%;
  left: 10%;
  z-index: -1;
  border-radius: 2px;
}

.instructions {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  text-align: center;
  z-index: 10;
  margin: 0 1rem 1.5rem 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.3;
}

.results-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  gap: 1rem;
}

.time {
  font-size: clamp(2.5rem, 10vw, 5rem);
  font-weight: 300;
  line-height: 1.2;
  color: white;
  text-shadow: 
    0 0 20px rgba(255, 140, 0, 0.6),
    2px 2px 4px rgba(0, 0, 0, 0.5);
  z-index: 10;
  position: relative;
  margin: 0;
  text-align: center;
}

.best-time {
  color: rgba(255, 255, 255, 0.8);
  font-size: clamp(1rem, 4vw, 1.8rem);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  z-index: 10;
  position: relative;
  margin: 0;
  text-align: center;
}

.avatar-container {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: flex-end;
  z-index: 10;
  padding: 0;
}

.avatar {
  height: clamp(60px, 20vw, 600px);
  z-index: 12;
  filter: drop-shadow(0 0 10px rgba(255, 140, 0, 0.3));
}

.help-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  text-align: center;
  margin: 0;
  font-size: clamp(0.8rem, 2.5vw, 1.1rem);
  line-height: 1.3;
  z-index: 13;
  color: #333;
  font-family: Arial, sans-serif;
  font-weight: normal;
}

/* Responsive Design */
@media only screen and (max-width: 768px) {
  .header {
    padding-top: 0.5rem;
  }
  
  
  #lights-container {
    gap: 10px;
    padding: 1rem;
    margin-bottom: 1rem;
  }
}

@media only screen and (max-width: 480px) {
  .header {
    padding-top: 0.25rem;
  }
  
  #lights-container {
    gap: 8px;
    padding: 0.8rem; 
    margin-bottom: 0.8rem;
  }
  
}

@media only screen and (max-width: 1024px) {
  .avatar-container {
    display: none;
  }
}

@media only screen and (min-width: 1400px) {
  .header {
    padding-top: 1.5rem;
  }
  
  .logo {
    height: clamp(70px, 15vw, 120px);
    margin-bottom: 1rem;
  }
  
  #lights-container {
    padding: 2rem;
    gap: 20px;
    margin-bottom: 1.5rem;
  }
  
  .avatar-container {
    padding: 0;
    display: flex;
  }
  
  .avatar {
    height: clamp(100px, 25vw, 700px);
  }
}
</style>