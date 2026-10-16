# 🗺️ RPG Map & Locations Engine

<p>
<img width="1774" height="887" alt="81201567-69de-461e-b890-770c98ac02a28" src="https://github.com/user-attachments/assets/ebc0432e-2f9a-4984-a826-0f103f460d77" />
</p>

An extension for SillyTavern that adds interactive, AI-generated maps (**regions ➡️ locations ➡️ rooms**) to your roleplay. Travel together with companions or explore solo, unlock doors using items from your inventory, generate room illustrations, and trigger custom room encounters.

**Version 1.6.16**

---
## ✨ Features

<img width="855" height="610" alt="Screenshot_25" src="https://github.com/user-attachments/assets/f33764ec-f726-4b05-abff-cacb3322fd66" />

* 🗺️ **AI Map Builder** — Automatically drafts maps based on your character cards, lorebooks, or recent chat history.
* 🧭 **Multi-Map Support** — Manage multiple maps (such as different cities or worlds) within a single chat session.
* 🚪 **Interactive Obstacles** — Open locked doors using keys or lockpicks found in your companion inventory.
* 🧍 **Solo Exploration** — Explore areas independently while your companion stays behind, prompting the AI to act as a Game Master.
* ⚡ **Reaction Mini-Game** — Experience hidden prompt challenges when entering certain rooms.
* 🖼️ **Room Illustrations** — Generate empty-scene room snapshots using image generation APIs, complete with customizable weather, styles, and times of day.
* 🌅 **Dynamic Backgrounds** — Automatically change your SillyTavern chat background to match the room you just entered.
* 📷 **Custom Uploads** — Easily upload your own local images to use as room graphics instead of AI generations.
* 🎼 **Procedural Sound & Music** — Generate lightweight room ambience and scene music directly in the browser. No audio files, downloads, or external audio services required.
* 👥 **Who Is Where** — Keep track of where every character is: set it by hand, let the map move companions as you travel, ask a second model — or let characters live their own lives and go about their day.
* 👂 **Overhearing** — Listen at the door of someone in the same building, or receive a dispatch letter about someone far away. You can correct a letter right on the paper.
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
## 🎯 Choices as buttons

While exploring alone, each reply gets [A]–[D] moves as buttons in the message; one press sends it. A second model reads the last few messages and suggests them (reliable with any main model), or the main model writes them itself — your choice in *Exploring alone*.

<img width="663" height="294" alt="Screenshot_37" src="https://github.com/user-attachments/assets/8055a9be-f85f-4ff4-a475-8c224606e5a5" />

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

The map can also bring locations and scenes to life with **procedural sound and music** — a small extra layer of atmosphere, fully generated in your browser.

**🌧️ Room Soundscapes**  

Rooms can automatically receive ambient sound based on their **name and description** — rain, fire, water, wind, crowds, forests, machinery, bells, clocks, period streets, modern traffic, and more. You can override the result or simply describe your own ambience, for example: `a clock, rain outside, a fire`.

**🎹 Scene Music**  

Music is generated **bar by bar** rather than played from predefined loops. Mood, harmony, instruments, rhythm, tempo and meter are adapted to the scene, so the same location can sound completely different depending on what is happening.

**🤖 AI Composition**  

Press **🎼 Compose** and the AI can create musical parameters based on the current room and scene. The composition prompt is fully editable in settings, so you can change how the music is generated.

**⚡ Lightweight & Local**  
Everything is synthesized directly in the browser. **No audio files, downloads, streaming, licenses, or external audio services.** Manual choices always take priority over automatic generation.

---

## 🗺️ Using the Map

### 🎬 Scene Changes

When you enter another room, its picture loads first, then transitions together with the room's sound and music.

Go to **Settings → 🎬 Scene change** to choose a transition:
- **Dissolve** — smooth fade (default).
- **Through the dark** — a darker transition.
- **Living camera** — slow zoom on the room image.

You can also enable a brief room-name title card when entering.

### 📍 Follow the Story

If you use [**RPG Scene Card**](https://github.com/tavern-rpg-suite/RPG-Scene-Card), the map can follow the location in your story automatically.

When the story moves to another room, a small note appears with **Go there**. Enable *Move automatically* to let the map follow without clicking. While exploring alone, the map stays where you are.

### 👥 Who Is Where

A truly living world. Not a tracker that describes the world — a house where things happen without you: people keep their routines, meet, quarrel, make plans and leave, and you find out at a door, from a letter, or from the note waiting for you in the morning.

<img width="854" height="594" alt="image" src="https://github.com/user-attachments/assets/29c15595-e00e-417a-9bcf-818763211708" />

Open the map and click **👥** in the header to see where everyone is.

- **Set locations manually** — choose a room, *with you*, *unknown*, or enter another place. Manually assigned locations stay pinned until you unpin them.
- **Move with companions** — travelling together keeps them with you; travelling alone leaves them behind.
- **Where is everyone?** — asks the model to update character locations based on recent messages.
- **🚶 Lives their own life** — let a character work, run errands, visit others, or spend time elsewhere even when they are not mentioned in the chat.
- **⏰ Daily routine** — set where a character spends the morning, day, evening and night, or let the model create a routine for them.

With [**RPG Scene Card**](https://github.com/tavern-rpg-suite/RPG-Scene-Card), routines can follow the in-story clock automatically.

### 🌍 Let the World Keep Moving

Enable the extra options if you want a more active world:

- **Off-screen chronicle** — keeps a short record of what characters do between scenes.
- **Consequences** — tracks changes and plans that happen after overheard conversations or letters.
- **Portraits on the map** — shows who is in each room.
- **Voices from a room nearby** — alerts you when multiple characters gather in another room and lets you listen in.
- **Who is where summary in the main prompt** — helps your story model keep track of character locations.

Characters marked **with you** or assigned a pinned location won't be moved by background updates.

---

## 👂 Overhearing & Letters

<img width="817" height="593" alt="image" src="https://github.com/user-attachments/assets/97facd96-3865-4936-a030-744ebb918632" />


Discover what characters do and say when you're not around.

### 🚪 Listen at a Door

Open **👥 Who Is Where** and find a character in the same building. Click **👂** beside their name, or use the button on the room card.

You'll get a scene with everyone in that room: a conversation if several people are there, or a moment alone if only one person is present.

Lines appear one by one, with an optional blur for words you don't quite catch. Click **Keep listening** to continue.

### ✉️ Read About Someone Far Away

Characters in another building or somewhere off the map can have a **✉** button.

Click it to receive a letter showing what they are doing or thinking about in their own lives. Use **✎ Edit** to correct the title, text or signature, then **Save** to keep your changes. **Cancel** or **Esc** discards them.

### 🧠 Make It Feel Like a Living World

By default, scenes and letters focus on the characters' own lives — their work, relationships, plans and worries — rather than making everything about the player.

The model receives relevant character information, their location, recent activity, previous overheard scenes and letters, and the latest story messages. It is instructed not to resolve the main plot, kill characters or reveal major secrets outright.

Long character cards are condensed automatically when needed. The summaries are saved per character, so unchanged cards don't need to be processed again.

### 📜 Keep What You Discover

The last **10 overheard scenes and letters per chat** are saved under **Overheard**.

- **Forget** — keep an entry in the list, but exclude it from future prompts.
- **✕** — delete an entry.
- **Delete forgotten** — remove all entries you've marked to forget.

You can also enable **Add what I overheard at doors to the main prompt** and **Add letters to the main prompt**. This lets your main story model use what you've discovered as secret knowledge.

Characters won't know they were overheard, and words you didn't catch won't be included. Use **📜** beside a character to exclude their scenes and letters from the prompt.

### ⚙️ Useful Settings

Under **Who is where · overhearing**, you can configure:

- How often character locations update automatically.
- Which model handles location updates and overheard scenes.
- Whether to send the date, time and weather from [**RPG Scene Card**](https://github.com/tavern-rpg-suite/RPG-Scene-Card).
- How much dialogue is blurred and how long overheard scenes are.
- Whether scenes, letters, off-screen activity and character locations are included in the main prompt.

Most options are off by default, so you can start simple and enable only the features you want.

---
## 💾 Saving & Backups

Your map state is saved directly inside your chat file. You can export your data in two formats:

* **Export tabs (JSON):** Saves only the layout structure and web image links. This results in a very small file size, ideal for local backups.
* **Export tabs + images (Full):** Embeds all local room images directly into the file. This creates a larger file, but makes your maps completely portable to other devices.

---
## ✨ Screenshots

<img width="1910" height="871" alt="Preview-RPG Map   Locations Engine" src="https://github.com/user-attachments/assets/d1c203c1-97b6-4caf-a08d-29c19cff4481" />
