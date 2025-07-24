# 🎸 RxJS Guitar Hero Rhythm Game

This is a rhythm-based game inspired by *Guitar Hero*, built using **RxJS**, **Tone.js**, and **TypeScript**. Notes are dynamically loaded from a CSV file and rendered using SVG, while instrument sounds are played using sampled audio.

### 🔑 Features
- Built with **RxJS** (observable-based game logic)
- Real-time keyboard input (`A`, `S`, `D`, `F`)
- Support for **pause/resume** (`P` key) and **restart**
- Sound playback using **Tone.js** and `tonejs-instruments`
- Parses a `.csv` file to load note data dynamically
- Modular and maintainable TypeScript code structure

> This project was built as a personal side project to deepen my understanding of reactive programming and real-time game logic in the browser.

## Usage

Setup (requires node.js):

```bash
> npm install
```

Start tests:

```bash
> npm test
```

Serve up the App (and ctrl-click the URL that appears in the console)

```bash
> npm run dev
```

# 🎸 RxJS Guitar Hero Game

This project is a browser-based **Guitar Hero-style rhythm game** built with **RxJS**, **Tone.js**, and **TypeScript**. It challenges players to hit notes in sync with music using the keyboard. The game loads notes dynamically from a CSV file and plays real instrument samples using `tonejs-instruments`.

The game supports real-time interactions such as:
- 🎹 Key press detection (`A`, `S`, `D`, `F`)
- 🎵 Playback of different instrument sounds
- ⏸️ Pause/resume with the `P` key
- 🔁 Restart functionality via a button

Under the hood, it uses **RxJS observables** to model game actions, state transitions, and time-based note progression.

---

## 🧰 Tech Stack

- [RxJS](https://rxjs.dev/) – Reactive programming for managing events, time, and user inputs
- [Tone.js](https://tonejs.github.io/) – Web Audio API-based music library for instrument playback
- [TypeScript](https://www.typescriptlang.org/) – Static typing for maintainable, scalable code
- [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) – Dynamic rendering of game elements

---

## 📁 CSV-Based Song Input

The game reads a `.csv` file located in the `assets/` folder that defines:
- The instrument
- Pitch and velocity
- Start and end times of each note
- Whether the note should be played by the user or just as background music

This CSV is pre-processed and converted into game state at runtime.

---

## 🎮 How to Play

- Press `A`, `S`, `D`, `F` to hit the falling notes on time.
- Press `P` to pause/resume.
- Click the **Restart** button to restart the game.

Ensure you allow browser audio playback for Tone.js to function correctly.

---


