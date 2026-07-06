# RPG Map & Locations Engine

A SillyTavern extension that builds an interactive, AI-generated **map of regions → locations → rooms** for your roleplay, lets you travel (together or solo), locks/unlocks doors using keys from your inventory, generates atmospheric **room images**, and fires optional **hidden reaction mini-game encounters** when you enter a room.


**Version 1.6.7**

---

## ✨ Features

- 🗺️ **AI map builder** — generates regions, locations and rooms from the character card, lorebook and recent chat.
- 🧭 **Tabs** — multiple maps (e.g. different cities/worlds) in one chat.
- 🚪 **Locked doors** — open them with keys/lockpicks from your inventory (a real key succeeds ~85% by default), by forcing the lock, or by asking the character.
- 🧍 **Solo explore mode** — the AI becomes the world's Game Master while the character stays behind.
- ⚡ **Reaction mini-game** — a hidden event with a "wait for green, then react" challenge (an early press fails); use an item to guarantee the upper hand.
- 🖼️ **AI room images** — generate an anime-style empty-scene snapshot per room from its name + description, with adjustable time of day / weather and an editable prompt template. Works with **OpenRouter** (nano-banana, grok) and **OpenAI-images** back-ends.
- 🌅 **Backgrounds that follow you** — entering a room swaps the chat background to that room's picture (AI-generated **or** any image you pick from a file). Rooms without a picture fall back to the normal background. Generated images can optionally be saved into `backgrounds/` with meaningful auto-named files.
- 📷 **Your own room photos** — a *Pick image from file* button on each room; stored efficiently (IndexedDB), shown in the note and used as the travel background.
- 🌍 **Bilingual UI (RU / EN)** — switch in one click; AI output language follows the interface language.
- ✏️ **Full editing** — rename, add/delete, and **drag-and-drop reorder** regions, locations, rooms and tabs in Editor mode.
- 💾 **Saves & sharing** — per-chat state with a chat-message checkpoint backup; light export (structure only) or **full export with images baked in**.

## 📦 Install

Copy the `RPG Map & Locations Engine` folder into:

```
SillyTavern/data/<user>/extensions/
```

Then reload SillyTavern and enable it in **Extensions → RPG Map Engine (Maps)**.

## ⚙️ Setup

1. Enable **Location Maps**.
2. Pick **Interface language** (English / Русский).
3. Fill in **API Settings** (URL / API key / model) — OpenAI-compatible text endpoint (default: OpenRouter).
4. Open a character chat — the 🗺️ button appears at the bottom-right (it stays hidden on the welcome screen).

The map is built automatically from lore the first time you open a chat, or on demand via the **Editor → Regenerate with AI** button. Use **Editor** mode to rename, add, delete, lock/unlock and drag-to-reorder everything.

## 🔑 Inventory integration

Doors read keys from the companion inventory extension `tavern_rpg_engine`
(`extension_settings.tavern_rpg_engine.chatStates[chatId].inventory`).
Any item whose name contains *key / pick / ключ / отмычка* counts as a key.
Its `chance` field (if present) sets the success rate; otherwise a sensible default is used (real key ~85%, lockpick ~40%).
On use the item is consumed. Lockpicking is capped at 2 attempts per door.

## 🌐 Language

The interface ships with a **RU/EN toggle** in settings — one build covers both.
The chosen language also controls the language the AI writes names and descriptions in.
(Image prompts are always assembled in English, since image models prefer it.)

## 🖼️ Room images — how it works

1. Room has a **name** → generate a **description** (AI) → click **Generate image (AI)**.
2. Step 1: a text model condenses name + description into a short English scene phrase → `{ROOM}`.
3. Step 2: that phrase is slotted into your editable template (placeholders `{ROOM} {STYLE} {TIME} {WEATHER} {SIZE}`) and sent to the image back-end.
4. The result hangs as a taped "photo" over the room note. **Time of day** and **weather** are quick dropdowns on each room.

Configure everything in **Settings → Room images (AI)**: API type, endpoint URL, key, model, size (default `1024x576`), style, defaults for time/weather, frame (plain / worn anime photo) and the prompt template.

### Back-ends

| Setting | OpenRouter (nano-banana / grok) | OpenAI-images |
|---|---|---|
| **Image API type** | `OpenRouter` (or `Auto`) | `OpenAI images` (or `Auto`) |
| **URL** | `https://openrouter.ai/api/v1` |  |
| **Model** | exact slug from the image-models list, e.g. `google/gemini-3.1-flash-image` | the provider's image model |
| **Endpoint used** | `POST /images` (returns base64) | `POST /images/generations` (url or base64) |

> OpenRouter's chat-`modalities` route is no longer used — the dedicated `/images` endpoint is called instead. In this mode the aspect ratio is derived from **Size** (e.g. `1024x576` → `16:9`).

If nothing generates, open the browser console — the error line `Image API <code> <text>` tells you: **401** key, **402** no credits, **404** wrong model, **400** bad parameter.

## 🌅 Chat backgrounds

Turn on **Room images (AI) → "Change chat background when entering a room"**. Then, when you travel:

- a room with a **picture** (AI-generated or picked from a file) → shown on a dedicated background layer the extension owns (so it updates reliably every time);
- a room with a **folder background** (from an experimental save-to-folder generation) → set via the native `/bg` command;
- a room with **neither** → the layer is cleared and SillyTavern's normal background shows again.

You can set a room's picture two ways: **Generate image (AI)** or **Pick image from file** (any local image). Both display as the room's taped photo and both drive the travel background.

Optionally enable **"Also save generated images to the backgrounds folder (experimental)"** to upload each generation to `backgrounds/` (via `/api/backgrounds/upload`) with a meaningful, unique filename derived from the AI's scene description. If your ST build rejects the upload it fails gracefully and the layer method still works.

## 💾 Saving, export & sharing

State is stored per chat (in extension settings) plus a checkpoint inside the latest chat message, so it survives reloads and travels with the chat.

Images are **never** written into the map state (which would bloat every save). Instead:
- a remote **URL** → stored as a short link;
- **base64** (OpenRouter, etc.) → stored once in the browser's **IndexedDB**, referenced by key.

Two export buttons in Settings:
- **Export tabs (JSON)** — structure + image references only. Small; best for a same-device backup.
- **Export tabs + images (full)** — inlines the actual image bytes into the file. Larger, but self-contained and portable to another device / shareable. On import, inlined images are automatically moved back into IndexedDB so the running state stays lightweight.

## 👥 Group chats

Works in group chats: the map is keyed by chat, lore is gathered from all group members, and travel/injection use the group context.

## 🧩 Notes

**Going alone sometimes needs a swipe.** "Go alone (Explore)" drops a solo-travel cue into your message for the story model and switches the map to solo mode. Weaker or busier models don't always react to that cue on the first generation — if the character/world doesn't acknowledge the move, just **swipe to regenerate** and it usually lands.

**Already at a location?** Clicking a room lets you *travel* there, which drops a short "we set off / we arrived" line into your chat box for the story model. If the scene already starts you somewhere (say, the foyer), use the small **📍 We're here** button next to the room's name instead — it marks that room as your current spot (updating the background and the context the model sees) **without** writing anything to chat, so there's nothing to delete.


- The floating map button appears only inside a character chat, not on the welcome screen.
- Editing changes the map instantly and re-injects an updated context summary for the AI.
- CSS is namespaced; the room-photo and scroll styles are additive.