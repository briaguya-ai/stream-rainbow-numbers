<template>

  <div id="click-handler" :style="{ background: backgroundStyleString }" @mousemove="fadeSeven" @touchmove="fadeSeven">
    <ArtSunday :baseHue=baseHue :mode=mode :score=score />
  </div>

</template>

<script>

  import ArtSunday from './components/ArtSunday.vue'

  const ComfyJS = require("comfy.js");

  const levelRates = [0.005, 0.010, 0.005, 0.005, 0.010, 0.005];
  const levelPoints = [570, 570, 1140, 570, 5700, 1140];

  Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
  }

  export default {
    name: 'App',
    components: {
      ArtSunday
    },
    data() {
      return {
        baseHue: 0,
        mode: 0,
        currentLevel: 0,
        score: 0,
        pointsToNextLevel: 570,
        currentHueChangeRate: 0.005,
        channelName: '',
      }
    },
    mounted() {
      ComfyJS.onChat = this.handleChat;
      this.channelName = window.location.href.split('?')[1];
      ComfyJS.Init(this.channelName);
    },
    methods: {
      handleChat(user, message) {
        const reps = user.length + message.length;
        this.pointsToNextLevel = this.pointsToNextLevel - this.currentHueChangeRate * reps;
        if(this.pointsToNextLevel <= 0) {
          this.mode = (this.mode + 1) % 2;
          this.currentLevel += 1;
          this.currentHueChangeRate = levelRates.random();
          this.pointsToNextLevel = levelPoints.random();
        }
        this.baseHue = (this.baseHue + this.currentHueChangeRate * reps) % 360;
        this.score = this.score + this.currentHueChangeRate * reps;
      },
    },
    computed: {
      backgroundStyleString() {
        switch (this.mode) {
          case 1:
            return (
              'linear-gradient(' +
              'hsl(' +
              ((this.baseHue + 180) % 360) +
              ',100%,25%)' +
              ',' +
              'hsl(' +
              ((this.baseHue + 210) % 360) +
              ',100%,25%)' +
              ')'
            )
          default:
            return '#000000'
        }
      }
    }
  }

</script>

<style>

  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    margin: 0;
    padding: 0;
    height: 100vh;
  }

  #click-handler {
    margin: 0;
    height: 100vh;
    width: 100%;
    background-color: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .text {
    padding: 20px;
    font-size: 36px;
  }

  @media screen and (min-width: 600px) and (min-height: 400px) {
    .text {
      font-size: 64px;
    }
  }

  @media screen and (min-width: 900px) and (min-height: 540px) {
    .text {
      font-size: 96px;
    }
  }

  h1 {
    margin: 0;
  }

  body {
    margin: 0;
  }

</style>
