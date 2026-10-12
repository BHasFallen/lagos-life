// Web Audio API Synthesizer for Aviator
// Complies with Vatar rule: Audio only starts on user gesture, pauses on onPause

class AviatorAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.engineOsc = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.isEngineRunning = false;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this.isEngineRunning) {
      this.stopEngine();
    }
    return this.muted;
  }

  pauseAll() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
  }

  resumeAll() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  startEngine() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    if (this.isEngineRunning) return;

    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineFilter = this.ctx.createBiquadFilter();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(75, this.ctx.currentTime);

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(260, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.engineGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.5);

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
      this.isEngineRunning = true;
    } catch (e) {
      console.warn("Audio start error:", e);
    }
  }

  updateEngineMultiplier(mult) {
    if (!this.isEngineRunning || !this.ctx || this.muted) return;
    try {
      // Pitch increases as multiplier climbs
      const freq = Math.min(320, 75 + Math.log(mult) * 60);
      const filterFreq = Math.min(800, 260 + Math.log(mult) * 150);
      this.engineOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
      this.engineFilter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.1);
    } catch (e) {}
  }

  stopEngine() {
    if (!this.isEngineRunning || !this.ctx) return;
    try {
      if (this.engineGain) {
        this.engineGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.15);
      }
      setTimeout(() => {
        try {
          if (this.engineOsc) this.engineOsc.stop();
        } catch (e) {}
        this.isEngineRunning = false;
        this.engineOsc = null;
        this.engineGain = null;
        this.engineFilter = null;
      }, 200);
    } catch (e) {
      this.isEngineRunning = false;
    }
  }

  playCashout() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    // Harmonious triumphant chime chord (E5, G#5, B5)
    const notes = [659.25, 830.61, 987.77];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.65);
    });
  }

  playCrash() {
    this.stopEngine();
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      // Noise buffer for explosion / fly away whoosh
      const bufferSize = this.ctx.sampleRate * 0.7;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.7);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.7);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch (e) {}
  }
}

window.aviatorAudio = new AviatorAudio();
