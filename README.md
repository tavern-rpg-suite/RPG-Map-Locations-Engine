# 🗺️ RPG Map & Locations Engine

An extension for SillyTavern that adds interactive, AI-generated maps (**regions ➡️ locations ➡️ rooms**) to your roleplay. Travel together with companions or explore solo, unlock doors using items from your inventory, generate room illustrations, and trigger custom room encounters.

**Version 1.6.14**

---
## ✨ Screenshot

<img width="858" height="603" alt="Screenshot_10" src="https://github.com/user-attachments/assets/67c327cc-d3c9-4915-9bff-8f6cfa7bebf9" />
<img width="853" height="580" alt="Screenshot_9" src="https://github.com/user-attachments/assets/31e5cd78-fb50-475b-9b6a-e86031d9ea9d" />

---
## ✨ Features

* 🗺️ **AI Map Builder** — Automatically drafts maps based on your character cards, lorebooks, or recent chat history.
* 🧭 **Multi-Map Support** — Manage multiple maps (such as different cities or worlds) within a single chat session.
* 🚪 **Interactive Obstacles** — Open locked doors using keys or lockpicks found in your companion inventory.
* 🧍 **Solo Exploration** — Explore areas independently while your companion stays behind, prompting the AI to act as a Game Master.
* ⚡ **Reaction Mini-Game** — Experience hidden prompt challenges when entering certain rooms.
* 🖼️ **Room Illustrations** — Generate empty-scene room snapshots using image generation APIs, complete with customizable weather, styles, and times of day.
* 🌅 **Dynamic Backgrounds** — Automatically change your SillyTavern chat background to match the room you just entered.
* 📷 **Custom Uploads** — Easily upload your own local images to use as room graphics instead of AI generations.
* 🎼 **Procedural Sound & Music** — Generate lightweight room ambience and scene music directly in the browser. No audio files, downloads, or external audio services required.
* 🌐 **Bilingual Interface** — Switch between English and Russian with a single click.
* ✏️ **Visual Editor** — Add, remove, rename, or drag-and-drop rooms and regions to customize your map.

---

## ⚠️ Important Tips & Warnings

* 🧍 **Solo Exploration (Swipe Warning):** When using the **Go alone (Explore)** option, the extension sends a travel cue to the AI. Some models may not register this instruction on the first attempt. If the AI character fails to acknowledge your solo movement, simply **swipe to regenerate** the response.
* 📍 **Bypassing Travel Messages:** If you are already at a specific location when starting (e.g., a foyer), click the small **📍 We're here** button next to the room's name. This updates the active background and AI context instantly without writing travel text to your chat log.
* 🎼 **Sound is off by default.** Enable it in the extension settings or press **▶ Try it**. Browsers require a user interaction before audio can begin.

---

## 📦 Installation

1. Copy the `RPG Map & Locations Engine` folder into your SillyTavern extensions directory:
   ```
   SillyTavern/data/<user>/extensions/
   ```
2. Restart or reload SillyTavern.
3. Enable the extension in **Extensions ➡️ RPG Map Engine (Maps)**.

---

## ⚙️ Setup

1. Check **Location Maps** to enable the extension.
2. Select your preferred **Interface language** (English / Русский).
3. Fill in your **API Settings** (URL, key, and model) using an OpenAI-compatible text endpoint (e.g., OpenRouter).
4. Open a character chat; the 🗺️ icon will appear in the bottom-right corner.

The initial map will build automatically from your lorebook context, or you can regenerate it manually using the **Editor ➡️ Regenerate with AI** button.

---

## 🔑 Inventory Integration

The map reads key items from the companion inventory extension (`tavern_rpg_engine`). 

* Any item in your inventory containing keywords like *key, pick, ключ,* or *отмычка* will be recognized as a door-opening tool.
* A standard key has a ~85% success rate, while a lockpick has a ~10% success rate (limited to 2 attempts per door). 
* Successfully unlocking a door consumes the item.

---

## 🖼️ Room Images

You can generate custom illustrations for any room:
1. Click **Generate image (AI)** on a room.
2. The system summarizes the room's name and description into a prompt, applies your selected style, weather, and time of day, and sends it to your image API (OpenRouter and OpenAI-images endpoints are supported).
3. The generated image is saved locally in your browser's IndexedDB to prevent save-file bloat.
4. Alternatively, use the **Pick image from file** button to set a custom offline image.

---

## 🎼 Sound & Music

The map can also generate a **soundscape for every room** and **music for scenes**.

The audio is synthesized directly in your browser using lightweight procedural sound generation. **No audio files are shipped, downloaded, streamed, or licensed.** Nothing is generated on every message, and playback requires no external audio service.

Every piece is generated locally from a small set of musical parameters, so it is extremely lightweight and can play indefinitely without a looping audio file.

### 🌧️ Room Soundscapes

Rooms can have automatically selected ambient sounds based on their **name and description** — no manual tagging required.

Available sound palettes include:
🌧️ rain · 🔥 fire · 🌊 sea · 🍺 crowd · 🦗 night · 💧 dripping stone · 🌬️ wind
⛈️ thunder · 🕰️ clock · 🐦 birds · 🏞️ water · ⚙️ machinery · 🔔 bells · ❄️ snow
🎐 soft drone · 🕯️ quiet room · 🐎 19th-century street · 🚗 modern street · 🌲 forest

These are **not recordings**. The sounds are synthesized from noise, oscillators, filters, envelopes, and small randomized variations.

You can also override the automatic choice from the map header, or describe the ambience yourself:

> `a clock, rain outside, a fire`

The system will interpret the description and build the appropriate soundscape.

For example:

* A cellar can drip quietly in the background.
* A harbour can breathe with distant water.
* A tavern can murmur behind a closed door.
* A 19th-century street can carry irregular hoofbeats, iron rims on stone, and distant voices.
* A modern street can fade in with passing traffic.
* A forest can shift between leaves, distant birds, and an occasional creaking tree.

---

### 🎹 Procedural Music

Scene music is generated from **twelve+ moods**, each with its own harmony, instruments, meter, and rhythmic behaviour:

☕ warm room · 🔍 thinking it through · 🕯️ something is off · 🌸 tender
🫧 closeness, kept quiet · 💗 almost said aloud · 🌧️ quiet grief · 🗡️ on edge
🏛️ grand · 🌌 cold outside · 🦇 courteous and dead · 🩸 something is in here
🗺️ road ahead · 🌲 old forest · ☣️ still alive

The engine does not simply play predefined loops. It **generates the music bar by bar**.

* 🎵 **Motifs** — A short phrase is created for each piece and returns with variations, inversions, and altered endings.
* 🥁 **Rhythm** — Five drum patterns range from a quiet heartbeat to a driving backbeat. Calm and intimate scenes can deliberately have no beat.
* 🎻 **Instruments** — Celesta, felt piano, glass, harp, bells, wood, and other synthesized voices use different attack and release behaviour.
* 📐 **Form** — Pieces follow structures such as A → A2 → B → A, allowing density to rise and fall instead of remaining static.
* 🕰️ **Meters** — Straight four, waltz, lilting six, and unsettled five are used to change the physical feel of a scene.
* 🎼 **Humanization** — Quiet pieces use held chords, singing bass lines, and subtle timing drift so that notes do not land with perfectly mechanical precision.

The result is intended to feel closer to a **small game soundtrack system** than a background audio loop.

---

### ✍️ Letting the Model Compose

Press 🎼 and the AI can compose the parameters for a new piece based on the **room and the current scene**.

It can choose:

* tempo
* key and scale
* chord progression
* instrument
* meter
* drum pattern
* melodic density
* room ambience

The scene matters as much as the location. A café where nothing is happening can be warm and gentle; the same café during a murder investigation should not automatically produce café music.

The generated values are validated before playback. Invalid fields are clamped or replaced with safe defaults, so an unusual AI response can change the music but cannot break the audio engine.

The composition prompt is **fully editable** in the settings and includes a **Restore Default** button.

---

### 🎲 ✎ ⭐ Your Music, Your Rules

**🎲 Not this one**
Reroll the current piece. This is completely local: a new key, progression, tempo, instrument, or rhythm can be generated without another API request.

**✎ Describe it**
Give the composer a simple brief such as:

> `cosy, fireplace, romance, night`

Your description takes priority over the room and scene.

**⭐ Keep it**
Save a generated piece, give it a name, and pin it to a room. A favourite evening theme can then return every time you enter the same location.

Manual choices always take priority. If you choose a sound or mood yourself, automatic generation will not overwrite it.

---

## 💾 Saving & Backups

Your map state is saved directly inside your chat file. You can export your data in two formats:

* **Export tabs (JSON):** Saves only the layout structure and web image links. This results in a very small file size, ideal for local backups.
* **Export tabs + images (Full):** Embeds all local room images directly into the file. This creates a larger file, but makes your maps completely portable to other devices.
