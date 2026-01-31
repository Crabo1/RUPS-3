class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    this.loadSound('move', '/sounds/move.wav');
    this.loadSound('turn', '/sounds/turn.wav');
    this.loadSound('jump', '/sounds/jump.wav');
    this.loadSound('pickup', '/sounds/pickup.wav');
    this.loadSound('unlock', '/sounds/unlock.wav');
    this.loadSound('win', '/sounds/win.wav');
    this.loadSound('fail', '/sounds/fail.wav');
  }

  private loadSound(name: string, path: string) {
    const audio = new Audio(path);
    audio.volume = 0.5;
    this.sounds.set(name, audio);
  }

  play(name: string) {
    if (!this.enabled) return;
    const sound = this.sounds.get(name);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {}); // Ignore errors
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

export const soundManager = new SoundManager();