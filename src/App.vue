<template>
  <div id="app" v-on:click="this.onClick">
    <div class="background-layer"></div>
    
    <div class="header">
      <img class="logo" :src="require('@/assets/images/Logo.png')" alt="Kura Logo" />
      <h1 class="title" v-html="isMobile ? 'KURA<br>FORCE' : 'KURA FORCE'"></h1>
    </div>

    <div id="lights-container">
      <div id="connector"></div>
      <LightStrip ref="lights" v-for="id in [0, 1, 2, 3, 4]" :key="id" />
    </div>

    <div class="instructions" v-html="isMobile ? 'Click or tap anywhere to start.<br>Click again when lights go off.' : 'Click or tap anywhere on the screen to start. Click again when lights go off.'"></div>

    <div class="results-section">
      <h1 class="time">{{ this.result !== null ? this.result : "" }}</h1>
      <div class="best-time">Your best: {{ this.format(this.best) }}</div>
      <div class="footer-link">
        <a href="https://kuraforce.vercel.app/" target="_blank" rel="noopener" class="footer-anchor">
          Meet the team! 🇨🇷
        </a>
      </div>
    </div>

    <div class="avatar-container">
      <img class="avatar" :src="require('@/assets/images/Avatar.png')" alt="Avatar" />
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
/* Footer link styles */
.footer-link {
  margin-top: 1.2rem;
  padding-bottom: 1rem;
  text-align: center;
}
.footer-anchor {
  color: #244D3F;
  font-size: 1rem;
  text-decoration: underline;
  transition: color 0.2s;
  font-weight: 400;
  letter-spacing: 0.01em;
  padding-bottom: 1rem;
}
.footer-anchor:hover {
  color: #3B6D5C;
}

#app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  font-family: 'Anton', sans-serif;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}


.background-layer {
  display: none;
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
  filter: none;
  z-index: 11;
}


.title {
  color: #244D3F;
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
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
  background: #A6C5BB22;
  border-radius: 20px;
  border: 2px solid #A6C5BB;
  margin-bottom: 1rem;
}

#connector {
  position: absolute;
  background: #BCC69E;
  height: 4px;
  top: 50%;
  width: 80%;
  left: 10%;
  z-index: -1;
  border-radius: 2px;
}

.instructions {
  color: #244D3F;
  font-size: 1.1rem;
  text-align: center;
  z-index: 10;
  margin: 0 1rem 1.5rem 1rem;
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
  color: #244D3F;
  z-index: 10;
  position: relative;
  margin: 0;
  text-align: center;
}

.best-time {
  color: #BCC69E;
  font-size: clamp(1rem, 4vw, 1.8rem);
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
  filter: none;
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
  color: #244D3F;
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