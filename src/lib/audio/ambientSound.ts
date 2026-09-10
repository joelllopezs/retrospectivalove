"use client";

/**
 * Um "pad" ambiente bem suave, sintetizado na hora com a Web Audio API — três
 * osciladores formando um acorde grave (Lá maior), levemente desafinados entre
 * si pra soar orgânico, passando por um filtro passa-baixa e com um LFO lento
 * dando uma respiração no volume. Nenhum arquivo de áudio envolvido, então não
 * tem questão de direito autoral: é o som ambiente padrão do app.
 */

interface AmbientNodes {
  context: AudioContext;
  oscillators: OscillatorNode[];
  masterGain: GainNode;
  lfo: OscillatorNode;
}

let active: AmbientNodes | null = null;

const CHORD_FREQUENCIES = [110, 138.59, 164.81]; // A2, C#3, E3

export function startAmbientSound(): void {
  if (active) {
    if (active.context.state === "suspended") active.context.resume();
    return;
  }

  const context = new AudioContext();

  const masterGain = context.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(context.destination);
  masterGain.gain.linearRampToValueAtTime(0.05, context.currentTime + 2);

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 800;
  filter.connect(masterGain);

  const oscillators = CHORD_FREQUENCIES.map((freq, i) => {
    const osc = context.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.detune.value = i * 3;
    osc.connect(filter);
    osc.start();
    return osc;
  });

  // LFO bem lento pra dar uma "respirada" no volume, não fica um drone estático.
  const lfo = context.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = context.createGain();
  lfoGain.gain.value = 0.015;
  lfo.connect(lfoGain);
  lfoGain.connect(masterGain.gain);
  lfo.start();

  active = { context, oscillators, masterGain, lfo };
}

export function stopAmbientSound(): void {
  if (!active) return;
  const { context, oscillators, masterGain, lfo } = active;

  masterGain.gain.linearRampToValueAtTime(0, context.currentTime + 1);

  setTimeout(() => {
    oscillators.forEach((osc) => osc.stop());
    lfo.stop();
    context.close();
  }, 1100);

  active = null;
}
