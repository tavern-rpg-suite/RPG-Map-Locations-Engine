# 🗺️ RPG Map & Locations Engine

An extension for SillyTavern that adds interactive, AI-generated maps (**regions ➡️ locations ➡️ rooms**) to your roleplay. Travel together with companions or explore solo, unlock doors using items from your inventory, generate room illustrations, and trigger custom room encounters.

**Version 1.6.13**

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
* 🌐 **Bilingual Interface** — Switch between English and Russian with a single click.
* ✏️ **Visual Editor** — Add, remove, rename, or drag-and-drop rooms and regions to customize your map.

---

## ⚠️ Important Tips & Warnings

* 🧍 **Solo Exploration (Swipe Warning):** When using the **Go alone (Explore)** option, the extension sends a travel cue to the AI. Some models may not register this instruction on the first attempt. If the AI character fails to acknowledge your solo movement, simply **swipe to regenerate** the response.
* 📍 **Bypassing Travel Messages:** If you are already at a specific location when starting (e.g., a foyer), click the small **📍 We're here** button next to the room's name. This updates the active background and AI context instantly without writing travel text to your chat log.

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

## 💾 Saving & Backups

Your map state is saved directly inside your chat file. You can export your data in two formats:

* **Export tabs (JSON):** Saves only the layout structure and web image links. This results in a very small file size, ideal for local backups.
* **Export tabs + images (Full):** Embeds all local room images directly into the file. This creates a larger file, but makes your maps completely portable to other devices.
