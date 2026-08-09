import { getContext, extension_settings } from '../../../extensions.js';
import { eventSource, event_types, saveChatDebounced, saveSettingsDebounced, setExtensionPrompt, extension_prompt_roles, characters } from '../../../../script.js';
import { selected_group, groups } from '../../../group-chats.js';

const MODULE_NAME = 'rpg_map_engine';
const PROMPT_KEY = 'rpg_map_injection';

/* ============================================================
   LOCALIZATION (RU / EN)
   All user-facing strings live here. The rest of the code never
   hard-codes visible text, so switching `settings.language`
   fully re-skins the interface. AI output language also follows.
   ============================================================ */
const I18N = {
    en: {
        // toasts
        toast_restored: "Location map restored from the chat backup!",
        toast_designing: "AI architect is designing the map structure...",
        toast_designed: "Map structure designed successfully!",
        toast_gen_fail: "AI could not generate the map.",
        toast_describing: "AI is describing the room...",
        toast_desc_done: "Room description generated!",
        toast_desc_junk: "The model answered with nothing usable — the old description was kept.",
        default_room_name: "Room",
        toast_desc_junk: "Модель ответила бессмыслицей — старое описание оставлено.",
        default_room_name: "Комната",
        toast_desc_fail: "AI error while describing the room.",
        toast_building_region: "AI is building the new region...",
        toast_region_done: "Region built by AI successfully!",
        toast_ai_failed: "AI request failed.",
        toast_pick_success: "A miracle! The lock gave way to the pin!",
        toast_pick_fail: "Lockpicking failed! The lock jammed even more ({n}/2).",
        toast_key_success: "The lock gave way! The door is open.",
        toast_key_fail: "The attempt failed! The item broke.",
        toast_scan_success: "The character let you in!",
        toast_scan_fail: "In the last 5 messages the character did not give you access to this room.",
        toast_solo_enter: "You went into \"{name}\" ALONE. The AI now plays the world!",
        toast_return: "You returned to the character.",
        toast_exported: "Map file exported!",
        toast_imported: "Map tabs imported successfully!",
        toast_import_bad: "Invalid map file format.",
        toast_import_err: "File read error.",
        // prompts / confirms
        default_new_region: "New Region",
        prompt_block_name: "Enter the name of the new region (Block):",
        confirm_ai_fill_region: "Do you want AI to automatically fill this region with locations and rooms?",
        prompt_loc_name: "Enter the location name:",
        prompt_room_name: "Enter the room name:",
        confirm_room_locked: "Make this room locked?\n[OK] – Yes (Locked)\n[Cancel] – No (Open)",
        confirm_delete_element: "Are you sure you want to delete this element?",
        confirm_force_regen: "Are you sure? This will erase the current chat map and generate a new one based on the AI settings.",
        confirm_regen: "Are you sure? This will erase the current map and create a new one with AI.",
        prompt_tab_name: "Enter the name of the new map tab (e.g. Liyue or Hampstead):",
        confirm_ai_tab: "Do you want AI to automatically build this new tab from the lore?",
        prompt_tab_directions: "Describe what this place is (AI will build the map from this):\n[For example: Hampstead, a country villa]",
        confirm_tab_delete: "Delete the map tab \"{name}\" and all its regions?",
        prompt_rename_tab: "Rename the map tab:",
        prompt_rename_block: "Rename the region:",
        prompt_rename_loc: "Rename the location:",
        prompt_rename_room: "Rename the room:",
        // info panel
        info_switched: "Switched to tab \"{name}\". Select a room on the map.",
        info_select_room: "Select a room on the map to inspect it or travel.",
        status_locked: "Locked 🔒",
        status_open: "Open 🔓",
        desc_locked: "This room is locked. Unlock it using items or the story.",
        desc_empty: "[No description yet. Generate one with AI or write it manually.]",
        btn_open_door: "Open the door",
        ph_ai_prompt: "Optional prompt for AI generation...",
        btn_gen_desc: "Generate description (AI)",
        btn_regen_desc: "Regenerate description (AI)",
        btn_edit_manual: "Edit manually",
        btn_call_char: "Call the character here",
        btn_move_alone: "Move here alone",
        btn_return_char: "Return to the character",
        btn_go_together: "Go together with the character",
        btn_go_alone: "Go alone (Explore)",
        mus_on: 'Play music', mus_vol: 'Music volume',
        mus_hint: 'Written bar by bar as you play, so it never loops and never ends. A mood is guessed from the room; pick your own from the map header, and roll the dice if the piece does not suit.',
        mus_mood: 'Mood for this room', mus_auto: 'By the room', mus_reroll: 'Another piece',
        mus_now: 'Music: {what} — click to stop',
        mus_brief: 'Say what you want to hear here',
        mus_brief_ask: 'What should play in this room?\nA few words are enough — cosy, fireplace, romance, night.',
        mus_brief_now: 'You asked for: {text}', mus_noroom: 'Step into a room first',
        mus_compose: 'Let the model write a piece for this scene',
        mus_save: 'Save this piece to the library', mus_saveas: 'Name for this piece:',
        mus_saved: 'Saved to the library', mus_nothing: 'Nothing is playing yet',
        mus_lib: 'Saved pieces', mus_ai: 'written for this room', mus_piece: 'piece',
        mus_composed: 'Written', mus_failed: 'Could not write it — check URL / key / model.',
        mus_badjson: 'The reply was not usable; keeping what was playing.',
        mus_nokey: 'No API key — the model cannot write anything.',
        mus_lines: 'Lines of scene to read:',
        mus_prompt: 'Composer prompt', mus_reset: 'Restore default',
        mus_prompt_hint: 'Sent when you press the 🎼 button. It returns numbers — tempo, key, chords — which are checked and clamped before anything is played, so a strange answer can spoil a piece but never the sound.',
        mus_horror: 'something is in here', mus_danger: 'something is following', mus_quest: 'the road ahead', mus_woodland: 'old green places', mus_survival: 'still moving', mus_intimate: 'closeness, kept quiet', mus_romance: 'almost said aloud', mus_space: 'the cold outside', mus_vampire: 'courteous and dead',
        mus_cafe: 'a warm room', mus_noir: 'something is off', mus_tender: 'tender',
        mus_sad: 'quiet grief', mus_tense: 'on edge', mus_grand: 'grand', mus_curious: 'thinking it through',
        amb_h: 'Ambience', amb_on: 'Play room ambience',
        amb_hint: 'Synthesised in the browser — no files, no downloads, nothing to license. What plays is chosen by the room\'s own name and description.',
        amb_vol: 'Volume', amb_room: 'Room sounds', amb_pad: 'Play a drone when music is off',
        amb_pad_hint: 'A stand-in, not an extra layer: it only sounds while music is switched off, and it is off by default.',
        amb_street: 'hooves on stone', amb_traffic: 'traffic', amb_forest: 'the forest', amb_pad: 'a soft drone', amb_storm: 'thunder', amb_clock: 'a clock', amb_birds: 'birds', amb_river: 'water',
        amb_machine: 'machinery', amb_bells: 'bells', amb_snow: 'snow',
        amb_brief: 'Say in words what should be heard here',
        amb_brief_ask: 'What should be heard in this room?\nA few words are enough — a clock, rain outside, a fire.',
        mus_del: 'Delete this saved piece', mus_del_ask: 'Delete "{name}" from the library?',
        mus_deleted: 'Deleted',
        amb_nomatch: 'Could not tell what that should sound like — pick one from the list.',
        amb_pick: 'Sound for this room', amb_auto: 'By the room', amb_none: 'Silent',
        amb_now: 'Ambience: {what} — click to silence', amb_off: 'Ambience is off — click to start it',
        mus_off: 'Music is off — click to start it',
        amb_rain: 'rain', amb_fire: 'fire', amb_sea: 'the sea', amb_crowd: 'a crowd',
        amb_night: 'night', amb_cave: 'dripping stone', amb_wind: 'wind', amb_room_p: 'a quiet room',
        amb_test: 'Try it',
        btn_set_here: "📍 We're already here (no message)",
        btn_here_mini: "We're here",
        btn_save: "Save",
        btn_cancel: "Cancel",
        // unlock modal
        unlock_title: "How to open the door?",
        unlock_attempts: "Lockpick attempts made: {n}/2",
        unlock_use_key: "Use: {name} ({chance}% success)",
        unlock_broken: "Use: {name} (Lock is broken)",
        unlock_ask_char: "Ask the character (scan chat)",
        unlock_force: "Try to force the lock (10% chance)",
        // encounter
        enc_tag: "Sudden event",
        enc_default_situation: "Something stirs as you step into {name}...",
        enc_default_success: "You react in time and keep the upper hand.",
        enc_default_fail: "You react a moment too late, and it goes badly.",
        enc_items_title: "Use an item to gain the upper hand?",
        enc_instructions: "Wait for the button to turn green, then hit it as fast as you can!",
        enc_wait: "Wait...",
        enc_react: "REACT!",
        enc_early: "Too early! You flinched before the moment came.",
        enc_send: "Send to chat",
        enc_item_outcome: "Using {item}, you turn the situation to your advantage. {success}",
        enc_skip: "Skip",
        // solo bar
        solo_title: "Explore · alone",
        solo_at: "You are at:",
        // settings
        set_header: "RPG Map Engine (Maps)",
        set_enable: "Enable Location Maps",
        set_language: "Interface language",
        set_api: "🔌 API Settings",
        set_url: "URL",
        set_key: "API Key",
        set_model: "Model",
        set_depth: "Map injection depth:",
        set_event_chance: "Random event chance (0–1):",
        set_scan: "📖 AI lore scan on build",
        set_use_card: "Use Character Card",
        set_use_lore: "Use Lorebook",
        set_saves: "💾 Saves",
        set_export: "Export tabs (JSON)",
        set_export_full: "Export tabs + images (full)",
        set_import: "Import tabs (JSON)",
        toast_bundling: "Bundling images into the file...",
        toast_export_fail: "Export failed.",
        set_force_regen: "Fully regenerate the map with AI",
        // modal / tree
        modal_title: "Area map",
        btn_editor: "⚙️ Editor",
        tree_add_block: "Add region (Block)",
        tree_regen: "Regenerate with AI",
        title_add_loc: "Add location",
        title_del_region: "Delete region",
        title_add_room: "Add room",
        title_del_loc: "Delete location",
        title_del_room: "Delete room",
        title_rename: "Rename",
        title_lock_open: "Open the door manually",
        title_lock_close: "Lock the door manually",
        title_new_tab: "Create a new map tab",
        title_rename_tab: "Double-click to rename",
        // in-world (AI-facing) messages
        sys_travel: "*[System: Travel from {old} to {new}. Distance: {dist}. Time: {time}. The player sets off. {char}, react to our journey and the road!]*",
        sys_go_alone: "*I head off alone to explore \"{name}\".*",
        sys_go_together: "*[We enter the room \"{name}\" together. Room description: {desc}. Describe our arrival here.]*",
        sys_end_solo: "*I finished exploring \"{name}\" alone and returned to you. (The character does not know exactly what happened there, but may guess and ask about it). Play out our reunion!*",
        sys_encounter: "*[Hidden event at {name}: {situation} Outcome: {outcome}]*",
        travel_default_distance: "a short distance",
        travel_default_time: "a little while",
        default_room: "An ordinary room",
        // AI-output language clauses
        ai_lang_names: "All names must be in English and match the requested theme/setting.",
        ai_lang_text: "Write in English.",
        inject_solo_lang: "Write strictly in English, keep the tone descriptive and atmospheric.",
        // room images
        img_section: "🖼️ Room images (AI)",
        img_enable: "Enable AI room images",
        img_api_url: "Image API URL",
        img_mode: "Image API type",
        img_mode_auto: "Auto-detect",
        img_mode_openai: "OpenAI images (/images/generations)",
        img_mode_openrouter: "OpenRouter / chat image (nano-banana, grok)",
        img_api_key: "Image API key",
        img_model: "Image model",
        img_size: "Image size (e.g. 1024x576)", img_size_custom: "Size preset (or type a custom one below)",
        img_style: "Style",
        img_time: "Time of day (default)",
        img_weather: "Weather (default)",
        img_frame: "Photo frame",
        img_frame_plain: "Plain",
        img_frame_worn: "Worn anime photo",
        img_template: "Prompt template — placeholders: {ROOM} {STYLE} {TIME} {WEATHER} {SIZE}",
        set_sync_bg: "Change chat background when entering a room",
        set_save_bg: "Also save generated images to backgrounds folder (experimental)",
        btn_pick_image: "Pick image from file",
        toast_bg_uploaded: "Image saved to the backgrounds folder.",
        toast_bg_upload_fail: "Couldn't save to backgrounds folder (experimental).",
        btn_gen_image: "Generate image (AI)",
        btn_regen_image: "Regenerate image (AI)",
        btn_remove_image: "Remove image",
        toast_img_generating: "AI is painting the room...", img_generating_status: "Generating image...",
        toast_img_done: "Room image generated!",
        toast_img_fail: "Image generation failed.",
        toast_img_disabled: "Enable & configure room images in settings first.",
        // scan / key matching
        scan_keywords: ["open", "enter", "inside", "let you", "come in", "welcome", "unlock"],
        key_words: ["key", "pick", "lockpick"],
    },
    ru: {
        toast_restored: "Карта локаций восстановлена из резервной копии чата!",
        toast_designing: "ИИ-архитектор проектирует структуру карты...",
        toast_designed: "Структура карты успешно создана!",
        toast_gen_fail: "ИИ не смог сгенерировать карту.",
        toast_describing: "ИИ описывает комнату...",
        toast_desc_done: "Описание комнаты сгенерировано!",
        toast_desc_fail: "Ошибка ИИ при описании комнаты.",
        toast_building_region: "ИИ строит новый регион...",
        toast_region_done: "Регион успешно создан ИИ!",
        toast_ai_failed: "Запрос к ИИ не удался.",
        toast_pick_success: "Чудо! Замок поддался отмычке!",
        toast_pick_fail: "Взлом не удался! Замок заклинило ещё сильнее ({n}/2).",
        toast_key_success: "Замок поддался! Дверь открыта.",
        toast_key_fail: "Попытка не удалась! Предмет сломался.",
        toast_scan_success: "Персонаж впустил вас!",
        toast_scan_fail: "В последних 5 сообщениях персонаж не давал доступ к этой комнате.",
        toast_solo_enter: "Вы вошли в «{name}» ОДИН. Теперь ИИ отыгрывает мир!",
        toast_return: "Вы вернулись к персонажу.",
        toast_exported: "Файл карты экспортирован!",
        toast_imported: "Вкладки карты успешно импортированы!",
        toast_import_bad: "Неверный формат файла карты.",
        toast_import_err: "Ошибка чтения файла.",
        default_new_region: "Новый регион",
        prompt_block_name: "Введите название нового региона (Блок):",
        confirm_ai_fill_region: "Хотите, чтобы ИИ автоматически заполнил регион локациями и комнатами?",
        prompt_loc_name: "Введите название локации:",
        prompt_room_name: "Введите название комнаты:",
        confirm_room_locked: "Сделать комнату запертой?\n[OK] – Да (Заперта)\n[Отмена] – Нет (Открыта)",
        confirm_delete_element: "Вы уверены, что хотите удалить этот элемент?",
        confirm_force_regen: "Вы уверены? Текущая карта чата будет стёрта, и создана новая по настройкам ИИ.",
        confirm_regen: "Вы уверены? Текущая карта будет стёрта, и создана новая с помощью ИИ.",
        prompt_tab_name: "Введите название новой вкладки карты (например, Ли Юэ или Хампстед):",
        confirm_ai_tab: "Хотите, чтобы ИИ автоматически построил эту вкладку из лора?",
        prompt_tab_directions: "Опишите, что это за место (ИИ построит по нему карту):\n[Например: Хампстед, загородная вилла]",
        confirm_tab_delete: "Удалить вкладку карты «{name}» и все её регионы?",
        prompt_rename_tab: "Переименовать вкладку карты:",
        prompt_rename_block: "Переименовать регион:",
        prompt_rename_loc: "Переименовать локацию:",
        prompt_rename_room: "Переименовать комнату:",
        info_switched: "Открыта вкладка «{name}». Выберите комнату на карте.",
        info_select_room: "Выберите комнату на карте, чтобы осмотреть её или переместиться.",
        status_locked: "Заперто 🔒",
        status_open: "Открыто 🔓",
        desc_locked: "Комната заперта. Откройте её предметами или по сюжету.",
        desc_empty: "[Описания пока нет. Сгенерируйте его ИИ или напишите вручную.]",
        btn_open_door: "Открыть дверь",
        ph_ai_prompt: "Необязательная подсказка для генерации ИИ...",
        btn_gen_desc: "Сгенерировать описание (ИИ)",
        btn_regen_desc: "Перегенерировать описание (ИИ)",
        btn_edit_manual: "Редактировать вручную",
        btn_call_char: "Позвать персонажа сюда",
        btn_move_alone: "Переместиться сюда одному",
        btn_return_char: "Вернуться к персонажу",
        btn_go_together: "Пойти вместе с персонажем",
        btn_go_alone: "Пойти одному (Исследовать)",
        mus_on: 'Играть музыку', mus_vol: 'Громкость музыки',
        mus_hint: 'Пишется такт за тактом прямо во время игры — не зацикливается и не кончается. Настроение угадывается по комнате; своё выбирается в шапке карты, а если вещь не подошла — брось кубик.',
        mus_mood: 'Настроение для этой комнаты', mus_auto: 'По комнате', mus_reroll: 'Другая вещь',
        mus_now: 'Музыка: {what} — клик, чтобы выключить',
        mus_brief: 'Сказать словами, что тут должно играть',
        mus_brief_ask: 'Что должно играть в этой комнате?\nХватит нескольких слов — уют, камин, романтика, ночь.',
        mus_brief_now: 'Ты просила: {text}', mus_noroom: 'Сначала зайди в комнату',
        mus_compose: 'Пусть модель напишет вещь под эту сцену',
        mus_save: 'Сохранить эту вещь в библиотеку', mus_saveas: 'Название вещи:',
        mus_saved: 'Сохранено в библиотеку', mus_nothing: 'Пока ничего не играет',
        mus_lib: 'Сохранённые вещи', mus_ai: 'написано для этой комнаты', mus_piece: 'вещь',
        mus_composed: 'Написано', mus_failed: 'Не удалось написать — проверь URL / ключ / модель.',
        mus_badjson: 'Ответ не годится, оставляю то, что играло.',
        mus_nokey: 'Нет API-ключа — писать некому.',
        mus_lines: 'Реплик сцены читать:',
        mus_prompt: 'Промпт композитора', mus_reset: 'Вернуть по умолчанию',
        mus_prompt_hint: 'Уходит по кнопке 🎼. Возвращает числа — темп, тональность, аккорды — и всё это проверяется и зажимается в границы перед игрой, так что странный ответ может испортить вещь, но не звук.',
        mus_horror: 'здесь кто-то есть', mus_danger: 'за тобой идут', mus_quest: 'дорога вперёд', mus_woodland: 'старый лес', mus_survival: 'ещё живой', mus_intimate: 'тихая близость', mus_romance: 'почти сказано вслух', mus_space: 'холод снаружи', mus_vampire: 'учтивый и мёртвый',
        mus_cafe: 'тёплая комната', mus_noir: 'что-то не так', mus_tender: 'нежное',
        mus_sad: 'тихая печаль', mus_tense: 'на нерве', mus_grand: 'торжественное', mus_curious: 'размышление',
        amb_h: 'Атмосфера', amb_on: 'Озвучивать комнаты',
        amb_hint: 'Синтезируется прямо в браузере — ни файлов, ни загрузок, ни лицензий. Что играет, выбирается по названию и описанию комнаты.',
        amb_vol: 'Громкость', amb_room: 'Звуки комнаты', amb_pad: 'Гудеть фоном, когда музыка выключена',
        amb_pad_hint: 'Это замена музыке, а не добавка: звучит только пока музыка выключена, и по умолчанию выключено.',
        amb_street: 'мостовая', amb_traffic: 'машины', amb_forest: 'лес', amb_pad: 'мягкий фон', amb_storm: 'гроза', amb_clock: 'часы', amb_birds: 'птицы', amb_river: 'вода',
        amb_machine: 'механизмы', amb_bells: 'колокола', amb_snow: 'снег',
        amb_brief: 'Сказать словами, что тут должно быть слышно',
        amb_brief_ask: 'Что должно быть слышно в этой комнате?\nХватит нескольких слов — часы, дождь за окном, огонь.',
        mus_del: 'Удалить эту сохранённую вещь', mus_del_ask: 'Удалить «{name}» из библиотеки?',
        mus_deleted: 'Удалено',
        amb_nomatch: 'Не понял, как это должно звучать — выбери из списка.',
        amb_pick: 'Звук этой комнаты', amb_auto: 'По комнате', amb_none: 'Тишина',
        amb_now: 'Атмосфера: {what} — клик, чтобы выключить', amb_off: 'Атмосфера выключена — клик, чтобы включить',
        mus_off: 'Музыка выключена — клик, чтобы включить',
        amb_rain: 'дождь', amb_fire: 'огонь', amb_sea: 'море', amb_crowd: 'гомон',
        amb_night: 'ночь', amb_cave: 'капель', amb_wind: 'ветер', amb_room_p: 'тихая комната',
        amb_test: 'Послушать',
        btn_set_here: "📍 Мы уже здесь (без сообщения)",
        btn_here_mini: "Мы здесь",
        btn_save: "Сохранить",
        btn_cancel: "Отмена",
        unlock_title: "Как открыть дверь?",
        unlock_attempts: "Попыток взлома: {n}/2",
        unlock_use_key: "Использовать: {name} ({chance}% успеха)",
        unlock_broken: "Использовать: {name} (Замок сломан)",
        unlock_ask_char: "Спросить персонажа (сканировать чат)",
        unlock_force: "Попытаться выбить замок (шанс 10%)",
        enc_tag: "Внезапное событие",
        enc_default_situation: "Что-то шевелится, стоит вам войти в {name}...",
        enc_default_success: "Вы реагируете вовремя и сохраняете преимущество.",
        enc_default_fail: "Вы среагировали на миг позже — и всё пошло плохо.",
        enc_items_title: "Использовать предмет, чтобы получить преимущество?",
        enc_instructions: "Дождитесь, пока кнопка станет зелёной, и жмите как можно быстрее!",
        enc_wait: "Ждите...",
        enc_react: "ЖМИ!",
        enc_early: "Слишком рано! Вы дёрнулись раньше времени.",
        enc_send: "Отправить в чат",
        enc_item_outcome: "Используя {item}, вы оборачиваете ситуацию в свою пользу. {success}",
        enc_skip: "Пропустить",
        solo_title: "Исследование · в одиночку",
        solo_at: "Вы находитесь в:",
        set_header: "RPG Map Engine (Карты)",
        set_enable: "Включить карты локаций",
        set_language: "Язык интерфейса",
        set_api: "🔌 Настройки API",
        set_url: "URL",
        set_key: "API-ключ",
        set_model: "Модель",
        set_depth: "Глубина внедрения карты:",
        set_event_chance: "Шанс случайного события (0–1):",
        set_scan: "📖 Сканирование лора ИИ при постройке",
        set_use_card: "Использовать карточку персонажа",
        set_use_lore: "Использовать лорбук",
        set_saves: "💾 Сохранения",
        set_export: "Экспорт вкладок (JSON)",
        set_export_full: "Экспорт вкладок + картинки (всё)",
        set_import: "Импорт вкладок (JSON)",
        toast_bundling: "Упаковываю картинки в файл...",
        toast_export_fail: "Ошибка экспорта.",
        set_force_regen: "Полностью перегенерировать карту ИИ",
        modal_title: "Карта местности",
        btn_editor: "⚙️ Редактор",
        tree_add_block: "Добавить регион (Блок)",
        tree_regen: "Перегенерировать ИИ",
        title_add_loc: "Добавить локацию",
        title_del_region: "Удалить регион",
        title_add_room: "Добавить комнату",
        title_del_loc: "Удалить локацию",
        title_del_room: "Удалить комнату",
        title_rename: "Переименовать",
        title_lock_open: "Открыть дверь вручную",
        title_lock_close: "Запереть дверь вручную",
        title_new_tab: "Создать новую вкладку карты",
        title_rename_tab: "Двойной клик — переименовать",
        sys_travel: "*[Система: Путешествие из {old} в {new}. Расстояние: {dist}. Время: {time}. Игрок отправляется в путь. {char}, отреагируй на нашу дорогу и путешествие!]*",
        sys_go_alone: "*Я отправляюсь один исследовать «{name}».*",
        sys_go_together: "*[Мы вместе входим в комнату «{name}». Описание комнаты: {desc}. Опиши наше прибытие сюда.]*",
        sys_end_solo: "*Я закончил исследовать «{name}» в одиночку и вернулся к тебе. (Персонаж не знает точно, что там произошло, но может догадываться и расспрашивать). Отыграй нашу встречу!*",
        sys_encounter: "*[Скрытое событие в {name}: {situation} Итог: {outcome}]*",
        travel_default_distance: "небольшое расстояние",
        travel_default_time: "некоторое время",
        default_room: "Обычная комната",
        ai_lang_names: "Все названия должны быть на русском языке и соответствовать заданной теме/сеттингу.",
        ai_lang_text: "Пиши на русском языке.",
        inject_solo_lang: "Пиши строго на русском языке, держи описательный и атмосферный тон.",
        // room images
        img_section: "🖼️ Изображения комнат (ИИ)",
        img_enable: "Включить ИИ-изображения комнат",
        img_api_url: "URL API изображений",
        img_mode: "Тип API изображений",
        img_mode_auto: "Автоопределение",
        img_mode_openai: "OpenAI images (/images/generations)",
        img_mode_openrouter: "OpenRouter / chat image (nano-banana, grok)",
        img_api_key: "Ключ API изображений",
        img_model: "Модель изображений",
        img_size: "Размер (например, 1024x576)", img_size_custom: "Пресет размера (или впиши свой ниже)",
        img_style: "Стиль",
        img_time: "Время суток (по умолчанию)",
        img_weather: "Погода (по умолчанию)",
        img_frame: "Рамка фото",
        img_frame_plain: "Обычная",
        img_frame_worn: "Потёртое аниме-фото",
        img_template: "Шаблон промпта — плейсхолдеры: {ROOM} {STYLE} {TIME} {WEATHER} {SIZE}",
        set_sync_bg: "Менять фон чата при входе в комнату",
        set_save_bg: "Также сохранять генерации в папку фонов (эксперим.)",
        btn_pick_image: "Выбрать картинку из файла",
        toast_bg_uploaded: "Изображение сохранено в папку фонов.",
        toast_bg_upload_fail: "Не удалось сохранить в папку фонов (эксперим.).",
        btn_gen_image: "Сгенерировать изображение (ИИ)",
        btn_regen_image: "Перегенерировать изображение (ИИ)",
        btn_remove_image: "Удалить изображение",
        toast_img_generating: "ИИ рисует комнату...", img_generating_status: "Генерирую изображение...",
        toast_img_done: "Изображение комнаты готово!",
        toast_img_fail: "Не удалось сгенерировать изображение.",
        toast_img_disabled: "Сначала включите и настройте изображения комнат в настройках.",
        scan_keywords: ["открой", "открыл", "войди", "входи", "внутрь", "внутри", "впуск", "заходи", "добро пожаловать", "проходи", "отпер"],
        key_words: ["ключ", "отмычк", "ключик", "key", "pick"],
    }
};

function langObj() { return I18N[settings.language] || I18N.en; }
function t(key, vars) {
    let str = langObj()[key];
    if (str === undefined) str = I18N.en[key];
    if (str === undefined) str = key;
    if (typeof str === 'string' && vars) {
        for (const k in vars) str = str.split(`{${k}}`).join(vars[k]);
    }
    return str;
}

const defaultSettings = {
    enabled: false,
    language: 'en',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: '',
    model: 'google/gemma-4-31b-it',
    temperature: 0.8,
    injectDepth: 1,
    scanCard: true,
    scanLore: false,
    eventChance: 0.25, // chance of a hidden random event when entering a location
    images: {
        enabled: false,
        mode: 'auto',      // 'auto' | 'openai' | 'openrouter'
        apiUrl: '',        // OpenAI-images-compatible base, or OpenRouter base
        apiKey: '',
        model: '',
        size: '1280x720',  // 16:9; a 1024-wide picture stretched over a whole screen looks soft
        style: 'modern anime setting, clean semi-realistic detail, neon and natural light',
        timeOfDay: 'night with moonlight and candlelight, dark atmosphere',
        weather: 'clear weather',
        frame: 'worn',     // 'plain' | 'worn'
        syncBackground: false,   // change chat background when entering a room
        saveToBgFolder: false,   // (experimental) upload generated images to ST backgrounds/
        template: 'Generate a background scene: an empty location with no characters and no people. Anime visual novel background, detailed digital painting of {ROOM}. Setting style: {STYLE}. Time of day: {TIME}. Weather: {WEATHER}. Wide establishing shot, 16:9 aspect ratio (about {SIZE}), no people, no characters, empty scene, highly detailed environment, atmospheric depth, soft volumetric cinematic lighting.'
    },
    mapStates: {},
    mapStamps: {}   // chatId -> last-used timestamp, lets stale map states be pruned
};

let settings = {};

// Escape user/AI-provided names before inserting them into HTML. Names come
// from the AI and from prompt() — a quote or "<" in a room name used to break
// the markup (and was an injection vector via steered AI output).
function escapeHtml(x) {
    return String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function cloneState(s) { try { return JSON.parse(JSON.stringify(s)); } catch (e) { return s; } }

// ============================================================
// CHAT OWNERSHIP (same pattern as the Tavern engine)
// Async AI calls can finish AFTER the user switched chats; without this guard
// generateMapFromLore would write a map built from the OLD chat's lore into
// the NEW chat's state.
// ============================================================
let mapChatId = null;   // the chat mapState in memory actually belongs to
function ownsChat(id) { return !!(id && mapChatId === id && getContext().chatId === id); }

function freshMapState() {
    return {
        maps: [{ name: "Main", blocks: [] }],
        activeMapIndex: 0,
        activeBlockIndex: 0,
        activeSubloc: null,
        isSolo: false,
        soloHistoryCount: 0,
        mapGenerated: false,
        isEditMode: false,
    strictJson: true,
    ambience: { enabled: false, volume: 40, room: true, padAlt: false, music: true, musicVol: 55, prompt: '', sceneLines: 1, library: [] }
    };
}
let mapState = freshMapState();

function loadSettings() {
    if (!extension_settings[MODULE_NAME]) extension_settings[MODULE_NAME] = {};
    settings = Object.assign({}, defaultSettings, extension_settings[MODULE_NAME]);
    if (!settings.mapStates) settings.mapStates = {};
    if (!settings.mapStamps) settings.mapStamps = {};
    // deep-merge the nested images object so a saved config keeps future defaults
    settings.images = Object.assign({}, defaultSettings.images, extension_settings[MODULE_NAME].images || {});
    // heal NaN/garbage saved from empty number inputs by older builds
    if (!Number.isFinite(settings.injectDepth)) settings.injectDepth = defaultSettings.injectDepth;
    if (!Number.isFinite(settings.eventChance)) settings.eventChance = defaultSettings.eventChance;
}

// Per-chat map states used to live in settings forever, bloating settings.json.
// States untouched for STATE_TTL days are dropped; they remain recoverable from
// the rpg_map_checkpoint backup written into the chat itself.
const STATE_TTL_MS = 60 * 24 * 60 * 60 * 1000; // 60 days
function pruneOldStates() {
    const now = Date.now();
    let changed = false;
    for (const id of Object.keys(settings.mapStates)) {
        if (!settings.mapStamps[id]) { settings.mapStamps[id] = now; changed = true; continue; } // migrate
        if (now - settings.mapStamps[id] > STATE_TTL_MS) {
            delete settings.mapStates[id];
            delete settings.mapStamps[id];
            changed = true;
        }
    }
    for (const id of Object.keys(settings.mapStamps)) {
        if (!settings.mapStates[id]) { delete settings.mapStamps[id]; changed = true; }
    }
    if (changed) saveSettings();
}
function saveSettings() {
    extension_settings[MODULE_NAME] = settings;
    if (typeof saveSettingsDebounced === 'function') saveSettingsDebounced();
}

function isGroupChat() {
    return !!selected_group;
}

function loadMapState() {
    const context = getContext();
    const chatId = context.chatId;
    if (!chatId) { mapChatId = null; return; }

    mapChatId = chatId;   // claim the chat: async work from a previous chat may no longer save
    if (!settings.mapStamps) settings.mapStamps = {};
    settings.mapStamps[chatId] = Date.now();   // touch: keeps this chat's state from being pruned

    if (settings.mapStates[chatId]) {
        mapState = settings.mapStates[chatId];
    } else {
        const chat = context.chat;
        let restored = false;
        if (chat && chat.length > 0) {
            for (let i = chat.length - 1; i >= 0; i--) {
                if (chat[i].extra && chat[i].extra.rpg_map_checkpoint) {
                    // copy: never share a live object with the chat file (same fix
                    // as the Tavern engine). Sharing meant every checkpoint pointed
                    // at ONE object, so a branch restore returned the LATEST map
                    // instead of a point-in-time snapshot.
                    mapState = cloneState(chat[i].extra.rpg_map_checkpoint);
                    settings.mapStates[chatId] = mapState;
                    saveSettings();
                    restored = true;
                    toastr.success(t('toast_restored'));
                    break;
                }
            }
        }

        if (!restored) {
            mapState = freshMapState();
            settings.mapStates[chatId] = mapState;
        }
    }

    // migrate legacy shape (flat blocks -> maps[])
    if (!mapState.maps) {
        mapState.maps = [{ name: "Main", blocks: mapState.blocks || [] }];
        mapState.activeMapIndex = 0;
        delete mapState.blocks;
        saveMapState();
    }
    if (mapState.activeBlockIndex === undefined) mapState.activeBlockIndex = 0;

    // heal any corrupted room data (bad desc/name/image from past AI errors)
    let healed = false;
    (mapState.maps || []).forEach(map => (map.blocks || []).forEach(b => (b.locations || []).forEach(l => (l.sublocs || []).forEach(s => { if (normalizeSubloc(s)) healed = true; }))));
    if (healed) saveMapState();

    // Re-link activeSubloc to the live tree object. After a page reload the
    // deserialized activeSubloc is a DETACHED COPY — editing the room in the
    // tree then no longer updated the desc used by the solo injection.
    if (mapState.activeSubloc && mapState.activeSubloc.name) {
        let linked = null;
        (getActiveBlocks() || []).forEach(b => (b.locations || []).forEach(l => (l.sublocs || []).forEach(s => {
            if (!linked && s.name === mapState.activeSubloc.name) linked = s;
        })));
        if (linked) mapState.activeSubloc = linked;
    }

    // Auto-build only when the AI is actually configured; otherwise every chat
    // open produced an error toast forever.
    if (!mapState.mapGenerated && apiKey() && context.chat && context.chat.length > 0) {
        generateMapFromLore();
    }
    renderMapTree();
    updateContextInjection();
    updateSoloBar();
    if (mapState.activeSubloc) applyRoomBackground(mapState.activeSubloc);
}

function saveMapState() {
    const context = getContext();
    const chatId = context.chatId;
    if (!chatId) return;
    if (mapChatId && chatId !== mapChatId) return;   // state belongs to a chat we left — never cross-write
    settings.mapStates[chatId] = mapState;
    if (!settings.mapStamps) settings.mapStamps = {};
    settings.mapStamps[chatId] = Date.now();
    saveSettings();

    const chat = context.chat;
    if (chat && chat.length > 0) {
        const lastMsg = chat[chat.length - 1];
        if (!lastMsg.extra) lastMsg.extra = {};
        // Backup as a COPY, never a live reference (a live ref made all
        // checkpoints in the chat point at one mutating object).
        lastMsg.extra.rpg_map_checkpoint = cloneState(mapState);
        saveChatDebounced();
    }
}

function getActiveBlocks() {
    if (!mapState.maps[mapState.activeMapIndex]) {
        mapState.maps[mapState.activeMapIndex] = { name: "Main", blocks: [] };
    }
    if (!mapState.maps[mapState.activeMapIndex].blocks) {
        mapState.maps[mapState.activeMapIndex].blocks = [];
    }
    return mapState.maps[mapState.activeMapIndex].blocks;
}

// Smart API
/* ============================================================
   AMBIENCE — synthesised, not sampled
   ------------------------------------------------------------
   No audio files ship with this and none are downloaded. Everything you hear is
   built on the fly out of filtered noise and a few oscillators, which means it
   costs nothing, never repeats itself, and carries no licence.

   Two layers, either of which can be silenced on its own:
     · the room    — rain, fire, wind, sea, a crowd, crickets, dripping stone
     · the mood    — a slow chord pad underneath, in a scale chosen by the place

   The room's own words decide what plays: a description mentioning a hearth gets
   fire, one mentioning gulls gets sea. Nothing to tag by hand unless you want to.
   ============================================================ */

const AMB = {
    ctx: null,
    master: null,
    roomGain: null,
    padGain: null,
    nodes: [],          // everything currently making sound, so it can be stopped
    padTimer: null,
    current: '',        // which profile is playing
    started: false
};

/* ---------- the palettes ----------
   Keywords are matched against the room's name and description in both languages.
   First match wins, so the more specific profiles are listed first. */
const AMB_PROFILES = [
    {
        id: 'rain', icon: '🌧️',
        words: ['rain', 'storm', 'downpour', 'drizzle', 'wet street', 'дожд', 'ливень', 'гроз', 'моросит', 'слякоть'],
        scale: [0, 3, 5, 7, 10], root: 174.61,   // F minor pentatonic — grey and patient
        build: (a) => [a.noise('pink', 0.040, 950, 0.7), a.noise('white', 0.006, 3600, 0.4), a.drip(0.035, 4.2)]
    },
    {
        id: 'fire', icon: '🔥',
        words: ['fire', 'hearth', 'fireplace', 'candle', 'forge', 'kiln', 'огон', 'камин', 'очаг', 'свеч', 'горн', 'кузн', 'печ'],
        scale: [0, 2, 4, 7, 9], root: 196.00,    // G major pentatonic — warm
        build: (a) => [a.noise('brown', 0.10, 900, 0.8), a.crackle(0.16)]
    },
    {
        id: 'sea', icon: '🌊',
        words: ['sea', 'ocean', 'shore', 'harbour', 'harbor', 'dock', 'pier', 'gull', 'ship', 'море', 'морск', 'океан', 'берег', 'гаван', 'причал', 'пристан', 'чайк', 'корабл', 'палуб'],   // not 'мор': it swallowed 'мороз'
        scale: [0, 2, 5, 7, 9], root: 146.83,    // D — open and rolling
        build: (a) => [a.surf(0.085), a.noise('pink', 0.022, 800, 0.5)]
    },
    {
        id: 'crowd', icon: '🍺',
        words: ['tavern', 'inn', 'market', 'bazaar', 'ballroom', 'party', 'crowd', 'feast', 'таверн', 'трактир', 'рынок', 'базар', 'бальн', 'бал ', 'толп', 'пир', 'кабак', 'зал'],
        scale: [0, 2, 4, 7, 9], root: 220.00,
        build: (a) => [a.murmur(0.09), a.noise('brown', 0.04, 500, 0.5)]
    },
    {
        id: 'forest', icon: '🌲',
        words: ['forest', 'wood', 'grove', 'thicket', 'glade', 'trail', 'pine', 'oak',
            'лесн', 'в лесу', 'лес,', 'лес.', 'лес ', 'чащ', 'бор ', 'роща', 'полян', 'тропа', 'ельник', 'дубрав'],
        scale: [0, 2, 5, 7, 9], root: 155.56,
        build: (a) => [a.leaves(0.075), a.birds(0.05), a.creak(0.07)]
    },
    {
        id: 'night', icon: '🦗',
        // no 'forest'/'лес' here: the woodland palette is more specific and was losing
        // every wooded path to a generic night
        words: ['night', 'garden', 'meadow', 'field', 'ноч', 'сад', 'луг', 'парк'],
        scale: [0, 2, 3, 7, 8], root: 164.81,    // E minor-ish — still and cool
        build: (a) => [a.noise('pink', 0.05, 700, 0.4), a.crickets(0.09)]
    },
    {
        id: 'cave', icon: '💧',
        words: ['cave', 'cellar', 'crypt', 'dungeon', 'tunnel', 'catacomb', 'vault', 'пещер', 'подвал', 'погреб', 'склеп', 'подземел', 'туннел', 'катакомб', 'темниц'],
        scale: [0, 1, 5, 7, 8], root: 110.00,    // low and airless
        build: (a) => [a.noise('brown', 0.07, 320, 0.9), a.drip(0.09, 6.5)]
    },
    {
        id: 'wind', icon: '🌬️',
        words: ['mountain', 'cliff', 'tower', 'battlement', 'moor', 'plain', 'desert', 'roof', 'гор', 'скал', 'башн', 'стен', 'пустош', 'равнин', 'пустын', 'крыш', 'чердак'],
        scale: [0, 2, 4, 7, 11], root: 130.81,
        build: (a) => [a.wind(0.055)]
    },
    {
        id: 'storm', icon: '⛈️',
        words: ['thunder', 'lightning', 'tempest', 'gale', 'гроз', 'гром', 'молни', 'бур', 'шторм', 'ураган'],
        scale: [0, 2, 3, 7, 8], root: 138.59,
        build: (a) => [a.noise('pink', 0.05, 900, 0.7), a.rumble(0.11, 13), a.drip(0.03, 3.6)]
    },
    {
        id: 'clock', icon: '🕰️',
        words: ['clock', 'study at night', 'waiting room', 'parlour', 'часы', 'маятник', 'приёмн', 'приемн', 'ожидан', 'гостин'],
        scale: [0, 2, 4, 7, 9], root: 174.61,
        build: (a) => [a.noise('brown', 0.05, 400, 0.6), a.tick(0.045, 1.0)]
    },
    {
        id: 'birds', icon: '🐦',
        words: ['morning', 'dawn', 'orchard', 'terrace', 'balcony', 'утр', 'рассвет', 'сад утром', 'террас', 'балкон', 'опушк'],
        scale: [0, 2, 4, 7, 9], root: 196.00,
        build: (a) => [a.noise('pink', 0.04, 900, 0.4), a.birds(0.07)]
    },
    {
        id: 'river', icon: '🏞️',
        words: ['river', 'stream', 'brook', 'waterfall', 'well', 'fountain', 'рек', 'ручей', 'поток', 'водопад', 'колодец', 'фонтан', 'мельниц'],
        scale: [0, 2, 5, 7, 9], root: 164.81,
        build: (a) => [a.swell(0.11, 1700, 0.14, 500), a.noise('white', 0.02, 3600, 0.4)]
    },
    {
        id: 'machine', icon: '⚙️',
        words: ['engine', 'boiler', 'factory', 'mill', 'generator', 'ship below', 'lab', 'мотор', 'котельн', 'завод', 'фабрик', 'генератор', 'машинн', 'лаборатор', 'трюм'],
        scale: [0, 1, 3, 6, 8], root: 110.00,
        build: (a) => [a.drone(0.045, 62), a.noise('brown', 0.06, 380, 0.7)]
    },
    {
        id: 'bells', icon: '🔔',
        words: ['church', 'chapel', 'cathedral', 'monastery', 'bell tower', 'церк', 'часовн', 'собор', 'монастыр', 'колокол', 'звонниц'],
        scale: [0, 2, 4, 7, 11], root: 146.83,
        build: (a) => [a.noise('brown', 0.05, 300, 0.9), a.bells(0.10)]
    },
    {
        id: 'snow', icon: '❄️',
        words: ['snow', 'winter', 'frost', 'blizzard', 'ice', 'снег', 'зим', 'мороз', 'метел', 'вьюг', 'лёд', 'лед '],
        scale: [0, 2, 3, 7, 10], root: 155.56,
        build: (a) => [a.wind(0.08), a.noise('white', 0.012, 2200, 0.3)]
    },
    {
        id: 'street', icon: '🐎',
        words: ['street', 'lane', 'square', 'cobble', 'carriage', 'coach', 'cab', 'market street', 'boulevard',
            'улиц', 'мостов', 'площад', 'булыжн', 'карет', 'экипаж', 'извозчик', 'бульвар', 'переулок днём'],
        scale: [0, 2, 4, 7, 9], root: 174.61,
        // hooves and iron-rimmed wheels on stone, with voices too far off to make out
        build: (a) => [a.noise('brown', 0.045, 520, 0.6), a.hooves(0.09), a.murmur(0.045)]
    },
    {
        id: 'traffic', icon: '🚗',
        words: ['traffic', 'highway', 'motorway', 'city street', 'downtown', 'intersection', 'siren',
            'трасс', 'шоссе', 'проспект', 'перекрёст', 'перекрест', 'центр город', 'сирен', 'машин'],
        scale: [0, 1, 3, 7, 8], root: 116.54,
        build: (a) => [a.drone(0.03, 48), a.passby(0.10), a.noise('brown', 0.05, 420, 0.6)]
    },
    {
        id: 'pad', icon: '🎐',
        // The old drone, kept on purpose: sometimes a scene wants air under it and
        // nothing that sounds like a place. Chosen by hand or by the model, never by
        // accident — it used to play under everything and muddy every piece.
        words: [],
        scale: [0, 2, 5, 7, 9], root: 146.83,
        build: (a) => [a.swell(0.055, 620, 0.05, 260), a.noise('brown', 0.025, 300, 0.6)]
    },
    {
        id: 'room', icon: '🕯️',                  // the fallback: an interior, quiet
        words: [],
        scale: [0, 2, 4, 7, 9], root: 174.61,
        build: (a) => [a.noise('brown', 0.055, 420, 0.6)]
    }
];

/* Short Latin keys must match whole words. "cat" lives inside "cat-like" harmlessly,
   but also inside "delicate"; "ice" inside "voice"; "tea" inside "entertaining"; "well"
   inside "swell". Cyrillic keys stay substring matches on purpose — Russian inflects,
   so "лесн" has to catch "лесную", and its stems are long enough not to collide. */
function wordHit(hay, key) {
    const k = String(key || '').toLowerCase();
    if (!k) return false;
    if (/[\u0400-\u04FF]/.test(k)) return hay.includes(k);      // Cyrillic: as before
    if (k.length > 5 || /\s/.test(k)) return hay.includes(k);    // long or multi-word: safe
    let i = hay.indexOf(k);
    while (i !== -1) {
        const before = i === 0 ? ' ' : hay[i - 1];
        const after = (i + k.length >= hay.length) ? ' ' : hay[i + k.length];
        if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) return true;
        i = hay.indexOf(k, i + 1);
    }
    return false;
}

function ambPickProfile(sub, locName, blockName) {
    if (!sub) return null;
    // Your choice first, then the model's, then the words. "auto" means you have not
    // chosen, which is exactly when the model is allowed to.
    if (sub.ambience === 'off') return null;
    if (sub.ambience && sub.ambience !== 'auto') {
        return AMB_PROFILES.find(p => p.id === sub.ambience) || null;
    }
    if (sub.ambienceAI) {
        if (sub.ambienceAI === 'off') return null;
        const m = AMB_PROFILES.find(p => p.id === sub.ambienceAI);
        if (m) return m;
    }
    const hay = [sub.name, sub.desc, locName, blockName].filter(Boolean).join(' ').toLowerCase();
    for (const p of AMB_PROFILES) {
        if (!p.words.length) continue;
        if (p.words.some(w => wordHit(hay, w))) return p;
    }
    return AMB_PROFILES[AMB_PROFILES.length - 1];
}

/* ---------- the workshop ---------- */
function ambTools(ctx, dest) {
    const now = () => ctx.currentTime;

    // Noise is the backbone of every natural sound. Two seconds of it, looped, with
    // the spectrum shaped by the type: white hisses, pink rustles, brown rumbles.
    function noiseBuffer(kind) {
        const len = ctx.sampleRate * 2;
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, last = 0;
        for (let i = 0; i < len; i++) {
            const w = Math.random() * 2 - 1;
            if (kind === 'white') d[i] = w;
            else if (kind === 'pink') {
                b0 = 0.99765 * b0 + w * 0.0990460;
                b1 = 0.96300 * b1 + w * 0.2965164;
                b2 = 0.57000 * b2 + w * 1.0526913;
                d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.25;
            } else {
                last = (last + 0.02 * w) / 1.02;
                d[i] = last * 3.5;
            }
        }
        return buf;
    }

    function noise(kind, gain, cutoff, q) {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer(kind);
        src.loop = true;
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass'; f.frequency.value = cutoff; f.Q.value = q || 0.6;
        const g = ctx.createGain(); g.gain.value = gain;
        src.connect(f).connect(g).connect(dest);
        src.start();
        return { stop: () => { try { src.stop(); } catch (e) { } }, gain: g };
    }

    // Slow swells: the sea, and the breath of wind. One oscillator far below hearing
    // opens and closes a filter, which is what makes it sound alive rather than looped.
    function swell(gain, cutoff, rate, depth) {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer('pink'); src.loop = true;
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass'; f.frequency.value = cutoff; f.Q.value = 0.9;
        const lfo = ctx.createOscillator(); lfo.frequency.value = rate;
        const lfoGain = ctx.createGain(); lfoGain.gain.value = depth;
        lfo.connect(lfoGain).connect(f.frequency);
        const g = ctx.createGain(); g.gain.value = gain;
        src.connect(f).connect(g).connect(dest);
        src.start(); lfo.start();
        return { stop: () => { try { src.stop(); lfo.stop(); } catch (e) { } }, gain: g };
    }
    const surf = (gain) => swell(gain, 700, 0.09, 420);
    const wind = (gain) => swell(gain, 900, 0.06, 620);

    // Scattered one-off events — a raindrop, a spark, a cricket. Scheduled with a
    // random gap so no pattern ever emerges.
    function scatter(make, minGap, maxGap) {
        let live = true, timer = null;
        const tick = () => {
            if (!live) return;
            try { make(); } catch (e) { }
            timer = setTimeout(tick, (minGap + Math.random() * (maxGap - minGap)) * 1000);
        };
        timer = setTimeout(tick, Math.random() * maxGap * 1000);
        return { stop: () => { live = false; clearTimeout(timer); } };
    }

    function ping(freq, gain, decay, type) {
        const o = ctx.createOscillator(); o.type = type || 'sine'; o.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, now());
        g.gain.linearRampToValueAtTime(gain, now() + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, now() + decay);
        o.connect(g).connect(dest);
        o.start(); o.stop(now() + decay + 0.05);
    }

    const drip = (gain, gap) => scatter(() => {
        ping(700 + Math.random() * 900, gain * (0.5 + Math.random() * 0.5), 0.28);
    }, gap * 0.4, gap);

    const crackle = (gain) => scatter(() => {
        const src = ctx.createBufferSource();
        const len = Math.floor(ctx.sampleRate * 0.05);
        const b = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 5);
        src.buffer = b;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass';
        f.frequency.value = 900 + Math.random() * 2200; f.Q.value = 1.4;
        const g = ctx.createGain(); g.gain.value = gain * (0.3 + Math.random());
        src.connect(f).connect(g).connect(dest); src.start();
    }, 0.12, 0.9);

    const crickets = (gain) => scatter(() => {
        const base = 3800 + Math.random() * 900;
        for (let k = 0; k < 3; k++) setTimeout(() => ping(base, gain * 0.5, 0.045, 'triangle'), k * 70);
    }, 0.7, 3.2);

    // A crowd is not voices, it is the shape of voices: brown noise pushed through a
    // wandering band-pass until it reads as a room full of people two doors away.
    function murmur(gain) {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer('brown'); src.loop = true;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass';
        f.frequency.value = 480; f.Q.value = 1.1;
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.23;
        const lg = ctx.createGain(); lg.gain.value = 190;
        lfo.connect(lg).connect(f.frequency);
        const g = ctx.createGain(); g.gain.value = gain;
        src.connect(f).connect(g).connect(dest);
        src.start(); lfo.start();
        return { stop: () => { try { src.stop(); lfo.stop(); } catch (e) { } }, gain: g };
    }

    // A low swell that arrives and leaves — distant thunder, or something heavy
    // moving elsewhere in the building.
    const rumble = (gain, gap) => scatter(() => {
        const src = ctx.createBufferSource();
        const len = Math.floor(ctx.sampleRate * (1.4 + Math.random() * 2.2));
        const b = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = b.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) {
            last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
            d[i] = last * 3.5 * Math.sin(Math.PI * i / len);
        }
        src.buffer = b;
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 160;
        const g = ctx.createGain(); g.gain.value = gain * (0.5 + Math.random());
        src.connect(f).connect(g).connect(dest); src.start();
    }, gap * 0.5, gap);

    // A steady tone with a slow wobble: machinery, a generator, a ship's engine.
    function drone(gain, freq) {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = freq;
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq * 4; f.Q.value = 3;
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.13;
        const lg = ctx.createGain(); lg.gain.value = freq * 0.03;
        lfo.connect(lg).connect(o.frequency);
        const g = ctx.createGain(); g.gain.value = gain;
        o.connect(f).connect(g).connect(dest);
        o.start(); lfo.start();
        return { stop: () => { try { o.stop(); lfo.stop(); } catch (e) { } }, gain: g };
    }

    // Regular, unlike everything else here: a clock is unsettling precisely because
    // it does not vary.
    function tick(gain, period) {
        let live = true, k = 0;
        const step = () => {
            if (!live) return;
            ping(1400 + (k % 2) * 260, gain, 0.035, 'square');
            k++;
            setTimeout(step, period * 1000);
        };
        setTimeout(step, 200);
        return { stop: () => { live = false; } };
    }

    const birds = (gain) => scatter(() => {
        const base = 2200 + Math.random() * 1600;
        const n = 2 + Math.floor(Math.random() * 3);
        for (let k = 0; k < n; k++) setTimeout(() => ping(base * (1 + Math.random() * 0.25), gain, 0.09, 'sine'), k * 110);
    }, 1.6, 6.5);

    const bells = (gain) => scatter(() => {
        const f = 320 + Math.random() * 180;
        ping(f, gain, 2.4, 'sine');
        setTimeout(() => ping(f * 1.5, gain * 0.5, 1.9, 'sine'), 90);
    }, 14, 38);

    // Two beats close together, then a pause: a horse is not a metronome, and the
    // unevenness is what makes it read as an animal rather than a machine.
    const hooves = (gain) => scatter(() => {
        const n = 2 + Math.floor(Math.random() * 3);
        for (let k = 0; k < n; k++) setTimeout(() => {
            const src = ctx.createBufferSource();
            const len = Math.floor(ctx.sampleRate * 0.06);
            const b = ctx.createBuffer(1, len, ctx.sampleRate);
            const d = b.getChannelData(0);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
            src.buffer = b;
            const f = ctx.createBiquadFilter(); f.type = 'bandpass';
            f.frequency.value = 180 + Math.random() * 260; f.Q.value = 2.2;
            const g = ctx.createGain(); g.gain.value = gain * (0.6 + Math.random() * 0.5);
            src.connect(f).connect(g).connect(dest); src.start();
        }, k * (170 + Math.random() * 90));
    }, 1.1, 4.5);

    // Something drives past: a filter sweeping up and back down again.
    const passby = (gain) => scatter(() => {
        const src = ctx.createBufferSource();
        const dur = 1.6 + Math.random() * 1.4;
        const len = Math.floor(ctx.sampleRate * dur);
        const b = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = b.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) {
            last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
            d[i] = last * 3.5 * Math.sin(Math.PI * i / len);
        }
        src.buffer = b;
        const f = ctx.createBiquadFilter(); f.type = 'lowpass';
        const now2 = ctx.currentTime;
        f.frequency.setValueAtTime(300, now2);
        f.frequency.linearRampToValueAtTime(1500, now2 + dur * 0.5);
        f.frequency.linearRampToValueAtTime(280, now2 + dur);
        const g = ctx.createGain(); g.gain.value = gain * (0.5 + Math.random() * 0.6);
        src.connect(f).connect(g).connect(dest); src.start();
    }, 2.5, 9);

    // Leaves: high noise that swells and settles, never steady.
    const leaves = (gain) => swell(gain, 2600, 0.11, 900);

    // A tree complaining somewhere behind you.
    const creak = (gain) => scatter(() => {
        const o = ctx.createOscillator(); o.type = 'sawtooth';
        const w = ctx.currentTime, dur = 0.5 + Math.random() * 0.6;
        o.frequency.setValueAtTime(90 + Math.random() * 60, w);
        o.frequency.linearRampToValueAtTime(140 + Math.random() * 90, w + dur);
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 7;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, w);
        g.gain.linearRampToValueAtTime(gain, w + dur * 0.4);
        g.gain.linearRampToValueAtTime(0, w + dur);
        o.connect(f).connect(g).connect(dest);
        o.start(w); o.stop(w + dur + 0.05);
    }, 6, 20);

    return { noise, surf, wind, drip, crackle, crickets, murmur, ping, scatter, swell, rumble, drone, tick, birds, bells, hooves, passby, leaves, creak };
}

/* ---------- the pad ----------
   Three sine voices a fifth and an octave apart, fading in and out on their own
   clocks. Not a tune — a colour. Slow enough that you stop noticing it, which is
   the whole point of music under a scene. */
function ambStartPad(profile) {
    const ctx = AMB.ctx;
    const voice = (semi, when, dur) => {
        const f = profile.root * Math.pow(2, semi / 12);
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 1.005; // gentle beating
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, when);
        g.gain.linearRampToValueAtTime(0.09, when + dur * 0.4);
        g.gain.linearRampToValueAtTime(0, when + dur);
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100;
        o.connect(g); o2.connect(g); g.connect(lp).connect(AMB.padGain);
        o.start(when); o2.start(when); o.stop(when + dur + 0.1); o2.stop(when + dur + 0.1);
    };
    const step = () => {
        const t = ctx.currentTime + 0.1;
        const s = profile.scale;
        voice(s[Math.floor(Math.random() * s.length)], t, 9 + Math.random() * 5);
        voice(s[Math.floor(Math.random() * s.length)] + 12, t + 2 + Math.random() * 3, 8 + Math.random() * 4);
        if (Math.random() < 0.5) voice(s[0] - 12, t, 12);
    };
    step();
    AMB.padTimer = setInterval(step, 11000);
}

/* ---------- control ---------- */
function ambStop() {
    AMB.nodes.forEach(n => { try { n && n.stop && n.stop(); } catch (e) { } });
    AMB.nodes = [];
    if (AMB.padTimer) { clearInterval(AMB.padTimer); AMB.padTimer = null; }
    // Voices already scheduled keep ringing on their own; drop the pad's gain so a
    // switched-off layer actually falls silent instead of finishing its last chord.
    if (AMB.padGain && AMB.ctx) {
        AMB.padGain.gain.cancelScheduledValues(AMB.ctx.currentTime);
        AMB.padGain.gain.setTargetAtTime(0.0001, AMB.ctx.currentTime, 0.2);
    }
    AMB.current = '';
}

function ambSetVolumes() {
    if (!AMB.ctx) return;
    const s = settings.ambience || {};
    const master = Math.max(0, Math.min(1, (s.volume ?? 40) / 100));
    AMB.master.gain.setTargetAtTime(master, AMB.ctx.currentTime, 0.4);
    AMB.roomGain.gain.setTargetAtTime(s.room === false ? 0 : 1, AMB.ctx.currentTime, 0.4);
    AMB.padGain.gain.setTargetAtTime((s.padAlt === true && s.music === false) ? 0.55 : 0, AMB.ctx.currentTime, 0.4);
}

// Browsers refuse to make a sound until the person has clicked something. The context
// is therefore created on the first real interaction, not at load.
function ambEnsureCtx() {
    if (AMB.ctx) { if (AMB.ctx.state === 'suspended') AMB.ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    AMB.ctx = new AC();
    AMB.master = AMB.ctx.createGain();
    AMB.roomGain = AMB.ctx.createGain();
    AMB.padGain = AMB.ctx.createGain();
    AMB.roomGain.connect(AMB.master);
    AMB.padGain.connect(AMB.master);
    AMB.master.connect(AMB.ctx.destination);
    ambSetVolumes();
    return true;
}

function ambPlayFor(sub, locName, blockName) {
    const s = settings.ambience || {};
    if (!s.enabled) { ambStop(); return; }
    const profile = ambPickProfile(sub, locName, blockName);
    if (!profile) { ambStop(); return; }
    if (!ambEnsureCtx()) return;
    if (AMB.current === profile.id) return;      // already the right air; do not restart it

    ambStop();
    AMB.current = profile.id;
    const tools = ambTools(AMB.ctx, AMB.roomGain);
    AMB.nodes = profile.build(tools) || [];
    // The pad is a second harmonic layer, and the composer is the first. Two of them
    // in different keys is what made every new piece sound like the old one still
    // droning underneath. The pad is therefore a stand-in for when music is off.
    // Opt-in, and only as a STAND-IN for music. It used to be on by default and to
    // start the moment music was switched off, so turning music off appeared to leave
    // music playing — which is exactly what it sounded like.
    if (s.padAlt === true && s.music === false) ambStartPad(profile);
    AMB.started = true;
    ambUpdateBadge(profile);
    if (settings.debug) console.log('[RPG Map] ambience:', profile.id);
}

function ambCurrentProfileId() { return AMB.current; }
/* ============================================================
   MUSIC — written on the spot, not looped
   ------------------------------------------------------------
   The ambience above is texture: rain, fire, a crowd. This is the other thing —
   an actual piece, with chords underneath and a melody over them, in the manner
   of a visual novel: a celesta, a soft bass, a pad, nothing in a hurry.

   It is generated bar by bar, so it never reaches an end and never repeats a
   loop point. Twenty minutes or two hours, it simply keeps going, and the same
   room sounds a little different every evening.

   If a piece does not suit the scene, reroll it: the seed changes, and with it
   the progression, the melody's turns and the voicing. The choice is remembered
   on the room, so that café is always that café.
   ============================================================ */

const MUS = {
    ctx: null, out: null, gain: null,
    timer: null, live: false,
    mood: null, seed: 1, bar: 0, rng: null,
    prog: null, degree: 0, lastMel: 0
};

// A tiny deterministic generator, so one seed always gives the same piece back.
function musRng(seed) {
    // Mix the seed first and then discard a few rounds. Raw xorshift gives nearly the
    // same first value for neighbouring seeds, which is why twelve different rolls
    // came out in the same key: the very first number decided it, and it barely moved.
    let s = (seed >>> 0) || 1;
    s ^= s >>> 16; s = Math.imul(s, 2246822507) >>> 0;
    s ^= s >>> 13; s = Math.imul(s, 3266489909) >>> 0;
    s ^= s >>> 16; s = s || 1;
    for (let i = 0; i < 8; i++) { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; }
    return () => {
        s ^= s << 13; s >>>= 0;
        s ^= s >> 17;
        s ^= s << 5; s >>>= 0;
        return s / 4294967296;
    };
}

/* ---------- the moods ----------
   Chords are semitone offsets from the root plus the intervals stacked on top.
   Major sevenths and ninths read as warm and unhurried; minor sevenths and a
   flattened fifth read as a room where someone is lying to you. */
const CH = {
    maj7: [0, 4, 7, 11], min7: [0, 3, 7, 10], maj9: [0, 4, 7, 11, 14],
    min9: [0, 3, 7, 10, 14], dom7: [0, 4, 7, 10], dim: [0, 3, 6, 9],
    sus2: [0, 2, 7, 12], sus4: [0, 5, 7, 12], min6: [0, 3, 7, 9], maj: [0, 4, 7], min: [0, 3, 7],
    // for the three below: a major seventh over a minor triad is the sound of something
    // beautiful that is also wrong, and a bare fifth with an added ninth is emptiness
    minMaj7: [0, 3, 7, 11], maj7s11: [0, 4, 6, 11], add9: [0, 7, 14], quintal: [0, 7, 14, 21],
    halfdim: [0, 3, 6, 10], aug: [0, 4, 8], min11: [0, 3, 7, 10, 17],
    // horror: a bare tritone, a semitone cluster, and two minor triads a tritone apart.
    // None of these want to resolve anywhere; that is the entire point of them.
    tritone: [0, 6], cluster: [0, 1, 6], dread: [0, 3, 6, 7], far: [0, 6, 15, 18]
};

const MUS_MOODS = [
    {
        id: 'cafe', drums: 'walk', leadHold: true, timbre: 'wood', meter: '4', icon: '☕', root: 261.63, tempo: [64, 76],
        scale: [0, 2, 4, 5, 7, 9, 11],
        // ii–V–I with a wandering step: the sound of somewhere you are welcome to sit
        progs: [
            [[2, 'min7'], [7, 'dom7'], [0, 'maj9'], [9, 'min7']],
            [[0, 'maj9'], [9, 'min7'], [5, 'maj7'], [7, 'dom7']],
            [[5, 'maj7'], [0, 'maj9'], [2, 'min7'], [7, 'dom7']]
        ],
        melody: 0.75, arp: 0.9, bassOct: -2, bright: 2200
    },
    {
        id: 'noir', drums: 'soft', leadHold: true, timbre: 'felt', meter: '4', icon: '🕯️', root: 220.00, tempo: [50, 60], octave: 0,
        scale: [0, 2, 3, 5, 7, 8, 10],
        // minor, sparse, with a diminished chord that never quite resolves
        progs: [
            [[0, 'min9'], [8, 'maj7'], [5, 'min7'], [7, 'dom7']],
            [[0, 'min7'], [3, 'maj7'], [10, 'dom7'], [0, 'min7']],
            [[0, 'min7'], [11, 'dim'], [8, 'maj7'], [7, 'dom7']]
        ],
        melody: 0.45, arp: 0.5, bassOct: -2, bright: 1500
    },
    {
        id: 'tender', drums: 'none', leadHold: true, timbre: 'celesta', meter: '3', icon: '🌸', root: 293.66, tempo: [56, 66],
        scale: [0, 2, 4, 7, 9],
        progs: [
            [[0, 'maj7'], [7, 'sus2'], [9, 'min7'], [5, 'maj7']],
            [[5, 'maj7'], [7, 'maj'], [0, 'maj9'], [9, 'min7']]
        ],
        melody: 0.7, arp: 0.5, bassOct: -2, bright: 2600
    },
    {
        id: 'sad', drums: 'none', leadHold: true, timbre: 'felt', meter: '3', icon: '🌧️', root: 196.00, tempo: [46, 56],
        scale: [0, 2, 3, 5, 7, 8, 10],
        progs: [
            [[0, 'min7'], [5, 'min7'], [8, 'maj7'], [3, 'maj7']],
            [[0, 'min9'], [10, 'maj7'], [8, 'maj7'], [7, 'sus4']]
        ],
        melody: 0.55, arp: 0.6, bassOct: -2, bright: 1400
    },
    {
        id: 'tense', drums: 'drive', leadHold: false, timbre: 'wood', meter: '5', icon: '🗡️', root: 174.61, tempo: [92, 116], octave: 0,
        scale: [0, 1, 3, 5, 7, 8, 10],
        progs: [
            [[0, 'min'], [0, 'min'], [1, 'maj'], [0, 'min']],
            [[0, 'min7'], [6, 'dim'], [0, 'min7'], [7, 'dom7']]
        ],
        melody: 0.35, arp: 0.95, bassOct: -2, bright: 1800
    },
    {
        id: 'grand', drums: 'soft', leadHold: true, timbre: 'bell', meter: '4', icon: '🏛️', root: 261.63, tempo: [54, 64],
        scale: [0, 2, 4, 5, 7, 9, 11],
        progs: [
            [[0, 'maj'], [5, 'maj7'], [7, 'sus4'], [7, 'maj']],
            [[0, 'maj9'], [3, 'maj7'], [5, 'maj7'], [0, 'maj']]
        ],
        melody: 0.6, arp: 0.7, bassOct: -3, bright: 2400
    },
    {
        id: 'quest', drums: 'walk', leadHold: false, timbre: 'harp', meter: '4', icon: '🗺️',
        root: 196.00, tempo: [84, 98],
        scale: [0, 2, 4, 5, 7, 9, 11],
        // Plain major triads and a walking beat: the sound of a road you are glad to be on.
        progs: [
            [[0, 'maj'], [7, 'maj'], [9, 'min'], [5, 'maj']],
            [[0, 'maj'], [5, 'maj'], [7, 'dom7'], [0, 'maj']],
            [[9, 'min'], [5, 'maj'], [0, 'maj'], [7, 'maj']]
        ],
        melody: 0.85, arp: 0.8, bassOct: -2, bright: 2900
    },
    {
        id: 'woodland', drums: 'soft', leadHold: true, timbre: 'celesta', meter: '6', icon: '🌲',
        root: 174.61, tempo: [62, 74],
        scale: [0, 2, 4, 7, 9],
        // Pentatonic and lilting — old, green, and in no hurry to explain itself.
        progs: [
            [[0, 'sus2'], [5, 'maj'], [7, 'sus4'], [2, 'min7']],
            [[0, 'add9'], [9, 'min7'], [5, 'maj7'], [0, 'sus2']]
        ],
        melody: 0.7, arp: 0.7, bassOct: -2, bright: 2500
    },
    {
        id: 'danger', drums: 'drive', leadHold: false, timbre: 'wood', meter: '5', icon: '⚠️',
        root: 110.00, tempo: [88, 108], octave: 0,
        scale: [0, 1, 3, 5, 6, 8, 10],
        // Phrygian with a flattened fifth, and chords that refuse to be major. Low, fast
        // and repetitive on purpose: this is the sound of being followed.
        progs: [
            [[0, 'min'], [1, 'maj'], [0, 'min'], [6, 'dim']],
            [[0, 'min7'], [0, 'min7'], [1, 'cluster'], [0, 'tritone']],
            [[0, 'min'], [6, 'tritone'], [1, 'maj'], [0, 'min']]
        ],
        melody: 0.25, arp: 0.6, bassOct: -1, bright: 900
    },
    {
        id: 'survival', drums: 'soft', leadHold: false, timbre: 'glass', meter: '5', icon: '☣️',
        root: 130.81, tempo: [56, 68], octave: 0,
        scale: [0, 1, 3, 6, 7, 10],
        // Not horror, which is empty — this one has a pulse, because something is still
        // moving and you have to keep moving too. A save room after a corridor.
        progs: [
            [[0, 'min11'], [6, 'halfdim'], [0, 'min7'], [1, 'maj7s11']],
            [[0, 'min7'], [8, 'maj7s11'], [6, 'dread'], [0, 'min11']]
        ],
        melody: 0.3, arp: 0.45, bassOct: -1, bright: 1300
    },
    {
        id: 'intimate', drums: 'none', leadHold: true, timbre: 'felt', meter: '4', icon: '🫧',
        root: 220.00, tempo: [42, 50],
        scale: [0, 2, 4, 7, 9],
        // Warm chords that never resolve, and a melody that is mostly silence: closeness
        // is quiet, and the space between phrases is the point. Softer than romance,
        // which still has something it wants to say.
        progs: [
            [[0, 'maj7'], [9, 'min9'], [5, 'maj7'], [7, 'sus4']],
            [[5, 'maj7'], [0, 'maj9'], [2, 'min7'], [0, 'maj7']],
            [[0, 'add9'], [7, 'sus2'], [9, 'min7'], [5, 'maj7s11']]
        ],
        melody: 0.35, arp: 0.28, bassOct: -2, bright: 1750
    },
    {
        id: 'romance', drums: 'none', leadHold: true, timbre: 'felt', meter: '3', icon: '💗', root: 233.08, tempo: [52, 62],
        scale: [0, 2, 4, 5, 7, 9, 11],
        // the long way round to the tonic: it keeps almost arriving and then not
        progs: [
            [[5, 'maj7'], [7, 'dom7'], [9, 'min7'], [4, 'min7']],
            [[0, 'maj9'], [4, 'min7'], [5, 'maj7'], [7, 'sus4']],
            [[9, 'min7'], [5, 'maj7'], [0, 'maj9'], [7, 'dom7']]
        ],
        melody: 0.8, arp: 0.45, bassOct: -2, bright: 2800
    },
    {
        id: 'space', drums: 'none', leadHold: true, timbre: 'glass', meter: '6', icon: '🌌', root: 130.81, tempo: [38, 46],
        scale: [0, 2, 5, 7, 9],
        // stacked fifths instead of thirds: no major, no minor, nothing to hold on to
        progs: [
            [[0, 'quintal'], [5, 'add9'], [10, 'quintal'], [3, 'add9']],
            [[0, 'add9'], [2, 'quintal'], [7, 'add9'], [0, 'quintal']]
        ],
        melody: 0.4, arp: 0.35, bassOct: -1, bright: 3200
    },
    {
        id: 'vampire', drums: 'waltz', leadHold: true, timbre: 'bell', meter: '3', icon: '🦇', root: 207.65, tempo: [44, 54], octave: 0,
        scale: [0, 1, 4, 5, 7, 8, 11],
        // harmonic minor with a raised seventh, and a minor chord carrying a major
        // seventh: courteous, old, and not quite alive
        progs: [
            [[0, 'minMaj7'], [8, 'maj7'], [7, 'dom7'], [0, 'min7']],
            [[0, 'minMaj7'], [3, 'aug'], [5, 'min7'], [7, 'dom7']],
            [[0, 'min11'], [11, 'halfdim'], [8, 'maj7s11'], [7, 'dom7']]
        ],
        melody: 0.5, arp: 0.6, bassOct: -2, bright: 1600
    },
    {
        id: 'horror', drums: 'none', leadHold: false, timbre: 'wood', meter: '5', icon: '🩸', root: 116.54, tempo: [30, 40], octave: 0,
        scale: [0, 1, 3, 6, 7, 8],
        // Almost no movement: the same dread returns, and the one step it takes is a
        // semitone, which is the smallest and least reassuring step there is.
        progs: [
            [[0, 'dread'], [0, 'dread'], [1, 'cluster'], [0, 'tritone']],
            [[0, 'tritone'], [6, 'far'], [0, 'dread'], [0, 'dread']],
            [[0, 'cluster'], [0, 'dread'], [11, 'tritone'], [0, 'dread']]
        ],
        // no melody at all, and the chord is struck rather than spread: horror is what
        // you hear in the gaps, so the gaps have to be longer than the notes
        melody: 0, arp: 0.18, bassOct: -1, bright: 700, horror: true
    },
    {
        id: 'curious', drums: 'walk', leadHold: false, timbre: 'wood', meter: '4', icon: '🔍', root: 246.94, tempo: [70, 84],
        scale: [0, 2, 3, 5, 7, 9, 10],
        progs: [
            [[0, 'min7'], [5, 'dom7'], [10, 'maj7'], [3, 'maj7']],
            [[0, 'min6'], [7, 'dom7'], [0, 'min7'], [5, 'min7']]
        ],
        melody: 0.65, arp: 0.8, bassOct: -2, bright: 2000
    }
];

/* Which mood a room gets when you have not chosen one. Same idea as the ambience:
   read the room's own words. Cats and cafés are warm; morgues are not. */
const MUS_HINTS = [
    // Romance goes first on purpose: two people on a balcony "under the stars" is not
    // a space scene, and the word alone would have stolen it. The specific beats the
    // atmospheric — everywhere in this list.
    // Action before scenery: a chase down an alley is a chase, and the word
    // "alley" alone was handing every fight to the noir pile.
    ['survival', ['quarantine', 'infected', 'outbreak', 'safe room', 'checkpoint', 'containment', 'facility', 'bunker',
        'карантин', 'заражён', 'заражен', 'вспышк', 'убежищ', 'бункер', 'объект', 'комплекс', 'изолят']],
    ['woodland', ['forest', 'wood', 'grove', 'thicket', 'glade', 'clearing', 'pine', 'elven',
        'лесн', 'в лесу', 'лес,', 'лес.', 'лес ', 'чащ', 'бор ', 'роща', 'полян', 'ельник', 'дубрав', 'эльф']],   // not bare 'лес': it lives inside 'лестница' and was stealing every staircase
    ['quest', ['road', 'trail', 'village', 'town square', 'inn yard', 'caravan', 'guild', 'harbour town', 'market',
        'дорог', 'тропа', 'деревн', 'посёлок', 'поселок', 'караван', 'гильди', 'ярмарк', 'торжищ', 'путь']],
    // Danger before tension: a cellar is a place, being hunted is what is happening,
    // and the place was winning every chase that took place in one.
    ['danger', ['danger', 'hunted', 'stalked', 'cornered', 'trap', 'alarm', 'they are coming', 'closing in',
        // stems, not whole words: "загнали" and "загнан" are the same event, and the
        // longer form was the only one this list knew
        'опасн', 'преслед', 'выслеж', 'загнал', 'загнан', 'ловушк', 'тревог', 'за тобой', 'за ней', 'за ним',
        'настиг', 'зажат', 'в угол', 'бежать', 'убега', 'спасай', 'нашли тебя', 'учуял']],
    ['tense', ['fight', 'chase', 'duel', 'ambush', 'battle', 'escape', 'pursuit', 'combat', 'raid',
        'dungeon', 'cellar', 'prison', 'lair',
        'драк', 'погон', 'схватк', 'дуэл', 'засад', 'сражен', 'побег', 'бой', 'бегств', 'облав',
        'подземел', 'подвал', 'тюрьм', 'темниц', 'логов']],
    ['intimate', ['intimacy', 'embrace', 'alone together', 'close together', 'breath', 'bedchamber', 'after the night',
        'близост', 'наедине', 'вдвоём', 'вдвоем', 'объят', 'дыхан', 'касан', 'опочивальн', 'после ночи']],
    ['romance', ['balcony', 'terrace', 'boudoir', 'candlelit', 'waltz', 'first kiss', 'confession',
        'балкон', 'террас', 'тераcс', 'беседк', 'свидан', 'при свеч', 'вальс', 'вдвоём', 'вдвоем', 'признан']],
    // Blood is not on this list: a crime scene has blood in it far more often than a
    // vampire does, and noir was losing every murder to the bats.
    ['horror', ['horror', 'zombie', 'infected', 'corpse', 'butcher', 'lab', 'quarantine', 'morgue',
        'abandoned', 'derelict', 'flesh', 'monster', 'creature', 'mansion', 'basement lab',
        'ужас', 'зомби', 'заражён', 'заражен', 'труп', 'бойн', 'карантин', 'морг', 'мертвец',
        'заброшен', 'плоть', 'монстр', 'тварь', 'лаборатор ужас', 'особняк', 'резидент']],
    ['vampire', ['vampire', 'coffin', 'fang', 'nosferatu', 'moonlit', 'undead', 'sire',
        'вампир', 'гроб', 'клык', 'упыр', 'полнолун', 'нежить', 'бессмертн']],
    // No bare "stars" and no bare "ship": one belongs to any night sky, the other to
    // the sea. Only what could not be anywhere else.
    ['space', ['spaceship', 'starship', 'space station', 'orbit', 'nebula', 'airlock', 'cockpit',
        'observator', 'zero gravity', 'the void',
        'космос', 'косми', 'орбит', 'туманност', 'шлюз', 'рубк', 'обсерватор', 'невесомост', 'звездолёт', 'звездолет']],
    ['noir', ['crime', 'murder', 'morgue', 'alley', 'interrogat', 'evidence', 'убийств', 'преступ', 'морг', 'переул', 'допрос', 'улик', 'притон']],
    ['curious', ['study', 'library', 'archive', 'laborator', 'office', 'workshop', 'кабинет', 'библиотек', 'архив', 'лаборатор', 'контор', 'мастерск']],
    // not bare 'cat' or 'tea': a cat-like movement is not a cat cafe, and a room is not
    // a tearoom because somebody moved like a cat in it
    ['cafe', ['cafe', 'café', 'coffee', 'teahouse', 'tearoom', 'bakery', 'parlour', 'parlor', 'cat cafe', 'kitten',
        'кафе', 'кофей', 'чайн', 'пекарн', 'кондитер', 'лавк', 'кошач', 'кот']],
    ['tender', ['bedroom', 'garden', 'bath', 'nursery', 'boudoir', 'спальн', 'сад', 'ванн', 'детск', 'будуар', 'оранжере']],
    ['grand', ['hall', 'ballroom', 'cathedral', 'throne', 'manor', 'palace', 'зал', 'бальн', 'собор', 'трон', 'помест', 'дворец', 'усадьб']],
    ['sad', ['grave', 'ruin', 'hospital', 'rain', 'могил', 'руин', 'больниц', 'кладбищ', 'дожд']]
];

function musPickMood(sub, locName, blockName) {
    // A piece pinned from the library wins over everything; then one the model wrote
    // for this room; then a mood chosen by hand; then the words.
    if (sub && sub.music) {
        if (sub.music.mood === 'pin' && sub.music.pin) {
            const e = musPinned(sub.music.pin);
            if (e && e.piece) return e.piece;
        }
        if (sub.music.rolled) return sub.music.rolled;
        if (sub.music.mood === 'ai' && sub.music.ai) return sub.music.ai;
        if (sub.music.mood && sub.music.mood !== 'auto') {
            const m = MUS_MOODS.find(x => x.id === sub.music.mood);
            if (m) return m;
        }
    }
    const hay = [sub && sub.name, sub && sub.desc, locName, blockName].filter(Boolean).join(' ').toLowerCase();
    for (const [id, words] of MUS_HINTS) {
        if (words.some(w => wordHit(hay, w))) return MUS_MOODS.find(m => m.id === id);
    }
    return MUS_MOODS.find(m => m.id === 'tender');
}

/* ---------- the instrument ----------
   A struck tone: two sine partials and a fifth, all decaying fast. Closer to a
   celesta or music box than a piano, which is exactly the register these scenes
   live in — and it stays out of the way of the room noise underneath. */
/* Every piece used one instrument — the same four partials, the same fast decay —
   so a waltz in a cellar and a lullaby in a nursery came out sounding like siblings.
   Five voices now, differing in what harmonics they carry, how hard they start and
   how long they hold. Each mood has its own, and the model may ask for another. */
const TIMBRES = {
    celesta: { parts: [[1, 1], [2, 0.28], [3, 0.1], [4.2, 0.05]], attack: 0.012, decayMul: 1.0 },
    felt: { parts: [[1, 1], [2, 0.12], [2.99, 0.04]], attack: 0.03, decayMul: 1.35 },   // muffled upright
    harp: { parts: [[1, 1], [2, 0.45], [3, 0.22], [5, 0.08]], attack: 0.004, decayMul: 0.7 },
    bell: { parts: [[1, 1], [2.76, 0.35], [5.4, 0.15], [8.1, 0.06]], attack: 0.006, decayMul: 1.8 },
    glass: { parts: [[1, 1], [3, 0.3], [6, 0.12], [9, 0.05]], attack: 0.02, decayMul: 1.5 },
    wood: { parts: [[1, 1], [1.5, 0.2], [2, 0.1]], attack: 0.002, decayMul: 0.45 }        // dry, short
};

function musVoice(freq, when, dur, level, bright, timbre) {
    const ctx = MUS.ctx;
    const T = TIMBRES[timbre] || TIMBRES.celesta;
    const d = dur * T.decayMul;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(level, when + T.attack);
    g.gain.exponentialRampToValueAtTime(0.0001, when + d);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(bright, when);
    lp.frequency.exponentialRampToValueAtTime(Math.max(400, bright * 0.35), when + d);

    // A bell carries partials at 2.76x, 5.4x and 8.1x the note. On a dark setting those
    // land far above the filter and come through as a thin beep with a hum under it —
    // which is exactly what a low, threatening piece must not sound like. Anything that
    // would sit above the tone's own colour is simply not played.
    T.parts.filter(([mult]) => freq * mult <= bright * 1.4).forEach(([mult, amp]) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = freq * mult;
        const og = ctx.createGain(); og.gain.value = amp;
        o.connect(og).connect(g);
        o.start(when); o.stop(when + d + 0.05);
    });
    g.connect(lp).connect(MUS.gain);
}

function musPad(freqs, when, dur, level) {
    const ctx = MUS.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(level, when + dur * 0.35);
    g.gain.linearRampToValueAtTime(0, when + dur);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    freqs.forEach(f => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 1.004;
        o.connect(g); o2.connect(g);
        o.start(when); o2.start(when);
        o.stop(when + dur + 0.1); o2.stop(when + dur + 0.1);
    });
    g.connect(lp).connect(MUS.gain);
}

/* ---------- one bar at a time ---------- */
/* ============================================================
   THE MUSIC ENGINE, SECOND ATTEMPT
   ------------------------------------------------------------
   The first one produced ambient wash, and the reason was structural, not a matter
   of presets. Five things were missing, and all five are here now:

     · a MOTIF — a short phrase that comes back. Music is memorable because it
       repeats itself; a fresh random walk every bar is what "aimless" sounds like.
     · a PULSE — drums. Not decoration: without a beat there is nothing to feel.
     · a LEAD that holds. Every note used to be struck and left to decay, so the
       melody read as someone poking keys. A sustained voice sings instead.
     · a BASS that moves — root, fifth, passing notes, not one note per bar.
     · FORM — an A section and a B section that answer each other, and come back.

   Everything is still synthesised: no files, no downloads, no licences.
   ============================================================ */

const MUS2 = {
    motif: null,        // the phrase, as scale degrees with lengths
    section: 'A',
    barInSec: 0,
    secLen: 4,
    density: 1,         // rises through a section and drops at its start
    lastLead: null
};

/* ---------- a phrase worth repeating ----------
   Short, mostly stepwise, with one leap and one held note. Built once per piece and
   then varied, which is the difference between a tune and a noodle. */
function musMakeMotif(rng, scaleLen, energetic) {
    const n = energetic ? (4 + Math.floor(rng() * 3)) : (3 + Math.floor(rng() * 3));
    const out = [];
    let deg = 2 + Math.floor(rng() * 3);
    const lens = energetic ? [0.5, 0.5, 0.5, 1, 0.25] : [1, 1, 0.5, 1.5, 2];
    for (let i = 0; i < n; i++) {
        const leap = rng() < 0.22;
        deg += leap ? (rng() < 0.5 ? 3 : -3) : (rng() < 0.55 ? 1 : -1);
        deg = Math.max(0, Math.min(scaleLen * 2 - 1, deg));
        out.push({ deg, len: lens[Math.floor(rng() * lens.length)] });
    }
    out[out.length - 1].len = energetic ? 1 : 2;     // phrases end on something longer
    return out;
}

// The same phrase, moved and bent. Repetition alone is dull; repetition with a small
// change is what a listener recognises AND stays interested in.
function musVaryMotif(motif, rng, shift, mode) {
    return motif.map((n, i) => {
        let deg = n.deg + shift;
        if (mode === 'invert') deg = motif[0].deg + shift - (n.deg - motif[0].deg);
        if (mode === 'tail' && i === motif.length - 1) deg += (rng() < 0.5 ? 1 : -1);
        return { deg, len: n.len * (mode === 'stretch' ? 1.5 : 1) };
    });
}

/* ---------- a voice that holds ----------
   Two detuned saws through a low-pass with a real attack and release, plus a slow
   vibrato once the note has settled. This is the singing line; the struck celesta
   stays for arpeggios and accompaniment. */
// The lead ignored the timbre entirely — every piece sang with the same pair of saws,
// which is why they all sounded like siblings no matter what the model chose. Now the
// voice IS the timbre, and three of them do not sustain at all: a harp, a bell and a
// wood block are struck, and pretending otherwise made everything drone.
const LEAD = {
    celesta: { waves: ['triangle', 'sine'], vib: 0.004, cut: 1.5, sustain: true },
    felt: { waves: ['sine', 'triangle'], vib: 0.003, cut: 0.9, sustain: true },
    glass: { waves: ['sine', 'sine'], vib: 0.007, cut: 1.8, sustain: true },
    harp: { sustain: false },
    bell: { sustain: false },
    wood: { sustain: false }
};
function musLeadHolds(timbre) { return (LEAD[timbre] || LEAD.celesta).sustain !== false; }

function musLead(freq, when, dur, level, bright, timbre) {
    const L = LEAD[timbre] || LEAD.celesta;
    const ctx = MUS.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(level, when + 0.05);
    g.gain.setValueAtTime(level, when + Math.max(0.08, dur - 0.12));
    g.gain.linearRampToValueAtTime(0.0001, when + dur);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(Math.min(4000, bright * L.cut), when);
    lp.Q.value = 1.2;

    const vib = ctx.createOscillator(); vib.frequency.value = 5.2;
    const vibG = ctx.createGain(); vibG.gain.value = 0;
    vibG.gain.setValueAtTime(0, when);
    vibG.gain.linearRampToValueAtTime(freq * L.vib, when + Math.min(0.35, dur * 0.5));
    vib.connect(vibG);

    [1, 1.006].forEach((det, i) => {
        const o = ctx.createOscillator();
        o.type = L.waves[i];
        o.frequency.value = freq * det;
        vibG.connect(o.frequency);
        const og = ctx.createGain(); og.gain.value = i ? 0.45 : 0.55;
        o.connect(og).connect(g);
        o.start(when); o.stop(when + dur + 0.08);
    });
    vib.start(when); vib.stop(when + dur + 0.08);
    g.connect(lp).connect(MUS.gain);
}

/* ---------- percussion ----------
   A kick is a pitch falling fast; a hat is filtered noise cut short; a snare is both.
   Cheap to make and the single biggest difference between "ambient" and "a piece". */
function musKick(when, level) {
    const ctx = MUS.ctx;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(120, when);
    o.frequency.exponentialRampToValueAtTime(42, when + 0.09);
    const g = ctx.createGain();
    g.gain.setValueAtTime(level, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);
    o.connect(g).connect(MUS.gain);
    o.start(when); o.stop(when + 0.2);
}
function musHat(when, level, open) {
    const ctx = MUS.ctx;
    const len = Math.floor(ctx.sampleRate * (open ? 0.16 : 0.045));
    const b = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, open ? 2 : 4);
    const src = ctx.createBufferSource(); src.buffer = b;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
    const g = ctx.createGain(); g.gain.value = level;
    src.connect(hp).connect(g).connect(MUS.gain);
    src.start(when);
}
function musSnare(when, level) {
    const ctx = MUS.ctx;
    const len = Math.floor(ctx.sampleRate * 0.14);
    const b = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = ctx.createBufferSource(); src.buffer = b;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 0.8;
    const g = ctx.createGain(); g.gain.value = level;
    src.connect(bp).connect(g).connect(MUS.gain);
    src.start(when);
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 185;
    const og = ctx.createGain();
    og.gain.setValueAtTime(level * 0.5, when);
    og.gain.exponentialRampToValueAtTime(0.0001, when + 0.09);
    o.connect(og).connect(MUS.gain);
    o.start(when); o.stop(when + 0.1);
}

// Which pattern a piece uses. Slow, heavy moods get almost nothing; a town or a
// comedy gets a proper backbeat.
const DRUMS = {
    none: null,
    soft: { kick: [0], hat: [0.5, 1.5, 2.5, 3.5], snare: [], lvl: 0.10 },
    walk: { kick: [0, 2], hat: [0.5, 1, 1.5, 2.5, 3, 3.5], snare: [2], lvl: 0.13 },
    drive: { kick: [0, 1.5, 2.5], hat: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], snare: [1, 3], lvl: 0.16 },
    waltz: { kick: [0], hat: [1, 2], snare: [], lvl: 0.10 }
};

function musDrumBar(m, t0, beat, beats) {
    const kit = DRUMS[m.drums || 'none'];
    if (!kit) return;
    const lvl = kit.lvl * (MUS2.density || 1);
    kit.kick.forEach(b => { if (b < beats) musKick(t0 + b * beat, lvl); });
    kit.snare.forEach(b => { if (b < beats) musSnare(t0 + b * beat, lvl * 0.75); });
    kit.hat.forEach(b => { if (b < beats) musHat(t0 + b * beat, lvl * 0.32, false); });
}

// Rhythm was the other half of the sameness: every bar was four beats with the bass
// on one and the chord spread evenly across it. A waltz, a limping six-eight and a
// bar of almost nothing make two pieces in the same key sound unrelated.
const METERS = { '4': 4, '3': 3, '6': 3, '5': 5 };
const FIGURES = [
    [0, 0.5, 1, 1.5],          // even
    [0, 0.75, 1.5, 2.25],      // lilting
    [0, 0.25, 1, 2],           // front-loaded
    [0, 1, 1.5, 3],            // sparse and late
    [0, 0.5, 0.75, 2, 2.5]     // a small run
];

function musBar() {
    if (!MUS.live) return;
    const m = MUS.mood, r = MUS.rng, ctx = MUS.ctx;
    if (!MUS.bpm) MUS.bpm = m.tempo[0] + r() * (m.tempo[1] - m.tempo[0]);
    const beat = 60 / MUS.bpm;
    const beats = METERS[String(m.meter || '4')] || 4;
    const barLen = beat * beats;
    const t0 = ctx.currentTime + 0.08;

    /* ---- form: A A B A, and the density lifts across each section ---- */
    if (MUS2.barInSec >= MUS2.secLen) {
        MUS2.barInSec = 0;
        MUS2.section = MUS2.section === 'A' ? (r() < 0.6 ? 'A2' : 'B') : 'A';
    }
    const sec = MUS2.section;
    MUS2.density = 0.75 + (MUS2.barInSec / Math.max(1, MUS2.secLen)) * 0.45;

    const [deg, kind] = MUS.prog[MUS.degree % MUS.prog.length];
    const chord = CH[kind] || CH.maj7;
    const rootHz = m.root * Math.pow(2, deg / 12);
    const notes = chord.map(iv => rootHz * Math.pow(2, iv / 12));

    /* ---- horror keeps its own empty bar ---- */
    if (m.horror) {
        if (r() < 0.55) musVoice(notes[Math.floor(r() * notes.length)] * (r() < 0.5 ? 1 : 0.5),
            t0 + beat * (r() * 2), barLen * (1.2 + r()), 0.10, 620, m.timbre);
        if (r() < 0.2) {
            const src = ctx.createBufferSource();
            const len = Math.floor(ctx.sampleRate * (0.5 + r() * 0.7));
            const b = ctx.createBuffer(1, len, ctx.sampleRate);
            const d = b.getChannelData(0);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / len);
            src.buffer = b;
            const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
            bp.frequency.value = 300 + r() * 1500; bp.Q.value = 9;
            const g = ctx.createGain(); g.gain.value = 0.05 + r() * 0.05;
            src.connect(bp).connect(g).connect(MUS.gain);
            src.start(t0 + r() * beat * 2);
        }
        MUS.degree++; MUS.bar++; MUS2.barInSec++;
        MUS.timer = setTimeout(musBar, barLen * 1000);
        return;
    }

    // Calm is decided before anything is played: no beat driving it, and slow.
    const calm = (m.drums === 'none' || m.drums === 'soft') && MUS.bpm < 76;

    /* ---- drums ---- */
    musDrumBar(m, t0, beat, beats);

    /* ---- bass that moves ----
       Root, then the fifth or a passing tone. One note per bar was half the reason
       nothing ever felt like it was going anywhere. */
    const bassF = rootHz * Math.pow(2, m.bassOct);
    if (calm) {
        musLead(bassF, t0, barLen * 0.95, 0.10, 560);
    } else {
    musVoice(bassF, t0, beat * 0.9, 0.20, 620, 'felt');
    if (beats >= 4) {
        musVoice(bassF, t0 + beat * 2, beat * 0.8, 0.15, 620, 'felt');
        if (r() < 0.5) musVoice(notes[2] * Math.pow(2, m.bassOct), t0 + beat * 3, beat * 0.7, 0.12, 620, 'felt');
    } else if (r() < 0.7) {
        musVoice(notes[2] * Math.pow(2, m.bassOct), t0 + beat * (beats - 1), beat * 0.7, 0.12, 620, 'felt');
    }
    }

    /* ---- accompaniment ----
       A calm piece is one with no beat driving it, and there the plucked scatter is
       exactly what made romance sound mechanical: a chord chopped into equal pieces,
       bar after bar. Those pieces hold the chord instead, softly, and let it breathe. */
    if (calm) {
        notes.slice(0, 3).forEach((f, i) => {
            musLead(f, t0 + i * beat * 0.18 + r() * 0.04, barLen * (0.9 + r() * 0.25),
                0.055 * MUS2.density, Math.min(2200, m.bright));
        });
        if (r() < 0.5) musVoice(notes[notes.length - 1] * 2, t0 + beat * (1 + r()), beat * 2, 0.05, m.bright, m.timbre);
    } else if (r() < m.arp) {
        const order = sec === 'B' ? notes.slice().reverse() : notes;
        const step = beats >= 4 ? 0.5 : 1;
        order.forEach((f, i) => {
            const at = (i * step + (sec === 'A2' ? 0.5 : 0)) * beat;
            if (at >= barLen - beat * 0.1) return;
            musVoice(f, t0 + at, beat * 1.1, 0.085 * MUS2.density, m.bright, m.timbre);
        });
    }

    /* ---- the tune ----
       The motif, moved to sit on the current chord, and varied a little each time it
       comes back. The B section answers with the same shape inverted. */
    if (m.melody > 0.05 && MUS2.motif) {
        // Literal repetition every bar is what turns a motif into a beep. The phrase
        // still returns, but each return is displaced, stretched or has its tail bent.
        const shift = sec === 'B' ? 2 : (sec === 'A2' ? 1 : 0);
        const modes = [null, 'tail', 'stretch', 'tail'];
        const mode = sec === 'B' ? 'invert' : modes[MUS.degree % modes.length];
        const phrase = musVaryMotif(MUS2.motif, r, shift, mode);
        const sc = m.scale;
        let at = (MUS.degree % 3 === 1) ? 0.5 : 0;      // the phrase does not always start on one
        for (const n of phrase) {
            if (at >= beats) break;
            // Octave placement is part of the mood: a threat sings in the register it
            // threatens from. Bright moods sit an octave up, dark ones stay down.
            const oct = (typeof m.octave === 'number') ? m.octave : 1;
            const semi = sc[((n.deg % sc.length) + sc.length) % sc.length] + 12 * (oct + Math.floor(n.deg / sc.length));
            const f = m.root * Math.pow(2, semi / 12);
            // Rubato, gently: a played phrase never lands exactly on the grid, and
            // that tiny drift is most of what separates "performed" from "sequenced".
            const dur = n.len * beat * (calm ? 1.25 : 0.95);
            const drift = calm ? (r() - 0.5) * 0.09 : 0;
            if (r() < m.melody + 0.25) {
                const when = t0 + at * beat + drift;
                if (m.leadHold !== false && musLeadHolds(m.timbre) && (n.len >= 1 || calm))
                    musLead(f, when, dur, calm ? 0.12 : 0.13, m.bright, m.timbre);
                else musVoice(f, when, dur, 0.15, m.bright, m.timbre);
            }
            at += n.len;
        }
    }

    MUS.degree++; MUS.bar++; MUS2.barInSec++;
    if (MUS.degree % (MUS.prog.length * 2) === 0 && r() < 0.35) {
        MUS.prog = m.progs[Math.floor(r() * m.progs.length)];
    }
    MUS.timer = setTimeout(musBar, barLen * 1000);
}

function musStop(fade) {
    MUS.live = false;
    if (MUS.timer) { clearTimeout(MUS.timer); MUS.timer = null; }
    if (fade && MUS.gain && MUS.ctx) MUS.gain.gain.setTargetAtTime(0.0001, MUS.ctx.currentTime, 0.35);
}

function musStart(sub, locName, blockName) {
    const s = settings.ambience || {};
    // The controls have to be refreshed on every path through here, including the two
    // early exits below. They were only refreshed from the reroll and mood handlers,
    // so walking into a room left them invisible — and there is no way to reach the
    // reroll button when the reroll button is what is hidden.
    if (!s.enabled || s.music === false) { musStop(); musUpdateBadge(); return; }
    if (!ambEnsureCtx()) { musUpdateBadge(); return; }
    MUS.ctx = AMB.ctx;
    if (!MUS.gain) {
        MUS.gain = MUS.ctx.createGain();
        MUS.gain.connect(AMB.master);
    }
    MUS.gain.gain.setTargetAtTime((s.musicVol ?? 55) / 100, MUS.ctx.currentTime, 0.5);

    const mood = musPickMood(sub, locName, blockName);
    const seed = (sub && sub.music && sub.music.seed) || musSeedFrom(sub);
    // Identity is id + stamp + seed. Comparing the id alone meant every composed piece
    // was "ai" and every pinned one "saved", so a new one was mistaken for the one
    // already playing and never started.
    if (MUS.live && MUS.mood && MUS.mood.id === mood.id
        && (MUS.mood.stamp || 0) === (mood.stamp || 0) && MUS.seed === seed) { musUpdateBadge(); return; }

    musStop();
    MUS.mood = mood; MUS.seed = seed;
    MUS.rng = musRng(seed);
    MUS.bpm = 0;
    MUS2.section = 'A'; MUS2.barInSec = 0; MUS2.secLen = 4;
    MUS2.motif = musMakeMotif(MUS.rng, (mood.scale || [0, 2, 4, 7, 9]).length,
        (mood.tempo && mood.tempo[0] >= 72) || (mood.drums === 'drive'));
    MUS.prog = mood.progs[Math.floor(MUS.rng() * mood.progs.length)];
    MUS.degree = 0; MUS.lastMel = 3; MUS.bar = 0;
    MUS.live = true;
    if (MUS.gain) {
        MUS.gain.gain.cancelScheduledValues(MUS.ctx.currentTime);
        MUS.gain.gain.setValueAtTime(0.0001, MUS.ctx.currentTime);
        MUS.gain.gain.setTargetAtTime((s.musicVol ?? 55) / 100, MUS.ctx.currentTime + 0.15, 0.6);
    }
    musBar();
    musUpdateBadge();
    if (settings.debug) console.log('[RPG Map] music:', mood.id, 'seed', seed);
}

function musSeedFrom(sub) {
    const str = (sub && sub.name) || 'room';
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) || 1;
}

// "Not this one" — a new seed on the same room, remembered so it stays changed.
/* The dice used to change only the seed, which re-rolled the melody's wandering and
   nothing else — same chords, same key, same tempo, same drums. That is why it read
   as "the same piece starting again". It now rebuilds the piece itself: a new key, a
   reordered progression, a different tempo, and often another instrument and beat.
   No request is made — this is all local arithmetic on what is already playing. */
function musMutate(base, rng) {
    const p = JSON.parse(JSON.stringify({
        id: base.id, root: base.root, tempo: base.tempo, scale: base.scale, progs: base.progs,
        melody: base.melody, arp: base.arp, bassOct: base.bassOct, bright: base.bright,
        horror: !!base.horror, timbre: base.timbre, meter: base.meter, drums: base.drums,
        leadHold: base.leadHold, name: base.name
    }));
    p.id = 'rolled'; p.icon = '🎲'; p.stamp = Date.now();

    // a different key — a fourth, a fifth, a third away, never the same one
    const steps = [2, 3, 4, 5, 7, 8, 9];
    p.root = base.root * Math.pow(2, steps[Math.floor(rng() * steps.length)] / 12);
    if (p.root > 400) p.root /= 2;
    if (p.root < 100) p.root *= 2;

    // the same chords, entered from somewhere else, sometimes shortened
    const prog = (base.progs && base.progs[0]) ? base.progs[0].slice() : [[0, 'min7'], [7, 'dom7']];
    const cut = Math.floor(rng() * prog.length);
    let rolled = prog.slice(cut).concat(prog.slice(0, cut));
    if (rolled.length > 3 && rng() < 0.4) rolled = rolled.slice(0, rolled.length - 1);
    p.progs = [rolled];

    const mid = (base.tempo[0] + base.tempo[1]) / 2;
    const t = Math.max(30, Math.min(120, mid * (0.82 + rng() * 0.4)));
    p.tempo = [Math.round(t * 0.97), Math.round(t * 1.03)];

    // stay inside the family: a struck instrument stays struck, a singing one sings
    const struck = ['wood', 'harp', 'bell'], sung = ['celesta', 'felt', 'glass'];
    const fam = struck.includes(base.timbre) ? struck : sung;
    if (rng() < 0.7) p.timbre = fam[Math.floor(rng() * fam.length)];

    if (!base.horror && rng() < 0.6) {
        const kits = base.drums === 'none' ? ['none', 'soft'] : ['soft', 'walk', 'drive', 'waltz'];
        p.drums = kits[Math.floor(rng() * kits.length)];
        if (p.drums === 'waltz') p.meter = '3';
        else if (p.meter === '3' && rng() < 0.5) p.meter = '4';
    }
    p.bright = Math.max(400, Math.min(4000, base.bright * (0.8 + rng() * 0.5)));
    p.arp = Math.max(0, Math.min(1, base.arp + (rng() - 0.5) * 0.35));
    return p;
}

function musReroll() {
    const sub = mapState.activeSubloc;
    if (!sub) return;
    if (!sub.music) sub.music = { mood: 'auto', seed: 0 };
    sub.music.seed = (Math.random() * 4294967295) >>> 0;
    const base = musPickMood(sub);
    if (base) sub.music.rolled = musMutate(base, musRng(sub.music.seed));
    saveMapState();
    musStop(true);
    musStart(sub);
    musUpdateBadge();
}

function musSetMood(id) {
    const sub = mapState.activeSubloc;
    if (!sub) return;
    if (!sub.music) sub.music = { mood: 'auto', seed: 0 };
    delete sub.music.rolled;   // a deliberate choice clears the dice
    sub.music.mood = id;
    saveMapState();
    musStop(true);
    musStart(sub);
    musUpdateBadge();
}

// The room's own sound, chosen by hand. Auto reads the description; anything else
// simply plays, because sometimes you want rain indoors.
function ambRefreshPicker() {
    const sel = document.getElementById('rpg-amb-pick');
    if (!sel) return;
    const s = settings.ambience || {};
    if (!s.enabled) { sel.style.display = 'none'; return; }
    sel.style.display = '';
    const sub = mapState.activeSubloc || null;
    if (!sub) {
        if (sel.dataset.sig !== 'noroom') {
            sel.innerHTML = `<option value="auto">${t('mus_noroom')}</option>`;
            sel.dataset.sig = 'noroom';
        }
        sel.disabled = true;
        return;
    }
    sel.disabled = false;
    if (document.activeElement === sel) return;
    const cur = sub.ambience || 'auto';
    const aiPick = sub.ambienceAI;
    const aiLabel = aiPick && aiPick !== 'off'
        ? (AMB_PROFILES.find(p => p.id === aiPick) || {}).icon + ' ' + t(aiPick === 'room' ? 'amb_room_p' : 'amb_' + aiPick)
        : (aiPick === 'off' ? t('amb_none') : '');
    const html = `<option value="auto">${t('amb_auto')}${aiLabel ? ' — ' + escapeHtml(aiLabel) : ''}</option>`
        + `<option value="off">➖ ${t('amb_none')}</option>`
        + AMB_PROFILES.map(p => `<option value="${p.id}">${p.icon} ${t(p.id === 'room' ? 'amb_room_p' : 'amb_' + p.id)}</option>`).join('');
    const sig = html + '|' + cur;
    if (sel.dataset.sig !== sig) { sel.innerHTML = html; sel.dataset.sig = sig; }
    sel.value = cur;
}

// Words instead of a list. The engine has fifteen palettes; saying "a clock, rain
// outside" is faster than finding them, and it is the same brief the composer reads.
async function ambAskBrief() {
    const sub = mapState.activeSubloc;
    if (!sub) { toastr.info(t('mus_noroom')); return; }
    const myChat = getContext().chatId;
    const val = prompt(t('amb_brief_ask'), sub.ambienceBrief || '');
    if (val === null) return;
    sub.ambienceBrief = String(val).trim().slice(0, 200);
    // Match the words against every palette's own keywords, then against its name.
    if (!sub.ambienceBrief) {
        sub.ambience = 'auto';
    } else {
        const hay = sub.ambienceBrief.toLowerCase();
        let hit = AMB_PROFILES.find(p => p.words.some(w => wordHit(hay, w)));
        if (!hit) hit = AMB_PROFILES.find(p => hay.includes(String(t(p.id === 'room' ? 'amb_room_p' : 'amb_' + p.id)).toLowerCase()));
        // No word matched — that used to mean the pencil silently did nothing. Ask the
        // model; it only has to pick one name from a list, so it is a tiny call.
        if (!hit && apiKey()) {
            try {
                const ids = AMB_PROFILES.map(p => p.id).concat('off');
                const out = await callAI(
                    'You choose the background sound of a room. Reply with ONE word from this list and nothing else:\n'
                    + ids.join(', ') + '\n"off" means silence.',
                    'The author wants: ' + sub.ambienceBrief + '\nThe room: ' + [sub.name, sub.desc].filter(Boolean).join(' — '));
                const pickId = String((out && (out.ambience || out.sound || out.answer || out.id)) || '').trim().toLowerCase();
                if (pickId === 'off') { sub.ambience = 'off'; hit = true; }
                else { const mm = AMB_PROFILES.find(pp => pp.id === pickId); if (mm) hit = mm; }
            } catch (e) { console.warn('[RPG Map] ambience pick failed', e); }
        }
        if (hit && hit !== true) sub.ambience = hit.id;
        else if (!hit) toastr.info(t('amb_nomatch'));
    }
    if (!ownsChat(myChat)) return;   // the pick belongs to the chat that asked for it
    saveMapState();
    AMB.current = '';
    ambPlayFor(sub);
    ambRefreshPicker();
}

function ambSetProfile(id) {
    const sub = mapState.activeSubloc;
    if (!sub) return;
    sub.ambience = id;
    saveMapState();
    if (id === 'off') { ambStop(); ambUpdateBadge(null); }
    else { AMB.current = ''; ambPlayFor(sub); }
    ambRefreshPicker();
}

function musRefreshControls() {
    const s = settings.ambience || {};
    // Two rules learned the hard way:
    //  · never hide a control that is the only way to bring the others back;
    //  · never assume there is an active room. In a chat where nothing has been
    //    entered yet there is none, and reading .music off it threw, which killed
    //    the whole redraw and took the strip with it.
    const on = !!s.enabled;
    const sub = mapState.activeSubloc || null;
    const music = (sub && sub.music) || {};
    const show = (id, visible) => {
        const el = document.getElementById(id);
        if (el) el.style.display = visible ? '' : 'none';
        return el;
    };

    ambRefreshPicker();
    show('rpg-amb-brief', on && !!sub);
    show('rpg-mus-reroll', on && !!sub);
    show('rpg-mus-compose', on && !!sub);
    show('rpg-mus-save', on && !!sub);
    show('rpg-mus-del', on && !!sub && music.mood === 'pin');

    const brf = show('rpg-mus-brief', on && !!sub);
    if (brf && sub) {
        brf.style.opacity = music.brief ? '1' : '0.55';
        brf.title = music.brief ? t('mus_brief_now', { text: music.brief }) : t('mus_brief');
    }

    const sel = document.getElementById('rpg-mus-mood');
    if (!sel) return;
    sel.style.display = on ? '' : 'none';
    if (!on) return;
    if (!sub) {
        // The list stays on screen so the strip does not collapse, but it has nothing
        // to act on until you step into a room.
        const html = `<option value="auto">${t('mus_noroom')}</option>`;
        if (sel.dataset.sig !== 'noroom') { sel.innerHTML = html; sel.dataset.sig = 'noroom'; }
        sel.disabled = true;
        return;
    }
    sel.disabled = false;
    if (document.activeElement === sel) return;

    const cur = music.mood || 'auto';
    const lib = musLibrary();
    const html = `<option value="auto">${t('mus_auto')}</option>`
        + (music.ai ? `<option value="ai">🎼 ${escapeHtml(music.ai.name || t('mus_ai'))}</option>` : '')
        + MUS_MOODS.map(m => `<option value="${m.id}">${m.icon} ${t('mus_' + m.id)}</option>`).join('')
        + (lib.length ? `<optgroup label="${t('mus_lib')}">` + lib.map(p => `<option value="pin:${p.id}">⭐ ${escapeHtml(p.name)}</option>`).join('') + '</optgroup>' : '');
    const want = (cur === 'pin' && music.pin) ? ('pin:' + music.pin) : cur;
    const sig = html + '|' + want;
    if (sel.dataset.sig !== sig) { sel.innerHTML = html; sel.dataset.sig = sig; }
    sel.value = want;
}

const MUS_DEFAULT_PROMPT = `You are a game soundtrack composer. Undertale, Stardew Valley, Zelda, Ace Attorney, anime visual novels — pieces with a tune you can hum, not ambient wallpaper.

Return ONLY JSON, no prose, no markdown, no \`\`\`json:
{"tempo":96,"root":"Eb","scale":[0,2,4,5,7,9,11],"chords":[["I","maj"],["V","dom7"],["vi","min"],["IV","maj"]],"melody":0.85,"arp":0.9,"bright":3200,"timbre":"wood","meter":"4","drums":"walk","ambience":"none","name":"","why":""}

### THE FIVE LEVERS THAT ACTUALLY CHANGE THE SOUND
Nothing else matters half as much as these. Move them HARD between scenes, do not nudge them.

1. drums — the single biggest one.
   "none" = ambient, no pulse at all. Use ONLY for horror, grief, void, and dread.
   "soft" = a quiet heartbeat.
   "walk" = a real backbeat. THE DEFAULT for anything with people in it.
   "drive" = busy and urgent. Chases, fights, panic, comedy.
   "waltz" = three beats, for waltzes and lullabies only.
   If you are unsure, choose "walk". Silence is not neutral — it is a decision to sound like a meditation app.
   BUT: tender, romantic, grieving and intimate scenes take "none" or "soft". A beat under a love scene makes it tick like a clock.

2. timbre — this decides whether the tune is STRUCK or SUNG.
   Struck, no sustain, bright and clear: "wood" (dry, quirky), "harp" (elegant plucks), "bell" (solemn, ringing).
   Sung, held notes with vibrato: "celesta" (clean, magical), "felt" (intimate piano), "glass" (thin, cold).
   Comedy, towns, adventure, anything lively → ALWAYS struck. A held note over a fast beat sounds sleepy.

3. tempo — 30 to 120, and use the whole range.
   88-116 lively · 70-86 walking · 54-68 tender · 34-50 heavy.
   Never write a round number. 97, not 100. 63, not 60.

4. bright — 400 to 4000. 2900-3900 for anything cheerful. 900-1400 for grief. 450-800 for dread.

5. arp — 0.85-0.95 makes bouncing plucks. 0.3-0.5 leaves long held chords. High for lively, low for still.

### CHORDS
Thin chords sound clear; thick chords sound like a wash.
- Lively, funny, warm: "maj", "min", "sus2", "dom7". THREE-NOTE CHORDS. No sevenths and no ninths here — they are what turns a tune into fog.
- Tender, bittersweet: "maj7", "min7", "min6", "add9".
- Uneasy: "sus4", "halfdim", "tritone", "far", "aug".
- Dread: "dim", "cluster", "dread".
Use 3, 5 or 6 chords as often as 4. Rotate keys — Eb, F#, Bb, Db, Ab, not always C or A.

### METER
"4" conversational and steady — the default.
"3" waltz, nostalgia, intimacy.
"6" lilting, dreamy, flowing.
"5" unstable, awkward, tense.

### AMBIENCE UNDER THE MUSIC
"none" whenever the music should stand alone — comedy, towns, action, anything lively.
Otherwise one of: rain, fire, sea, crowd, night, cave, wind, storm, clock, birds, river, machine, bells, snow, room.

### READY-MADE COMBINATIONS
Copy the shape, change the details.
- Comedy / quirky: tempo 104, drums "drive", timbre "wood", chords maj/sus2/min, arp 0.92, bright 3600, melody 0.9, meter "4", ambience "none".
- Town / adventure: tempo 92, drums "walk", timbre "harp", chords maj/dom7/min, arp 0.85, bright 2900, melody 0.85, meter "4", ambience "none".
- Cosy café: tempo 78, drums "walk", timbre "celesta", chords maj7/min7/dom7, arp 0.8, bright 2600, melody 0.75, meter "4", ambience "crowd".
- Romance: tempo 62, drums "none", timbre "felt", chords maj7/min9/maj7s11, arp 0.45, bright 2300, melody 0.8, meter "3", ambience "fire". A love scene must BREATHE — a drum pattern under it turns it into a metronome.
- Grief: tempo 44, drums "none", timbre "felt", chords min7/halfdim/min6, arp 0.4, bright 1100, melody 0.5, meter "4", ambience "rain".
- Detective / thinking: tempo 84, drums "soft", timbre "wood", chords min7/dom7/dim, arp 0.7, bright 2100, melody 0.6, meter "4", ambience "clock".
- Chase / fight: tempo 112, drums "drive", timbre "wood", chords min/dim/cluster, arp 0.95, bright 3200, melody 0.7, meter "5", ambience "none". A fight needs a beat you could run to.
- Adventure / village / road: tempo 92, drums "walk", timbre "harp", chords maj/min/dom7 — plain triads, arp 0.8, bright 2900, melody 0.85, meter "4", ambience "none" or "birds".
- Forest / old magic: tempo 68, drums "soft", timbre "celesta", chords sus2/add9/maj7, arp 0.7, bright 2500, melody 0.7, meter "6", ambience "forest".
- Danger / hunted / cornered: tempo 96, drums "drive", timbre "wood", chords min/dim/tritone/cluster — NEVER major, arp 0.6, bright 900, melody 0.25, meter "5", ambience "none". Low and repetitive: this is being followed, not fighting back. A cheerful chord here ruins the scene outright.
- Survival horror (Resident Evil): tempo 62, drums "soft", timbre "glass", chords min11/halfdim/maj7s11, arp 0.45, bright 1300, melody 0.3, meter "5", ambience "machine" or "none". Unlike pure horror this one keeps a pulse — something is still moving, and so are you.
- Intimacy / closeness: tempo 52, drums "none", timbre "felt", chords maj7/min9/add9/sus4, arp 0.28, bright 1750, melody 0.35, meter "4", ambience "fire" or "none". Quieter and slower than romance, with more silence than notes — the space between phrases is the point.
- Dread / horror: tempo 38, drums "none", timbre "bell", chords dread/tritone/cluster, arp 0.2, bright 600, melody 0, meter "5", ambience "cave".

### THE ONE RULE
Two pieces written for two different scenes must not be swappable. If your answer could belong to any scene, it is wrong — change the drums, change the timbre, change the tempo by twenty, and answer again.

WHAT THE AUTHOR ASKED FOR: {brief}
(If this is not empty it OUTRANKS everything below.)

THE ROOM: {room}
THE SCENE: {scene}
PREVIOUS PIECE FOR THIS ROOM: {previous}
If that is not empty, the author asked again because it did not suit. Do NOT return anything close to it — change the drums, change the timbre, move the tempo by at least fifteen, and choose a different key.

Write a piece with a tune, in {lang} for the name and the reason. Compose for what is happening RIGHT NOW.`;

const NOTE_HZ = { c: 261.63, 'c#': 277.18, db: 277.18, d: 293.66, 'd#': 311.13, eb: 311.13, e: 329.63, f: 349.23, 'f#': 369.99, gb: 369.99, g: 392.00, 'g#': 415.30, ab: 415.30, a: 440.00, 'a#': 466.16, bb: 466.16, b: 493.88 };
const ROMAN = { i: 0, ii: 2, iii: 4, iv: 5, v: 7, vi: 9, vii: 11 };

function musNoteToHz(name) {
    const k = String(name || '').trim().toLowerCase().replace(/\s/g, '');
    const hz = NOTE_HZ[k];
    if (!hz) return null;
    return hz / 2;   // an octave down: this is accompaniment, not a solo
}
function musDegree(d) {
    if (typeof d === 'number' && isFinite(d)) return ((Math.round(d) % 12) + 12) % 12;
    const s = String(d || '').trim().toLowerCase().replace(/[^ivb#]/g, '');
    const flat = s.includes('b') ? -1 : 0;
    const sharp = s.includes('#') ? 1 : 0;
    const r = ROMAN[s.replace(/[b#]/g, '')];
    if (r === undefined) return null;
    return ((r + flat + sharp) % 12 + 12) % 12;
}
const musClamp = (v, lo, hi, dflt) => {
    const n = Number(v);
    return isFinite(n) ? Math.max(lo, Math.min(hi, n)) : dflt;
};

/* Everything the model sends passes through here, and nothing else does. */
function musSanitize(raw, fallback) {
    if (!raw || typeof raw !== 'object') return null;

    const root = musNoteToHz(raw.root) || fallback.root;

    let scale = Array.isArray(raw.scale)
        ? raw.scale.map(n => Math.round(Number(n))).filter(n => isFinite(n) && n >= 0 && n <= 11)
        : [];
    scale = [...new Set(scale)].sort((a, b) => a - b);
    if (scale.length < 3 || scale.length > 8) scale = fallback.scale;
    if (scale[0] !== 0) scale = [0, ...scale.filter(n => n !== 0)];

    const chords = [];
    if (Array.isArray(raw.chords)) {
        for (const c of raw.chords) {
            if (!Array.isArray(c) || c.length < 2) continue;
            const d = musDegree(c[0]);
            const kind = String(c[1] || '').trim();
            if (d === null || !CH[kind]) continue;      // an unknown chord name is dropped, not guessed at
            chords.push([d, kind]);
            if (chords.length >= 6) break;
        }
    }
    if (chords.length < 2) return null;                 // not enough to build a progression on

    const TIM_OK = ['celesta', 'felt', 'harp', 'bell', 'glass', 'wood'];
    const MET_OK = ['4', '3', '6', '5'];
    const DRM_OK = ['none', 'soft', 'walk', 'drive', 'waltz'];
    const AMB_OK = ['rain', 'fire', 'sea', 'crowd', 'night', 'cave', 'wind', 'room', 'none'];
    const amb = AMB_OK.includes(String(raw.ambience || '').trim().toLowerCase())
        ? String(raw.ambience).trim().toLowerCase() : null;

    return {
        id: 'ai',
        icon: '🎼',
        ambience: amb,
        timbre: TIM_OK.includes(String(raw.timbre || '').trim().toLowerCase()) ? String(raw.timbre).trim().toLowerCase() : 'celesta',
        meter: MET_OK.includes(String(raw.meter || '').trim()) ? String(raw.meter).trim() : '4',
        drums: DRM_OK.includes(String(raw.drums || '').trim().toLowerCase()) ? String(raw.drums).trim().toLowerCase() : 'soft',
        leadHold: true,
        root,
        tempo: (() => { const t = musClamp(raw.tempo, 30, 120, 60); return [Math.round(t * 0.94), Math.round(t * 1.06)]; })(),
        scale,
        progs: [chords],
        melody: musClamp(raw.melody, 0, 1, 0.5),
        arp: musClamp(raw.arp, 0, 1, 0.7),
        bassOct: -2,
        bright: musClamp(raw.bright, 400, 4000, 1800),
        horror: musClamp(raw.melody, 0, 1, 0.5) === 0 && musClamp(raw.bright, 400, 4000, 1800) < 900,
        name: String(raw.name || '').slice(0, 60),
        why: String(raw.why || '').slice(0, 200)
    };
}

function musSceneText(n) {
    try {
        const chat = getContext().chat || [];
        return chat.slice(-Math.max(1, n || 1))
            .filter(m => m && !m.is_system)
            .map(m => `${m.name || ''}: ${String(m.mes || '').replace(/\s+/g, ' ').trim()}`)
            .join('\n').slice(0, 2500);
    } catch (e) { return ''; }
}

let musComposing = false;

async function musCompose(sub, silent) {
    if (musComposing) return null;
    const myChat = getContext().chatId;   // the request outlives the chat it was made in
    if (!apiKey()) { if (!silent) toastr.warning(t('mus_nokey')); return null; }
    const room = [sub && sub.name, sub && sub.desc].filter(Boolean).join(' — ') || t('default_room');
    const fallback = musPickMood(sub);
    musComposing = true;
    musSetBusy(true);
    try {
        const prompt = (settings.ambience && settings.ambience.prompt) || MUS_DEFAULT_PROMPT;
        const sys = prompt
            .replace(/\{lang\}/g, settings.language === 'ru' ? 'Russian' : 'English')
            .replace(/\{room\}/g, room)
            .replace(/\{scene\}/g, musSceneText((settings.ambience && settings.ambience.sceneLines) ?? 1) || '(no scene yet)')
            .replace(/\{brief\}/g, (sub && sub.music && sub.music.brief) || '')
            .replace(/\{previous\}/g, (() => {
                const a = sub && sub.music && sub.music.ai;
                if (!a) return '';
                return `tempo ${Math.round((a.tempo[0] + a.tempo[1]) / 2)}, timbre ${a.timbre}, meter ${a.meter}, drums ${a.drums}, bright ${a.bright}, name "${a.name || ''}"`;
            })());
        const out = await callAI(sys, room);
        if (!ownsChat(myChat)) return null;   // chat switched while the model was writing
        const piece = musSanitize(out, fallback);
        if (!piece) { if (!silent) toastr.warning(t('mus_badjson')); return null; }
        if (!sub.music) sub.music = {};
        sub.music.mood = 'ai';
        piece.stamp = Date.now();             // makes every fresh piece a different one to the player

        // The model may choose the room's sound too — but only where you have not.
        // A hand-picked effect is a decision, and a decision must not be quietly
        // overwritten every time a new piece is written.
        const chosenByHand = sub.ambience && sub.ambience !== 'auto';
        if (piece.ambience && !chosenByHand) {
            sub.ambienceAI = piece.ambience === 'none' ? 'off' : piece.ambience;
            AMB.current = '';
            try { ambPlayFor(sub); } catch (e) { }
        }
        sub.music.ai = piece;                 // kept on the room: composed once, not every entry
        saveMapState();
        // The name comes from the model and toastr renders HTML: a stray tag or quote
        // would break the layout, and worse.
        if (!silent) toastr.success(piece.name ? `🎼 ${escapeHtml(piece.name)}` : t('mus_composed'));
        if (settings.debug) console.log('[RPG Map] composed:', piece);
        return piece;
    } catch (e) {
        console.error('[RPG Map] compose failed', e);
        if (!silent) toastr.error(t('mus_failed'));
        return null;
    } finally {
        musComposing = false;
        musSetBusy(false);
    }
}

// A few words from you beat any amount of guessing from the room's description:
// you know the scene is tender, the walls do not.
async function musAskBrief() {
    const sub = mapState.activeSubloc;
    if (!sub) { toastr.info(t('mus_noroom')); return; }
    const myChat = getContext().chatId;
    const cur = (sub.music && sub.music.brief) || '';
    const val = prompt(t('mus_brief_ask'), cur);
    if (val === null) return;
    if (!sub.music) sub.music = {};
    delete sub.music.rolled;   // a new brief replaces any dice roll
    sub.music.brief = String(val).trim().slice(0, 300);
    saveMapState();
    if (!sub.music.brief) { musRefreshControls(); return; }
    const piece = await musCompose(sub, false);
    if (!ownsChat(myChat)) return;
    if (piece) { musStop(true); musStart(sub); musUpdateBadge(); }
}

function musSetBusy(on) {
    const el = document.getElementById('rpg-mus-compose');
    if (el) el.textContent = on ? '⏳' : '🎼';
}

/* ============================================================
   THE LIBRARY
   A piece you liked is just a handful of numbers. Save it, name it, and pin it to
   any room — the same evening music in the same café, every time you walk in.
   ============================================================ */
function musLibrary() {
    const a = settings.ambience || (settings.ambience = {});
    if (!Array.isArray(a.library)) a.library = [];
    return a.library;
}

function musSaveCurrent() {
    if (!MUS.mood) { toastr.info(t('mus_nothing')); return; }
    const suggested = MUS.mood.name || t('mus_' + MUS.mood.id) || t('mus_piece');
    const name = prompt(t('mus_saveas'), suggested);
    if (name === null) return;
    const lib = musLibrary();
    lib.push({
        id: 'p' + Date.now().toString(36),
        name: String(name).trim().slice(0, 60) || suggested,
        seed: MUS.seed,
        piece: {
            root: MUS.mood.root, tempo: MUS.mood.tempo, scale: MUS.mood.scale,
            progs: MUS.mood.progs, melody: MUS.mood.melody, arp: MUS.mood.arp,
            bassOct: MUS.mood.bassOct, bright: MUS.mood.bright, horror: !!MUS.mood.horror,
            icon: MUS.mood.icon || '⭐', id: 'saved'
        }
    });
    if (lib.length > 60) lib.splice(0, lib.length - 60);
    saveSettings();
    toastr.success(t('mus_saved'));
    musRefreshControls();
}

function musPinned(id) {
    return musLibrary().find(p => p.id === id) || null;
}

function musUsePiece(id) {
    const sub = mapState.activeSubloc;
    const entry = musPinned(id);
    if (!sub || !entry) return;
    if (entry.piece) entry.piece.stamp = entry.piece.stamp || (parseInt(id.slice(1), 36) || 1);
    if (!sub.music) sub.music = {};
    delete sub.music.rolled;   // a deliberate choice clears the dice
    sub.music.mood = 'pin';
    sub.music.pin = id;
    sub.music.seed = entry.seed || musSeedFrom(sub);
    saveMapState();
    musStop(true);
    musStart(sub);
    musUpdateBadge();
}

function musDeletePiece(id) {
    const lib = musLibrary();
    const i = lib.findIndex(p => p.id === id);
    if (i < 0) return;
    if (!confirm(t('mus_del_ask', { name: lib[i].name }))) return;
    lib.splice(i, 1);
    // Any room still pointing at it must fall back, or it would play nothing forever.
    (mapState.maps || []).forEach(map => (map.blocks || []).forEach(b => (b.locations || []).forEach(l => (l.sublocs || []).forEach(sb => {
        if (sb.music && sb.music.pin === id) { sb.music.mood = 'auto'; delete sb.music.pin; }
    }))));
    saveSettings(); saveMapState();
    const sub = mapState.activeSubloc;
    if (sub) { musStop(true); musStart(sub); }
    musUpdateBadge();
    toastr.info(t('mus_deleted'));
}

function musDeleteCurrent() {
    const sub = mapState.activeSubloc;
    if (sub && sub.music && sub.music.mood === 'pin' && sub.music.pin) musDeletePiece(sub.music.pin);
}

function musUpdateBadge() {
    const el = document.getElementById('rpg-mus-badge');
    if (!el) return;
    const s = settings.ambience || {};
    if (!s.enabled) { el.style.display = 'none'; musRefreshControls(); return; }
    if (s.music === false || !MUS.mood) {
        el.style.display = '';
        el.textContent = '🔇';
        el.style.opacity = '0.5';
        el.title = t('mus_off');
        musRefreshControls();
        return;
    }
    el.style.opacity = '1';
    el.style.display = '';
    el.textContent = MUS.mood.icon;
    el.title = t('mus_now', { what: t('mus_' + MUS.mood.id) });
    musRefreshControls();
}


function ambUpdateBadge(profile) {
    const el = document.getElementById('rpg-amb-badge');
    if (!el) return;
    const s = settings.ambience || {};
    if (!s.enabled || s.room === false) {
        el.style.display = '';
        el.textContent = '🔈';
        el.style.opacity = '0.5';
        el.title = t('amb_off');
        return;
    }
    if (!profile) { el.style.display = 'none'; return; }
    el.style.display = '';
    el.style.opacity = '1';
    el.textContent = profile.icon;
    el.title = t('amb_now', { what: t(profile.id === 'room' ? 'amb_room_p' : 'amb_' + profile.id) });
}

// Ambience must never start on its own: browsers block sound until the person has
// clicked, and a room that begins humming unasked is worse than silence. The badge
// is that click.
function ambToggleFromBadge() {
    // This used to flip the master switch, which took the music down with it and hid
    // every control on the strip. It is the ROOM's sound and nothing else.
    const s = settings.ambience || (settings.ambience = {});
    s.room = s.room === false;
    saveSettings();
    ambSetVolumes();
    $('#rpg-amb-room').prop('checked', s.room !== false);
    ambUpdateBadge(AMB_PROFILES.find(p => p.id === AMB.current));
    musRefreshControls();
}

/* ------------------------------------------------------------
   BORROWED CREDENTIALS
   An empty key here falls back to Tavern RPG Engine's, so the same key does
   not have to be pasted into every module. Own settings win only when BOTH
   key and model are filled — a key without a model cannot make a request on
   its own, and half-borrowing would send it to the wrong endpoint.
   Nothing about what is sent or how anything is generated changes here.
   ------------------------------------------------------------ */



/* ------------------------------------------------------------
   STRICT JSON MODE
   response_format is an OpenAI parameter, not a standard one. KoboldCpp turns it
   into a grammar constraint that forbids anything but an object — a model that
   opens with "[" then cannot finish and bails out with EOS after a few tokens.
   Local backends therefore do not get it. Nothing is lost: the reply is pulled out
   with a regex that finds the first object in any text, preamble or code fence
   included, which is why the request works without the parameter at all.
   ------------------------------------------------------------ */
function isLocalEndpoint(url) {
    const u = String(url || '').toLowerCase();
    if (!u) return false;
    return /(^|\/\/)(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|host\.docker\.internal)([:/]|$)/.test(u)
        || /:(5001|5000|8080|8000|1234|11434|5002)(\/|$)/.test(u)          // kobold, ooba, lm studio, ollama
        || /192\.168\.|10\.\d+\.|172\.(1[6-9]|2\d|3[01])\./.test(u);   // the local network
}
function wantsStrictJson(url) {
    if (settings.strictJson === false) return false;      // switched off by hand
    return !isLocalEndpoint(url);
}

const KEY_SOURCE = 'tavern_rpg_engine';
/* An address you typed always wins. Borrowing used to take the neighbour's URL and
   model along with the key whenever your own pair was incomplete — so pointing this
   at LM Studio and leaving the key blank (it does not need one) quietly sent every
   request to OpenRouter instead, and it looked like it was working. A local endpoint
   needs no key at all, so a placeholder is supplied rather than a borrowed one. */

/* OpenAI-style backends live under /v1. Leave that off — "http://localhost:1234" —
   and the request goes to /chat/completions, which LM Studio and KoboldCpp answer
   with "Unexpected endpoint or method". The segment is added when the address has
   no version in it at all, so ".../api/v1" and ".../v1" are left exactly as typed. */
function normalizeBase(url) {
    let u = String(url || '').trim().replace(/\s+/g, '');
    if (!u) return u;
    u = u.replace(/\/+$/, '');
    u = u.replace(/\/(chat\/completions|completions|images|images\/generations|embeddings)$/i, '');
    if (!/\/v\d+($|\/)/i.test(u)) u += '/v1';
    return u;
}

function apiConf() {
    const own = String(settings.baseUrl || '').trim();
    if (own) {
        const local = isLocalEndpoint(own);
        return {
            url: own,
            key: (settings.apiKey || '').trim() || (local ? 'local' : borrowedRaw().key),
            model: (settings.model || '').trim() || (local ? '' : borrowedRaw().model),
            from: (settings.apiKey || '').trim() ? null : (local ? null : borrowedRaw().from)
        };
    }
    if ((settings.apiKey || '').trim() && (settings.model || '').trim()) {
        return { url: '', key: settings.apiKey.trim(), model: settings.model.trim(), from: null };
    }
    const b = borrowedRaw();
    return b.key ? b : { url: '', key: (settings.apiKey || '').trim(), model: (settings.model || '').trim(), from: null };
}
function borrowedRaw() {
    try {
        const x = extension_settings[KEY_SOURCE];
        if (x && x.apiKey && x.model) return { url: x.baseUrl, key: x.apiKey, model: x.model, from: KEY_SOURCE };
    } catch (e) { /* a neighbour with broken settings must not break the map */ }
    return { url: '', key: '', model: '', from: null };
}
function apiKey() { return apiConf().key || ''; }
function apiUrl() { return normalizeBase(apiConf().url) || 'https://openrouter.ai/api/v1'; }
function apiModel() { return apiConf().model || ''; }
function borrowedFrom() { return apiConf().from; }

// Say out loud where the requests actually go. Guessing from behaviour is how an
// hour disappears: a fast answer from the wrong endpoint looks exactly like a fast
// answer from the right one.
function routeSummary() {
    const c = apiConf();
    const url = c.url || 'https://openrouter.ai/api/v1';
    const where = isLocalEndpoint(url) ? 'local' : 'remote';
    const keySrc = c.from ? ('borrowed from ' + c.from) : (c.key ? 'own' : 'MISSING');
    return `${url}  ·  model: ${c.model || '(none)'}  ·  key: ${keySrc}  ·  strict JSON: ${wantsStrictJson(url) ? 'on' : 'off'}  ·  ${where}`;
}
function showRoute() {
    const el = document.getElementById('rpg-map-route');
    if (el) el.textContent = routeSummary();
    console.log('[RPG Map] requests go to →', routeSummary());
}

async function callAI(systemPrompt, userPrompt) {
    if (!apiKey()) throw new Error("API key is not set!");
    let endpointUrl = (apiUrl() || 'https://openrouter.ai/api/v1').replace(/\/$/, '') + '/chat/completions';
    const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey().trim()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: apiModel(),
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
            temperature: settings.temperature,
            ...(wantsStrictJson(endpointUrl) ? { response_format: { type: "json_object" } } : {})
        })
    });
    if (!response.ok) {
        let detail = '';
        try { detail = (await response.json())?.error?.message || ''; } catch (e) {}
        throw new Error(`API ${response.status} ${detail}`.trim());
    }
    const data = await response.json();
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Unexpected AI response shape");
    }
    let content = (data.choices[0].message.content || '').trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
}

// Collect character lore, works for both solo and group chats
function collectLore() {
    const context = getContext();
    let lore = "";
    if (settings.scanCard) {
        if (isGroupChat() && selected_group) {
            const g = (groups || []).find(gr => gr.id === selected_group);
            const members = g?.members || [];
            members.forEach(memberFile => {
                const ch = characters.find(c => c.avatar === memberFile || c.name === memberFile);
                if (ch && ch.description) lore += `${ch.name}: ${ch.description}\n`;
            });
        } else if (context.characterId !== undefined && characters[context.characterId]) {
            lore += (characters[context.characterId].description || "") + "\n";
        }
    }
    if (settings.scanLore && context.worldInfo) {
        lore += JSON.stringify(context.worldInfo) + "\n";
    }
    return lore;
}

function primaryCharName() {
    const context = getContext();
    if (isGroupChat() && selected_group) {
        const g = (groups || []).find(gr => gr.id === selected_group);
        if (g && g.members && g.members.length) {
            const first = characters.find(c => c.avatar === g.members[0] || c.name === g.members[0]);
            if (first) return first.name;
        }
        return "The group";
    }
    return characters[context.characterId]?.name || "Character";
}

// === SMART MAP BUILD FROM CHAT STORY & DIRECTIONS ===
async function generateMapFromLore(userDirections = "") {
    if (!settings.enabled) return;
    const context = getContext();
    const myChat = context.chatId;   // the chat this map is being built FOR

    const lore = collectLore();

    const numMsgs = Math.min(10, context.chat.length);
    const recentChatSlice = context.chat.slice(-numMsgs).filter(m => !m.is_system);
    const recentHistoryText = recentChatSlice.map(m => `${m.name}: ${m.mes}`).join('\n\n');

    toastr.info(t('toast_designing'));

    try {
        const sysPrompt = `You are an RPG level designer. Generate a logical, interesting Map structure for this story.
Generate exactly 2 Blocks (regions/areas). Each Block has 2 Locations (streets/buildings). Each Location has 2 Sub-locations (rooms).
CRITICAL: Keep descriptions completely empty (e.g. ""). Just generate the names and structure.
${t('ai_lang_names')}
Mark 1 or 2 sub-locations as "locked": true.
Output strictly JSON:
{
  "blocks": [
    {
      "name": "Block Name",
      "locations": [
        {
          "name": "Location Name",
          "sublocs": [
            { "name": "Room Name", "desc": "", "locked": true/false }
          ]
        }
      ]
    }
  ]
}`;

        let userPrompt = `Character Lore:\n${lore.substring(0, 1000)}\n\nRecent Story context:\n${recentHistoryText.substring(0, 1500)}`;
        if (userDirections) {
            userPrompt += `\n\nCRITICAL USER DIRECTIONS: Generate the map specifically for this requested location/setting: "${userDirections}". Build blocks and rooms related to this place.`;
        }

        const result = await callAI(sysPrompt, userPrompt);
        if (!ownsChat(myChat)) return;   // user switched chats while the AI was thinking —
                                         // do NOT write the old chat's map into the new one
        if (!result || !Array.isArray(result.blocks)) throw new Error("No blocks returned");

        mapState.maps[mapState.activeMapIndex].blocks = result.blocks;
        mapState.mapGenerated = true;
        saveMapState();
        renderMapTree();
        toastr.success(t('toast_designed'));
    } catch (e) { console.error("Map Gen Error:", e); toastr.error(t('toast_gen_fail')); }
}

// === GENERATE A ROOM DESCRIPTION ON DEMAND ===
/* A model that has lost the thread sometimes answers with a bare number — a "-1"
   lands in the description or the name and is then faithfully turned into the string
   "-1" and saved. Nothing downstream can tell it from a real answer, so it is caught
   here: a value that is a number, or a string that is nothing but a number, is not a
   description and never was. */
function isJunkText(v) {
    if (v == null) return true;
    if (typeof v === 'number' || typeof v === 'boolean') return true;
    const str = String(v).trim();
    if (!str) return true;
    if (/^-?\d+([.,]\d+)?$/.test(str)) return true;          // "-1", "0", "42"
    if (/^(null|undefined|nan|none|n\/a|error|false|true)$/i.test(str)) return true;
    return false;
}

async function generateRoomDescription(sub, blockName, locName, userPrompt = "") {
    const myChat = getContext().chatId;
    toastr.info(t('toast_describing'));
    try {
        const sysPrompt = `You are an RPG Game Master. Describe the room "${sub.name}" inside "${locName}" of "${blockName}".
Write a short, highly detailed, atmospheric description (D&D search style). Brief (2-3 sentences), strictly factual. ${t('ai_lang_text')}${userPrompt ? `\nFollow this guidance from the player: ${userPrompt}` : ''}
Output strictly JSON: { "desc": "Room description here." }`;

        const result = await callAI(sysPrompt, userPrompt ? `Describe the room. Guidance: ${userPrompt}` : "Describe the room.");
        if (!ownsChat(myChat)) return;   // chat changed during the request
        // be defensive: models sometimes return desc as a non-string
        let d = result && result.desc;
        if (d && typeof d === 'object') d = d.text || d.description || '';
        if (isJunkText(d)) {
            console.warn('[RPG Map] description rejected:', JSON.stringify(result));
            toastr.error(t('toast_desc_junk'));
            return;                       // keep whatever was there; do not overwrite with rubbish
        }
        sub.desc = String(d).trim();
        saveMapState();
        selectSublocation(sub, mapState.activeMapIndex, locName, blockName);
        toastr.success(t('toast_desc_done'));
    } catch (e) { console.error(e); toastr.error(t('toast_desc_fail')); }
}

// === ROOM IMAGE ENGINE ===================================================
// Optimization: images NEVER live inside mapState (which is duplicated into
// settings AND into every chat checkpoint). We keep only a tiny string in
// sub.image — either a remote URL, or "idb:<key>" pointing at IndexedDB where
// the actual bytes are stored once. So saving stays lightweight.

// Only one night used to exist and it always brought candles with it, which suits a
// 19th-century parlour and nothing else. The candles now live in their own entry, and
// the plain nights are free of them.
const IMG_TIME_PRESETS = [
    'dawn, soft golden light',
    'early morning, pale cool light and long shadows',
    'midday, bright natural light',
    'afternoon, warm even daylight',
    'sunset, warm orange glow',
    'dusk, fading blue light after sunset',
    'night, moonlight through the windows, cool blue shadows, no other light source',
    'deep night, almost no light, heavy darkness, only faint outlines visible',
    'moonless night, pitch dark, lit only by what little light the scene itself has',
    'night with moonlight and candlelight, dark atmosphere',
    'night lit by a single lamp, warm pool of light surrounded by darkness',
    'night lit by firelight, flickering orange glow on the walls',
    'starry night, clear sky, faint silver light',
    'foggy night, diffuse haze, distant lights blurred',
    'overcast grey daylight',
    'stormy daylight, dark clouds and low light'
];
const IMG_WEATHER_PRESETS = [
    'clear weather',
    'light rain, wet reflections',
    'heavy rain and fog',
    'snowfall',
    'stormy with distant lightning'
];

const IDB_NAME = 'rpgMapImages';
const IDB_STORE = 'imgs';
function idbOpen() {
    return new Promise((res, rej) => {
        const r = indexedDB.open(IDB_NAME, 1);
        r.onupgradeneeded = () => { r.result.createObjectStore(IDB_STORE); };
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
    });
}
async function idbSet(key, val) {
    const db = await idbOpen();
    return new Promise((res, rej) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put(val, key);
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
    });
}
async function idbGet(key) {
    const db = await idbOpen();
    return new Promise((res, rej) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const rq = tx.objectStore(IDB_STORE).get(key);
        rq.onsuccess = () => res(rq.result || null);
        rq.onerror = () => rej(rq.error);
    });
}
async function idbDel(key) {
    try {
        const db = await idbOpen();
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).delete(key);
    } catch (e) {}
}

function parseSize(size) {
    const m = String(size || '').match(/^(\d+)\s*[xX*]\s*(\d+)$/);
    if (!m) return null;
    const w = parseInt(m[1]), h = parseInt(m[2]);
    return (w && h) ? { w, h } : null;
}

// Convert "1024x576" → "16:9" (OpenRouter/Gemini prefer aspect_ratio). Fallback 16:9.
function aspectFromSize(size) {
    const m = String(size || '').match(/^(\d+)\s*[xX*]\s*(\d+)$/);
    if (!m) return '16:9';
    let w = parseInt(m[1]), h = parseInt(m[2]);
    if (!w || !h) return '16:9';
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const g = gcd(w, h) || 1;
    return `${w / g}:${h / g}`;
}

// Two supported backends:
//  - openrouter: POST /chat/completions with modalities:["image","text"] (nano-banana, grok, etc.)
//                image returns as a data: URL inside choices[0].message.images
//  - openai:     POST /images/generations (api.navy, OpenAI, most SD proxies)
function detectImageMode() {
    const cfg = settings.images;
    if (cfg.mode === 'openai' || cfg.mode === 'openrouter') return cfg.mode;
    const u = (cfg.apiUrl || '').toLowerCase();
    if (u.includes('openrouter')) return 'openrouter';
    return 'openai';
}

async function callImageAI(prompt) {
    const cfg = settings.images;
    if (!cfg.apiUrl || !cfg.model) throw new Error('Image API not configured');
    const base = cfg.apiUrl.replace(/\/$/, '');
    const mode = detectImageMode();

    if (mode === 'openrouter') {
        // OpenRouter's dedicated Image API: POST /images  →  { data:[{ b64_json, media_type? }] }
        // The size you pick used to be thrown away here: only the aspect ratio was
        // sent, so every image came back at whatever the model felt like — which is
        // why a 1920x1080 preset still produced a small, soft picture. The pixel size
        // now goes with it, and if a model rejects the field the request is retried
        // without it rather than failing.
        const dim = parseSize(cfg.size);
        // Three steps down, not one. Dropping straight from "everything" to "nothing"
        // on the first 400 would throw the size away because of an unrelated field —
        // width/height are undocumented on some proxies, size is documented on all of
        // them. Losing the extras must never cost the size itself.
        //   2: size + width + height   1: size only   0: aspect ratio only
        const doPost = async (level) => {
            const body = { model: cfg.model, prompt, n: 1 };
            const ar = aspectFromSize(cfg.size);
            if (ar) body.aspect_ratio = ar;
            if (level >= 1 && dim) body.size = `${dim.w}x${dim.h}`;
            if (level >= 2 && dim) { body.width = dim.w; body.height = dim.h; }
            return fetch(base + '/images', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${(cfg.apiKey || '').trim()}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': (typeof location !== 'undefined' ? location.origin : 'https://sillytavern.app'),
                    'X-Title': 'SillyTavern RPG Map'
                },
                body: JSON.stringify(body)
            });
        };
        let resp = await doPost(2);
        for (let level = 1; level >= 0 && !resp.ok && (resp.status === 400 || resp.status === 422); level--) {
            let txt = '';
            try { txt = JSON.stringify(await resp.clone().json()); } catch (e) {}
            if (!/size|dimension|resolution|width|height|unsupported|unknown|invalid|unexpected/i.test(txt)) break;
            resp = await doPost(level);
        }
        if (!resp.ok) {
            let detail = '';
            try { detail = (await resp.json())?.error?.message || ''; } catch (e) {}
            throw new Error(`Image API ${resp.status} ${detail}`.trim());
        }
        const data = await resp.json();
        const item = data?.data?.[0] || {};
        if (item.b64_json) {
            const mt = item.media_type || 'image/png';
            return { b64: `data:${mt};base64,${item.b64_json}` };
        }
        if (item.url) return { url: item.url };
        throw new Error('No image in OpenRouter response');
    }

    // default: OpenAI-images style (api.navy, OpenAI, most SD proxies)
    //   2: size + width + height   1: size only (what api.navy documents)   0: neither
    const doPost = async (level) => {
        const body = { model: cfg.model, prompt, n: 1 };
        const d = parseSize(cfg.size);
        if (level >= 1 && cfg.size) body.size = cfg.size;
        if (level >= 2 && d) { body.width = d.w; body.height = d.h; }   // some proxies read these instead
        return fetch(base + '/images/generations', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${(cfg.apiKey || '').trim()}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    };

    let resp = await doPost(2);
    // Step down one field at a time: an undocumented width/height must not cost the
    // documented size. Some models also reject a non-standard size (e.g. 1024x576),
    // and only then is the size itself given up.
    for (let level = 1; level >= 0 && !resp.ok && (resp.status === 400 || resp.status === 422); level--) {
        let txt = '';
        try { txt = JSON.stringify(await resp.clone().json()); } catch (e) {}
        if (!/size|dimension|resolution|width|height|unsupported|unknown|invalid|unexpected/i.test(txt)) break;
        resp = await doPost(level);
    }
    if (!resp.ok) {
        let detail = '';
        try { const j = await resp.json(); detail = j?.error?.message || j?.message || JSON.stringify(j).slice(0, 200); }
        catch (e) { try { detail = (await resp.text()).slice(0, 200); } catch (_) {} }
        throw new Error(`Image API ${resp.status} ${detail}`.trim());
    }

    const data = await resp.json();
    const item = (data && Array.isArray(data.data) && data.data[0]) ? data.data[0] :
                 (data && Array.isArray(data.images) && data.images[0]) ? data.images[0] :
                 (data && Array.isArray(data.output) && data.output[0]) ? data.output[0] : {};
    const b64 = item.b64_json || item.b64 || (typeof item === 'string' && item.startsWith('data:') ? item : null);
    const url = item.url || (item.image_url && (item.image_url.url || item.image_url)) || data.url ||
                (typeof item === 'string' && /^https?:\/\//.test(item) ? item : null);
    if (b64) return { b64: String(b64).startsWith('data:') ? b64 : ('data:image/png;base64,' + b64) };
    if (url) return { url };
    throw new Error('No image found in response (unexpected format)');
}

// Two-step: (1) condense name+desc into a short English scene phrase → {ROOM};
// (2) assemble the user's template and call the image model.
async function generateRoomImage(sub, blockName, locName, timeVal, weatherVal) {
    const cfg = settings.images;
    if (!cfg.enabled || !cfg.apiUrl || !cfg.model) { toastr.warning(t('toast_img_disabled')); return; }
    const myChat = getContext().chatId;

    toastr.info(t('toast_img_generating'));
    try {
        // step 1 — scene phrase, ALWAYS in English (image models prefer it)
        let scene = sub.name;
        try {
            const r = await callAI(
                `You convert an RPG room into a concise ENGLISH scene phrase for an image generator.
Output strictly JSON: { "scene": "..." } — a short English phrase (4-12 words) describing ONLY the empty environment (no people, no characters), capturing the key visual features.`,
                `Room name: ${sub.name}\nDescription: ${sub.desc || ''}`
            );
            if (r && r.scene) scene = r.scene;
        } catch (e) { /* fall back to the raw name */ }

        // step 2 — build the prompt from the editable template
        const prompt = String(cfg.template || '')
            .split('{ROOM}').join(scene)
            .split('{STYLE}').join(cfg.style || '')
            .split('{TIME}').join(timeVal || cfg.timeOfDay || '')
            .split('{WEATHER}').join(weatherVal || cfg.weather || '')
            .split('{SIZE}').join(cfg.size || '1024x576');

        const img = await callImageAI(prompt);
        if (!ownsChat(myChat)) return;   // chat changed during the request

        // store lightly — never base64 inside mapState
        if (img.url) {
            if (sub.imageKey) { idbDel(sub.imageKey); sub.imageKey = null; }
            sub.image = img.url;
        } else if (img.b64) {
            const key = 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
            await idbSet(key, img.b64);
            if (sub.imageKey) idbDel(sub.imageKey);
            sub.imageKey = key;
            sub.image = 'idb:' + key;
        }
        sub.imgTime = timeVal || cfg.timeOfDay;
        sub.imgWeather = weatherVal || cfg.weather;

        // (experimental) also drop it into ST's backgrounds folder so it can be
        // used as a native background via /bg
        if (cfg.saveToBgFolder) {
            try {
                let dataUrl = img.b64 || img.url;
                if (dataUrl) {
                    // meaningful, varied name from the AI scene phrase (fallback to room name)
                    const basis = (scene && scene !== sub.name) ? scene : sub.name;
                    let safe = String(basis).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'room';
                    const fname = `rpg_${safe}_${Math.random().toString(36).slice(2, 6)}.png`;
                    const returned = await uploadBgToST(dataUrl, fname);
                    sub.bgFile = returned;
                    toastr.success(t('toast_bg_uploaded'));
                }
            } catch (e) { console.warn('bg folder save failed:', e); toastr.warning(t('toast_bg_upload_fail')); }
        }

        saveMapState();
        selectSublocation(sub, mapState.activeMapIndex, locName, blockName);
        toastr.success(t('toast_img_done'));
    } catch (e) { console.error('Image gen error:', e); toastr.error(t('toast_img_fail') + ' — ' + (e && e.message ? e.message : e)); }
}

function removeRoomImage(sub, blockIndex, locName, blockName) {
    if (sub.imageKey) idbDel(sub.imageKey);
    sub.image = null;
    sub.imageKey = null;
    saveMapState();
    selectSublocation(sub, blockIndex, locName, blockName);
}

// Let the user pick ANY local image file as the room's picture. Stored in
// IndexedDB (never inside mapState) so saves stay small; used both as the note
// photo and as the travel background.
function chooseRoomImageFile(sub, blockIndex, locName, blockName) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const dataUrl = ev.target.result;
                const key = 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
                await idbSet(key, dataUrl);
                if (sub.imageKey) idbDel(sub.imageKey);
                sub.imageKey = key;
                sub.image = 'idb:' + key;
                saveMapState();
                selectSublocation(sub, blockIndex, locName, blockName);
                if (mapState.activeSubloc && mapState.activeSubloc.name === sub.name) applyRoomBackground(sub);
                toastr.success(t('toast_img_done'));
            } catch (err) { console.error('Pick image error:', err); toastr.error(t('toast_img_fail')); }
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

// Resolve a stored image reference to a usable <img> src (URL or IndexedDB).
function applyRoomImageSrc(sub) {
    const imgEl = document.getElementById('rpg-room-photo-img');
    if (!imgEl || !sub.image) return;
    const setSrc = (src) => { if (src) { imgEl.src = src; imgEl.onclick = () => window.open(src, '_blank'); } };
    if (String(sub.image).startsWith('idb:')) {
        idbGet(String(sub.image).slice(4)).then(setSrc).catch(() => {});
    } else {
        setSrc(sub.image);
    }
}

function buildImageControls(sub) {
    const imgOn = settings.images.enabled;
    const bgOn = settings.images.syncBackground;
    if (!imgOn && !bgOn) return '';

    let inner = '';
    if (imgOn) {
        const cur = { time: sub.imgTime || settings.images.timeOfDay, weather: sub.imgWeather || settings.images.weather };
        const opts = (list, selected) => {
            const all = list.includes(selected) ? list : [selected, ...list];
            return all.map(v => `<option value="${(v || '').replace(/"/g, '&quot;')}" ${v === selected ? 'selected' : ''}>${v}</option>`).join('');
        };
        const genLabel = sub.image ? t('btn_regen_image') : t('btn_gen_image');
        inner += `
            <div class="rpg-img-tw">
                <select id="rpg-room-img-time" class="rpg-room-prompt" title="${t('img_time')}">${opts(IMG_TIME_PRESETS, cur.time)}</select>
                <select id="rpg-room-img-weather" class="rpg-room-prompt" title="${t('img_weather')}">${opts(IMG_WEATHER_PRESETS, cur.weather)}</select>
            </div>
            <button class="rpg-travel-btn rpg-btn-ai-gen" id="rpg-gen-image"><i class="fa-solid fa-image"></i> ${genLabel}</button>`;
    }
    // Pick any local image as the room's picture (used in the note AND as the
    // travel background). Available whenever images or background sync is on.
    inner += `<button class="rpg-travel-btn rpg-btn-edit-desc" id="rpg-pick-image"><i class="fa-solid fa-folder-open"></i> ${t('btn_pick_image')}</button>`;
    if (sub.image) {
        inner += `<button class="rpg-travel-btn rpg-btn-edit-desc" id="rpg-remove-image"><i class="fa-solid fa-trash"></i> ${t('btn_remove_image')}</button>`;
    }
    return `<div class="rpg-img-controls">${inner}</div>`;
}

// === CHAT BACKGROUND SYNC =================================================
// When enabled, entering a room changes the SillyTavern chat background:
//   - a room with a picture (sub.image)       → our own overlay layer
//   - a room with a folder background (bgFile) → native /bg command
//   - a room with neither                      → overlay cleared (normal bg)
function runSlash(cmd) {
    try {
        const ctx = getContext();
        if (ctx && typeof ctx.executeSlashCommandsWithOptions === 'function') return ctx.executeSlashCommandsWithOptions(cmd);
        if (ctx && typeof ctx.executeSlashCommands === 'function') return ctx.executeSlashCommands(cmd);
    } catch (e) { console.error('slash command failed:', e); }
}
// A background layer we fully own — SillyTavern never touches it, so it always
// updates (unlike poking #bg_custom, which ST resets). Sits above ST's own
// background but below the chat UI.
function ensureBgOverlay() {
    let el = document.getElementById('rpg-room-bg');
    if (!el) {
        el = document.createElement('div');
        el.id = 'rpg-room-bg';
        el.style.cssText = 'position:fixed;inset:0;background-size:cover;background-position:center;background-repeat:no-repeat;z-index:-1;pointer-events:none;opacity:0;transition:opacity .45s ease;';
        document.body.appendChild(el);
    }
    return el;
}
function setOverlayBg(url) {
    const el = ensureBgOverlay();
    el.style.backgroundImage = `url("${String(url).replace(/"/g, '\\"')}")`;
    el.style.opacity = '1';
}
function clearOverlayBg() {
    const el = document.getElementById('rpg-room-bg');
    if (el) { el.style.opacity = '0'; }
}
// Read the backgrounds SillyTavern already knows about (from its gallery DOM).
function listStBackgrounds() {
    const out = [];
    document.querySelectorAll('#bg_menu_content .bg_example').forEach(el => {
        const file = el.getAttribute('bgfile') || el.getAttribute('data-bgfile') || el.getAttribute('title') || '';
        let url = '';
        const bi = el.style.backgroundImage || (window.getComputedStyle ? getComputedStyle(el).backgroundImage : '');
        const m = bi && bi.match(/url\(["']?(.*?)["']?\)/);
        if (m) url = m[1];
        if (file) out.push({ file, url });
    });
    return out;
}
function bgThumbUrl(bgFile) {
    const found = listStBackgrounds().find(b => b.file === bgFile);
    return found ? found.url : `backgrounds/${bgFile}`;
}
async function applyRoomBackground(sub) {
    if (!settings.images.syncBackground || !sub) return;
    if (sub.image) {                                   // room picture (generated or picked) wins
        let url = sub.image;
        if (String(url).startsWith('idb:')) {
            try { const d = await idbGet(String(url).slice(4)); if (!d) { clearOverlayBg(); return; } url = d; }
            catch (e) { clearOverlayBg(); return; }
        }
        setOverlayBg(url);
        return;
    }
    if (sub.bgFile) {                                  // a folder background → native /bg
        clearOverlayBg();
        runSlash('/bg ' + sub.bgFile);
        return;
    }
    clearOverlayBg();                                  // no picture → reveal the normal background
}
// (experimental) upload a generated image into ST's backgrounds/ folder
async function uploadBgToST(dataUrl, filename) {
    const blob = await (await fetch(dataUrl)).blob();
    const fd = new FormData();
    fd.append('avatar', blob, filename);   // ST's background upload uses the generic file field
    const ctx = getContext();
    const headers = (ctx && typeof ctx.getRequestHeaders === 'function') ? ctx.getRequestHeaders() : {};
    delete headers['Content-Type'];        // let the browser set the multipart boundary
    const resp = await fetch('/api/backgrounds/upload', { method: 'POST', headers, body: fd });
    if (!resp.ok) throw new Error('bg upload ' + resp.status);
    const data = await resp.json().catch(() => ({}));
    return data.fileName || data.name || filename;
}

// === INVENTORY INTEGRATION (extension: tavern_rpg_engine) ===
// Preferred path: the official window.RPG.inventory bridge — it syncs the chat,
// writes the in-chat checkpoint AND refreshes the backpack UI. The direct
// extension_settings access is kept only as a fallback for older engine builds
// (it updates settings but leaves an open backpack window stale).
function invBridge() {
    const inv = window.RPG && window.RPG.inventory;
    return (inv && inv.available) ? inv : null;
}
function getInventoryItems() {
    const inv = invBridge();
    if (inv && typeof inv.list === 'function') {
        try { return inv.list(); } catch (e) { /* fall through */ }
    }
    const context = getContext();
    const rpgEngineState = extension_settings['tavern_rpg_engine']?.chatStates?.[context.chatId];
    return rpgEngineState?.inventory || [];
}

function removeInventoryItem(keyId) {
    const inv = invBridge();
    if (inv && typeof inv.remove === 'function') {
        try { inv.remove(keyId); return; } catch (e) { /* fall through */ }
    }
    const context = getContext();
    const rpgEngineState = extension_settings['tavern_rpg_engine']?.chatStates?.[context.chatId];
    if (rpgEngineState && rpgEngineState.inventory) {
        rpgEngineState.inventory = rpgEngineState.inventory.filter(i => i.id !== keyId);
        if (typeof saveSettingsDebounced === 'function') saveSettingsDebounced();
    }
}

// Item is a "key/lockpick" in either language.
// Word-start match, not substring: a plain .includes('ключ') used to flag
// "выключатель" / "заключение" as keys.
function itemIsKeyLike(name) {
    const n = String(name || '').toLowerCase();
    const words = new Set([...(langObj().key_words || []), ...I18N.en.key_words, ...I18N.ru.key_words]);
    const tokens = n.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    for (const w of words) {
        const stem = String(w).toLowerCase();
        if (tokens.some(tk => tk.startsWith(stem))) return true;
    }
    return false;
}
function itemIsPickLike(name) {
    const n = String(name || '').toLowerCase();
    return n.includes('pick') || n.includes('отмычк') || n.includes('lockpick');
}
// Robust success chance even if the inventory item has no `chance` field.
// A real key defaults to 85% (never a guaranteed 100%); a lockpick to 40%.
function keyChance(key) {
    if (typeof key.chance === 'number' && !isNaN(key.chance)) return key.chance;
    return itemIsPickLike(key.name) ? 40 : 85;
}

// === MAP RENDER WITH TABS & BUILDER ===
function renderMapTree() {
    // The header is rebuilt with the tree, so the music controls have to be put back
    // each time — otherwise they exist only until the first redraw.
    setTimeout(() => { try { musRefreshControls(); ambUpdateBadge(AMB_PROFILES.find(p => p.id === AMB.current)); } catch (e) { } }, 0);
    const tabsHolder = $('#rpg-map-tabs-holder');
    const tree = $('#rpg-map-tree-container');
    if (tree.length === 0 || tabsHolder.length === 0) return;

    tree.empty();
    tabsHolder.empty();

    let tabsHtml = `<div class="rpg-map-tabs-container">`;
    mapState.maps.forEach((map, mIdx) => {
        const isActive = mapState.activeMapIndex === mIdx;
        const delBtn = (mapState.isEditMode && mapState.maps.length > 1) ? `<i class="fa-solid fa-xmark rpg-map-tab-del" data-midx="${mIdx}"></i>` : '';
        tabsHtml += `
            <div class="rpg-map-tab ${isActive ? 'active' : ''}" data-midx="${mIdx}" title="${mapState.isEditMode ? t('title_rename_tab') : ''}">
                <span>${escapeHtml(map.name)}</span>
                ${delBtn}
            </div>
        `;
    });
    if (mapState.isEditMode) {
        tabsHtml += `<button class="rpg-map-tab-add" id="rpg-map-add-tab-btn" title="${t('title_new_tab')}"><i class="fa-solid fa-plus"></i></button>`;
    }
    tabsHtml += `</div>`;
    tabsHolder.html(tabsHtml);

    const activeBlocks = getActiveBlocks();

    activeBlocks.forEach((block, bIdx) => {
        let editHtml = mapState.isEditMode ? `
            <span class="rpg-tree-edit-actions">
                <i class="fa-solid fa-pen rpg-tree-rename-btn" style="color:#3f5d78;" title="${t('title_rename')}" data-type="block" data-bidx="${bIdx}"></i>
                <i class="fa-solid fa-plus rpg-tree-add-btn" title="${t('title_add_loc')}" data-type="loc" data-bidx="${bIdx}"></i>
                <i class="fa-solid fa-trash rpg-tree-del-btn" title="${t('title_del_region')}" data-type="block" data-bidx="${bIdx}"></i>
            </span>
        ` : '';
        const blockDnd = mapState.isEditMode ? `draggable="true" data-dtype="block" data-bidx="${bIdx}" style="cursor:grab;"` : '';
        tree.append(`<div class="rpg-map-block" ${blockDnd}><span><i class="fa-solid fa-map"></i> ${escapeHtml(block.name)}</span>${editHtml}</div>`);

        (block.locations || []).forEach((loc, lIdx) => {
            let locEditHtml = mapState.isEditMode ? `
                <span class="rpg-tree-edit-actions">
                    <i class="fa-solid fa-pen rpg-tree-rename-btn" style="color:#3f5d78;" title="${t('title_rename')}" data-type="loc" data-bidx="${bIdx}" data-lidx="${lIdx}"></i>
                    <i class="fa-solid fa-plus rpg-tree-add-btn" title="${t('title_add_room')}" data-type="sub" data-bidx="${bIdx}" data-lidx="${lIdx}"></i>
                    <i class="fa-solid fa-trash rpg-tree-del-btn" title="${t('title_del_loc')}" data-type="loc" data-bidx="${bIdx}" data-lidx="${lIdx}"></i>
                </span>
            ` : '';
            const locDnd = mapState.isEditMode ? `draggable="true" data-dtype="loc" data-bidx="${bIdx}" data-lidx="${lIdx}" style="cursor:grab;"` : '';
            tree.append(`<div class="rpg-map-loc" ${locDnd}><span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(loc.name)}</span>${locEditHtml}</div>`);

            (loc.sublocs || []).forEach((sub, sIdx) => {
                const isActive = mapState.activeSubloc && mapState.activeSubloc.name === sub.name;

                let subEditHtml = mapState.isEditMode ? `
                    <span class="rpg-tree-edit-actions">
                        <i class="fa-solid fa-pen rpg-tree-rename-btn" style="color:#3f5d78;" title="${t('title_rename')}" data-type="sub" data-bidx="${bIdx}" data-lidx="${lIdx}" data-sidx="${sIdx}"></i>
                        <i class="fa-solid ${sub.locked ? 'fa-lock' : 'fa-lock-open'} rpg-tree-lock-toggle-btn" title="${sub.locked ? t('title_lock_open') : t('title_lock_close')}" data-bidx="${bIdx}" data-lidx="${lIdx}" data-sidx="${sIdx}"></i>
                        <i class="fa-solid fa-trash rpg-tree-del-btn" title="${t('title_del_room')}" data-type="sub" data-bidx="${bIdx}" data-lidx="${lIdx}" data-sidx="${sIdx}"></i>
                    </span>
                ` : '';

                const subDnd = mapState.isEditMode ? `draggable="true" data-dtype="sub" data-bidx="${bIdx}" data-lidx="${lIdx}" data-sidx="${sIdx}" style="cursor:grab;"` : '';
                const subEl = $(`
                    <div class="rpg-map-subloc ${sub.locked ? 'locked' : ''} ${isActive ? 'active' : ''}" ${subDnd}>
                        <span><i class="fa-solid fa-door-open"></i> ${escapeHtml(sub.name)}</span>
                        ${sub.locked ? '<i class="fa-solid fa-lock rpg-lock-icon"></i>' : ''}
                        ${subEditHtml}
                    </div>
                `);

                subEl.on('click', (e) => {
                    if (e.target.closest('.rpg-tree-edit-actions')) return;
                    selectSublocation(sub, bIdx, loc.name, block.name);
                });
                tree.append(subEl);
            });
        });
    });

    if (mapState.isEditMode) {
        tree.append(`<button id="rpg-map-add-block-btn"><i class="fa-solid fa-plus"></i> ${t('tree_add_block')}</button>`);
        tree.append(`<button id="rpg-map-regen-btn" style="width:100%; padding:8px; border:1px solid #6a4a82; background:transparent; color:#6a4a82; border-radius:6px; margin-top:10px; font-weight:bold;"><i class="fa-solid fa-wand-magic-sparkles"></i> ${t('tree_regen')}</button>`);
        attachTreeDnD();
    }
}

// Guards against corrupted room data (e.g. the AI once returned desc as an
// object instead of a string, which then crashed rendering). Coerces fields to
// safe types and reports whether anything was fixed.
function normalizeSubloc(sub) {
    if (!sub || typeof sub !== 'object') return false;
    let changed = false;
    const toText = (v) => {
        if (typeof v === 'string') return v;
        if (v == null) return '';
        if (typeof v === 'object') return v.text || v.description || v.desc || '';
        return String(v);
    };
    if (typeof sub.desc !== 'string') { sub.desc = toText(sub.desc); changed = true; }
    if (isJunkText(sub.desc) && sub.desc !== '') { sub.desc = ''; changed = true; }
    if (isJunkText(sub.name)) { sub.name = t('default_room_name') || 'Room'; changed = true; }
    else if (typeof sub.name !== 'string') { sub.name = String(sub.name); changed = true; }
    if (sub.image != null && typeof sub.image !== 'string') { sub.image = null; sub.imageKey = null; changed = true; }
    if (sub.bgFile != null && typeof sub.bgFile !== 'string') { sub.bgFile = null; changed = true; }
    return changed;
}

function selectSublocation(sub, blockIndex, locName = "", blockName = "") {
    const panel = $('#rpg-map-info-content');
    if (normalizeSubloc(sub)) saveMapState();   // self-heal corrupted data so the room renders again

    try {
    panel.empty();
    const isLocked = sub.locked;
    const hasDesc = sub.desc && sub.desc.trim().length > 0;
    const photoHtml = (!isLocked && (sub.image || sub.bgFile))
        ? `<div class="rpg-room-photo-wrap ${settings.images.frame === 'worn' ? 'worn' : ''}"><img class="rpg-room-photo" id="rpg-room-photo-img" ${(!sub.image && sub.bgFile) ? `src="${String(bgThumbUrl(sub.bgFile)).replace(/"/g, '&quot;')}"` : ''} alt="${escapeHtml(sub.name)}"></div>`
        : '';

    let html = `
        <div class="rpg-info-title">${escapeHtml(sub.name)}${!isLocked ? `<button class="rpg-here-mini" id="rpg-set-here" title="${t('btn_set_here')}" style="margin-left:8px;padding:2px 8px;font-size:11px;font-weight:600;vertical-align:middle;cursor:pointer;border:1px solid rgba(139,92,246,.5);border-radius:10px;background:rgba(139,92,246,.14);color:#6b4fa0;white-space:nowrap;"><i class="fa-solid fa-location-dot"></i> ${t('btn_here_mini')}</button>` : ''}</div>
        <div class="rpg-info-status ${isLocked ? 'closed' : 'open'}">${isLocked ? t('status_locked') : t('status_open')}</div>
        ${photoHtml}
        <div class="rpg-info-desc" id="rpg-info-desc">${isLocked ? t('desc_locked') : (hasDesc ? escapeHtml(sub.desc) : t('desc_empty'))}</div>
        <div class="rpg-travel-actions">
    `;

    if (isLocked) {
        html += `<button class="rpg-travel-btn rpg-btn-unlock" id="rpg-unlock-action"><i class="fa-solid fa-key"></i> ${t('btn_open_door')}</button>`;
    } else {
        html += `<input type="text" id="rpg-room-prompt" class="rpg-room-prompt" placeholder="${t('ph_ai_prompt')}">`;
        if (!hasDesc) {
            html += `<button class="rpg-travel-btn rpg-btn-ai-gen" id="rpg-ai-gen-desc" data-block="${blockName}" data-loc="${locName}"><i class="fa-solid fa-wand-magic-sparkles"></i> ${t('btn_gen_desc')}</button>`;
        } else {
            html += `<button class="rpg-travel-btn rpg-btn-ai-gen" id="rpg-ai-gen-desc" data-block="${blockName}" data-loc="${locName}"><i class="fa-solid fa-rotate"></i> ${t('btn_regen_desc')}</button>`;
        }

        html += buildImageControls(sub);

        if (mapState.isSolo) {
            html += `
                <button class="rpg-travel-btn rpg-btn-edit-desc" id="rpg-manual-edit-desc"><i class="fa-solid fa-pen"></i> ${t('btn_edit_manual')}</button>
                <hr class="sysHR" style="margin: 10px 0;">
                <button class="rpg-travel-btn rpg-btn-together" id="rpg-go-together"><i class="fa-solid fa-users"></i> ${t('btn_call_char')}</button>
                <button class="rpg-travel-btn rpg-btn-alone" id="rpg-go-alone-move" data-block="${blockIndex}" data-blockname="${blockName}" data-loc="${locName}"><i class="fa-solid fa-person-walking"></i> ${t('btn_move_alone')}</button>
            `;
            if (mapState.activeSubloc && mapState.activeSubloc.name === sub.name) {
                html += `<button class="rpg-travel-btn rpg-btn-return" id="rpg-go-back-to-char"><i class="fa-solid fa-person-walking-arrow-loop-left"></i> ${t('btn_return_char')}</button>`;
            }
        } else {
            html += `
                <button class="rpg-travel-btn rpg-btn-edit-desc" id="rpg-manual-edit-desc"><i class="fa-solid fa-pen"></i> ${t('btn_edit_manual')}</button>
                <hr class="sysHR" style="margin: 10px 0;">
                <button class="rpg-travel-btn rpg-btn-together" id="rpg-go-together"><i class="fa-solid fa-users"></i> ${t('btn_go_together')}</button>
                <button class="rpg-travel-btn rpg-btn-alone" id="rpg-go-alone"><i class="fa-solid fa-user"></i> ${t('btn_go_alone')}</button>
            `;
        }
    }

    html += `</div>`;
    panel.html(html);

    if (isLocked) {
        $('#rpg-unlock-action').off('click').on('click', () => showUnlockModal(sub, { blockIndex, locName, blockName }));
    } else {
        $('#rpg-ai-gen-desc').off('click').on('click', function () {
            const pr = $('#rpg-room-prompt').val() || "";
            generateRoomDescription(sub, $(this).data('block'), $(this).data('loc'), pr);
        });
        $('#rpg-gen-image').off('click').on('click', async function () {
            const tv = $('#rpg-room-img-time').val();
            const wv = $('#rpg-room-img-weather').val();
            const $btn = $(this);
            if ($btn.hasClass('rpg-img-busy')) return;                 // ignore double-clicks while working
            const prev = $btn.html();
            $btn.addClass('rpg-img-busy').prop('disabled', true)
                .html(`<i class="fa-solid fa-spinner fa-spin"></i> ${t('img_generating_status')}`);
            try { await generateRoomImage(sub, blockName, locName, tv, wv); }
            finally { $btn.removeClass('rpg-img-busy').prop('disabled', false); if ($btn.is(':visible')) $btn.html(prev); }
        });
        $('#rpg-remove-image').off('click').on('click', () => removeRoomImage(sub, blockIndex, locName, blockName));
        $('#rpg-pick-image').off('click').on('click', () => chooseRoomImageFile(sub, blockIndex, locName, blockName));
        applyRoomImageSrc(sub);
        $('#rpg-manual-edit-desc').off('click').on('click', () => {
            const descEl = $('#rpg-info-desc');
            descEl.html(`
                <textarea id="rpg-edit-desc" class="rpg-edit-desc">${sub.desc ? sub.desc.replace(/</g, '&lt;') : ''}</textarea>
                <div class="rpg-edit-actions">
                    <button id="rpg-save-desc" class="rpg-travel-btn rpg-btn-ai-gen"><i class="fa-solid fa-check"></i> ${t('btn_save')}</button>
                    <button id="rpg-cancel-desc" class="rpg-travel-btn rpg-btn-edit-desc"><i class="fa-solid fa-xmark"></i> ${t('btn_cancel')}</button>
                </div>
            `);
            $('#rpg-save-desc').off('click').on('click', () => {
                sub.desc = $('#rpg-edit-desc').val();
                saveMapState();
                selectSublocation(sub, blockIndex, locName, blockName);
            });
            $('#rpg-cancel-desc').off('click').on('click', () => selectSublocation(sub, blockIndex, locName, blockName));
        });
        $('#rpg-go-together').off('click').on('click', () => startTravel(sub, blockIndex, false));
        $('#rpg-set-here').off('click').on('click', () => setCurrentHere(sub, blockIndex));
        $('#rpg-go-alone').off('click').on('click', () => startTravel(sub, blockIndex, true));
        $('#rpg-go-alone-move').off('click').on('click', function () {
            startTravel(sub, $(this).data('block'), true);
        });
        $('#rpg-go-back-to-char').off('click').on('click', endSoloAdventure);
    }
    } catch (err) {
        // Last-resort safety net: never leave the panel blank. Show the name and
        // a way to reset the description so the user can recover.
        console.error('selectSublocation render error:', err);
        panel.html(`
            <div class="rpg-info-title">${escapeHtml((sub && sub.name) || 'Room')}</div>
            <div class="rpg-info-desc">${t('desc_empty')}</div>
            <div class="rpg-travel-actions">
                <button class="rpg-travel-btn rpg-btn-edit-desc" id="rpg-recover-room"><i class="fa-solid fa-rotate"></i> ${t('btn_edit_manual')}</button>
            </div>
        `);
        $('#rpg-recover-room').off('click').on('click', () => {
            if (sub) { sub.desc = ''; sub.image = sub.image && typeof sub.image === 'string' ? sub.image : null; }
            saveMapState();
            selectSublocation(sub, blockIndex, locName, blockName);
        });
    }
}
function addBlockManual() {
    const name = prompt(t('prompt_block_name'), t('default_new_region'));
    if (!name) return;

    const useAi = confirm(t('confirm_ai_fill_region'));
    if (useAi) {
        generateBlockStructureWithAI(name);
    } else {
        getActiveBlocks().push({ name, locations: [] });
        saveMapState(); renderMapTree();
    }
}

async function generateBlockStructureWithAI(blockName) {
    const myChat = getContext().chatId;
    toastr.info(t('toast_building_region'));
    try {
        const sysPrompt = `You are an RPG map builder. Generate exactly 2 Locations (areas) for the region "${blockName}".
Each Location must have 2 Sub-locations (rooms). Keep descriptions empty (""). ${t('ai_lang_names')}
Output JSON: { "locations": [{"name": "Location Name", "sublocs": [{"name": "Room Name", "locked": false}]}] }`;
        const result = await callAI(sysPrompt, "Generate structure.");
        if (!ownsChat(myChat)) return;   // chat changed during the request
        getActiveBlocks().push({ name: blockName, locations: result.locations || [] });
        saveMapState(); renderMapTree();
        toastr.success(t('toast_region_done'));
    } catch (e) { console.error(e); toastr.error(t('toast_ai_failed')); }
}

function addLocationManual(bIdx) {
    const name = prompt(t('prompt_loc_name'));
    if (!name) return;
    getActiveBlocks()[bIdx].locations.push({ name, sublocs: [] });
    saveMapState(); renderMapTree();
}

function addSublocationManual(bIdx, lIdx) {
    const name = prompt(t('prompt_room_name'));
    if (!name) return;
    const isLocked = confirm(t('confirm_room_locked'));
    getActiveBlocks()[bIdx].locations[lIdx].sublocs.push({ name, desc: "", locked: isLocked, lockAttempts: 0 });
    saveMapState(); renderMapTree();
}

// === RENAME (regions / locations / rooms) ===
function renameElementManual(type, bIdx, lIdx, sIdx) {
    const blocks = getActiveBlocks();
    let target, promptKey;
    if (type === 'block') { target = blocks[bIdx]; promptKey = 'prompt_rename_block'; }
    else if (type === 'loc') { target = blocks[bIdx].locations[lIdx]; promptKey = 'prompt_rename_loc'; }
    else if (type === 'sub') { target = blocks[bIdx].locations[lIdx].sublocs[sIdx]; promptKey = 'prompt_rename_room'; }
    if (!target) return;

    const newName = prompt(t(promptKey), target.name);
    if (!newName || newName === target.name) return;

    // keep the "active room" pointer in sync if we renamed it
    const wasActive = type === 'sub' && mapState.activeSubloc && mapState.activeSubloc.name === target.name;
    target.name = newName;
    if (wasActive) mapState.activeSubloc = target;

    saveMapState();
    renderMapTree();
    updateContextInjection();
    updateSoloBar();
}

function deleteElementManual(type, bIdx, lIdx, sIdx) {
    if (!confirm(t('confirm_delete_element'))) return;
    if (type === 'block') getActiveBlocks().splice(bIdx, 1);
    if (type === 'loc') getActiveBlocks()[bIdx].locations.splice(lIdx, 1);
    if (type === 'sub') getActiveBlocks()[bIdx].locations[lIdx].sublocs.splice(sIdx, 1);
    saveMapState(); renderMapTree();
}

// === SMART DOOR UNLOCKING (LIMIT 2 ATTEMPTS) ===
function showUnlockModal(sub, ctx = {}) {
    let modal = $('#rpg-unlock-modal');
    if (modal.length === 0) {
        $('body').append(`<div id="rpg-unlock-modal"></div>`);
        modal = $('#rpg-unlock-modal');
    }

    if (sub.lockAttempts === undefined) sub.lockAttempts = 0;

    const reRenderPanel = () => selectSublocation(sub, ctx.blockIndex ?? mapState.activeMapIndex, ctx.locName || "", ctx.blockName || "");

    const inventory = getInventoryItems();
    const keys = inventory.filter(i => itemIsKeyLike(i.name));

    let keysHtml = "";
    keys.forEach(key => {
        const chance = keyChance(key);
        const safeName = escapeHtml(key.name);
        if (sub.lockAttempts >= 2 && itemIsPickLike(key.name)) {
            keysHtml += `<div class="rpg-unlock-option" style="opacity:0.3; cursor:not-allowed;">${t('unlock_broken', { name: safeName })}</div>`;
        } else {
            keysHtml += `<div class="rpg-unlock-option rpg-use-key" data-id="${key.id}">${t('unlock_use_key', { name: safeName, chance })}</div>`;
        }
    });

    modal.html(`
        <h3><i class="fa-solid fa-key"></i> ${t('unlock_title')}</h3>
        <p style="font-size:0.75rem; color:#aaa; margin-bottom:10px;">${t('unlock_attempts', { n: sub.lockAttempts })}</p>
        ${keysHtml}
        <div class="rpg-unlock-option" id="rpg-scan-char-unlock">${t('unlock_ask_char')}</div>
        <div class="rpg-unlock-option" id="rpg-lockpick-rng" style="${sub.lockAttempts >= 2 ? 'opacity:0.3; cursor:not-allowed;' : ''}">${t('unlock_force')}</div>
        <button id="rpg-unlock-close" style="background:#424242; color:white; width:100%; border:none; padding:8px; border-radius:4px; cursor:pointer; margin-top:10px;">${t('btn_cancel')}</button>
    `);

    modal.fadeIn();
    $('#rpg-unlock-close').on('click', () => modal.fadeOut());

    if (sub.lockAttempts < 2) {
        $('#rpg-lockpick-rng').off('click').on('click', () => {
            sub.lockAttempts++;
            saveMapState();
            if (Math.random() < 0.1) {
                toastr.success(t('toast_pick_success'));
                sub.locked = false;
                saveMapState(); renderMapTree(); reRenderPanel(); modal.fadeOut();
            } else {
                toastr.error(t('toast_pick_fail', { n: sub.lockAttempts }));
                showUnlockModal(sub, ctx);
            }
        });
    }

    $('.rpg-use-key').off('click').on('click', function () {
        const keyId = $(this).data('id');
        const key = inventory.find(i => i.id === keyId);
        if (!key) return;

        if (itemIsPickLike(key.name)) {
            sub.lockAttempts++;
            saveMapState();
        }

        // Remove the item (key or lockpick) from inventory
        removeInventoryItem(keyId);

        const roll = Math.random() * 100;
        if (roll <= keyChance(key)) {
            toastr.success(t('toast_key_success'));
            sub.locked = false;
            saveMapState(); renderMapTree(); reRenderPanel(); modal.fadeOut();
        } else {
            toastr.error(t('toast_key_fail'));
            showUnlockModal(sub, ctx);
        }
    });

    $('#rpg-scan-char-unlock').off('click').on('click', () => {
        const context = getContext();
        const lastMsgs = context.chat.slice(-5).filter(m => !m.is_user);
        const kws = langObj().scan_keywords || I18N.en.scan_keywords;
        let found = false;
        lastMsgs.forEach(m => {
            const low = (m.mes || '').toLowerCase();
            if (kws.some(k => low.includes(k))) found = true;
        });

        if (found) {
            toastr.success(t('toast_scan_success'));
            sub.locked = false;
            saveMapState(); renderMapTree(); reRenderPanel(); modal.fadeOut();
        } else {
            toastr.error(t('toast_scan_fail'));
        }
    });
}

// === TRAVEL & EXPLORE ===
async function getTravelInfo(fromName, toName) {
    if (!mapState.travelTimes) mapState.travelTimes = {};
    const key = `${fromName}->${toName}`;
    if (mapState.travelTimes[key]) return mapState.travelTimes[key];
    const myChat = getContext().chatId;
    let info = { distance: t('travel_default_distance'), time: t('travel_default_time') };
    try {
        const sys = `Estimate a realistic travel distance and time between two in-world places, fitting the story's setting and era. Keep both very short. ${t('ai_lang_text')}
Output strictly JSON: { "distance": "e.g. 3 miles", "time": "e.g. 30 minutes" }`;
        const r = await callAI(sys, `From "${fromName}" to "${toName}".`);
        if (r && r.distance && r.time) info = { distance: r.distance, time: r.time };
    } catch (e) {}
    if (!ownsChat(myChat)) return info;   // chat changed: hand the info back, but don't cache/save
    mapState.travelTimes[key] = info;
    saveMapState();
    return info;
}

// Mark a room as the current location WITHOUT writing anything to the chat.
// Useful when a scene already starts you somewhere (e.g. the foyer) and you
// just want the map/context to catch up, not narrate a journey.
function setCurrentHere(sub, blockIndex) {
    mapState.activeBlockIndex = blockIndex;
    mapState.activeSubloc = sub;
    mapState.soloHistoryCount = 0;
    saveMapState();
    renderMapTree();
    $('#rpg-map-modal').removeClass('visible');
    updateSoloBar();
    updateContextInjection();
    applyRoomBackground(sub);
    ambPlayFor(sub);
    musStart(sub);
}

async function startTravel(sub, blockIndex, isSolo = false) {
    const myChat = getContext().chatId;
    const charName = primaryCharName();
    const activeBlocks = getActiveBlocks();

    // Compose the full message FIRST, set the textarea ONCE at the end.
    // Previously the travel line was written and then immediately overwritten
    // by the "go alone / go together" line — the journey narration never
    // reached the chat (and the getTravelInfo AI call was wasted).
    let travelMsg = '';
    if (mapState.activeBlockIndex !== blockIndex) {
        const oldBlockName = activeBlocks[mapState.activeBlockIndex] ? activeBlocks[mapState.activeBlockIndex].name : (activeBlocks[blockIndex]?.name || "start");
        const newBlockName = activeBlocks[blockIndex] ? activeBlocks[blockIndex].name : "the new location";

        if (oldBlockName !== newBlockName) {
            const tr = await getTravelInfo(oldBlockName, newBlockName);   // may await the AI
            if (!ownsChat(myChat)) return;   // chat changed while estimating the journey
            travelMsg = t('sys_travel', { old: oldBlockName, new: newBlockName, dist: tr.distance, time: tr.time, char: charName });
        }
        mapState.activeBlockIndex = blockIndex;
    }

    mapState.activeSubloc = sub;
    mapState.isSolo = isSolo;
    mapState.soloHistoryCount = 0;

    saveMapState();
    renderMapTree();
    $('#rpg-map-modal').removeClass('visible');
    updateSoloBar();
    updateContextInjection();
    applyRoomBackground(sub);
    ambPlayFor(sub);
    musStart(sub);

    const goMsg = isSolo
        ? t('sys_go_alone', { name: sub.name })
        : t('sys_go_together', { name: sub.name, desc: sub.desc || t('default_room') });
    if (isSolo) toastr.info(t('toast_solo_enter', { name: sub.name }));
    $('#send_textarea').val((travelMsg ? travelMsg + '\n\n' : '') + goMsg).trigger('input');

    // hidden random encounter (not every time)
    if (Math.random() < (settings.eventChance ?? 0.25)) {
        setTimeout(() => triggerMapEncounter(sub), 500);
    }
}

// === HIDDEN RANDOM ENCOUNTERS (reaction mini-game + inventory + consequences) ===
async function triggerMapEncounter(sub) {
    const myChat = getContext().chatId;
    let enc = {
        situation: t('enc_default_situation', { name: sub.name }),
        success: t('enc_default_success'),
        fail: t('enc_default_fail')
    };
    try {
        const sys = `Create a SHORT hidden random encounter for a player who just entered a location in an RPG.
It should be a small surprise, threat or opportunity. Keep it tense and brief.
Output strictly JSON: { "situation": "1-2 sentences: what suddenly happens", "success": "1 sentence consequence if the player reacts fast/well", "fail": "1 sentence consequence if the player reacts slowly/poorly" }
${t('ai_lang_text')} Fit the location.`;
        const r = await callAI(sys, `Location: "${sub.name}". Description: ${sub.desc || 'unknown'}.`);
        if (r && r.situation) enc = { situation: r.situation, success: r.success || enc.success, fail: r.fail || enc.fail };
    } catch (e) {}
    if (!ownsChat(myChat)) return;   // chat changed: don't pop an encounter from the old chat
    showEncounterModal(sub, enc);
}

let encounterTimers = [];
function clearEncounterTimers() {
    encounterTimers.forEach(id => clearTimeout(id));
    encounterTimers = [];
}

function showEncounterModal(sub, enc) {
    let modal = $('#rpg-encounter-modal');
    if (modal.length === 0) { $('body').append('<div id="rpg-encounter-modal"></div>'); modal = $('#rpg-encounter-modal'); }
    clearEncounterTimers();

    const items = getInventoryItems().slice(0, 4);
    const itemsHtml = items.length
        ? `<div class="rpg-enc-items-title">${t('enc_items_title')}</div><div class="rpg-enc-items">` +
          items.map(i => `<button class="rpg-enc-item" data-id="${i.id}" data-name="${escapeHtml(i.name)}">${escapeHtml(i.name)}</button>`).join('') + `</div>`
        : '';

    modal.html(`
        <div class="rpg-enc-card">
            <div class="rpg-enc-tag"><i class="fa-solid fa-bolt"></i> ${t('enc_tag')}</div>
            <div class="rpg-enc-situation">${escapeHtml(enc.situation)}</div>
            <div class="rpg-enc-game">
                <div class="rpg-enc-instructions">${t('enc_instructions')}</div>
                <button class="rpg-enc-react" id="rpg-enc-react">${t('enc_wait')}</button>
            </div>
            ${itemsHtml}
            <div class="rpg-enc-result" id="rpg-enc-result"></div>
            <div style="text-align:center; margin-top:8px;">
                <span id="rpg-enc-skip" style="font-size:0.75rem; color:#9a917e; cursor:pointer; text-decoration:underline;">${t('enc_skip')}</span>
            </div>
        </div>
    `);
    modal.fadeIn();

    const btn = $('#rpg-enc-react');
    let armed = false, done = false;

    // FIX: button stays clickable from the start so an early press can fail;
    // it only turns green (armed) after a random delay.
    const armDelay = 900 + Math.random() * 2200;
    const armTimer = setTimeout(() => {
        if (done) return;
        armed = true;
        btn.addClass('armed').text(t('enc_react'));
        const slowTimer = setTimeout(() => { if (!done) finish('fail'); }, 1400); // reaction window
        encounterTimers.push(slowTimer);
    }, armDelay);
    encounterTimers.push(armTimer);

    btn.off('click').on('click', () => {
        if (done) return;
        finish(armed ? 'success' : 'early'); // pressing before green = too early = fail
    });

    $('.rpg-enc-item').off('click').on('click', function () {
        if (done) return;
        removeInventoryItem($(this).data('id'));
        finish('item', $(this).data('name'));
    });

    $('#rpg-enc-skip').off('click').on('click', () => { clearEncounterTimers(); modal.fadeOut(); });

    function finish(kind, itemName) {
        if (done) return;
        done = true;
        clearEncounterTimers();
        btn.prop('disabled', true).removeClass('armed');
        let outcome, cls;
        if (kind === 'success') { outcome = enc.success; cls = 'ok'; }
        else if (kind === 'item') { outcome = t('enc_item_outcome', { item: itemName, success: enc.success }); cls = 'ok'; }
        else if (kind === 'early') { outcome = t('enc_early') + ' ' + enc.fail; cls = 'bad'; }
        else { outcome = enc.fail; cls = 'bad'; }

        $('.rpg-enc-item, .rpg-enc-react').prop('disabled', true).css('opacity', 0.5);
        $('#rpg-enc-result').attr('class', 'rpg-enc-result ' + cls)
            .html(`${escapeHtml(outcome)}<br><button id="rpg-enc-send" class="rpg-enc-send"><i class="fa-solid fa-paper-plane"></i> ${t('enc_send')}</button>`);
        $('#rpg-enc-send').off('click').on('click', () => {
            const msg = t('sys_encounter', { name: sub.name, situation: enc.situation, outcome });
            const cur = $('#send_textarea').val();
            $('#send_textarea').val((cur ? cur + "\n\n" : "") + msg).trigger('input');
            modal.fadeOut();
        });
    }
}

function endSoloAdventure() {
    toastr.info(t('toast_return'));
    mapState.isSolo = false;
    saveMapState();
    updateSoloBar();
    updateContextInjection();

    const name = mapState.activeSubloc ? mapState.activeSubloc.name : '';
    $('#send_textarea').val(t('sys_end_solo', { name })).trigger('input');
}

function updateSoloBar() {
    let bar = $('#rpg-solo-bar');
    if (bar.length === 0) {
        $('body').append(`<div id="rpg-solo-bar"></div>`);
        bar = $('#rpg-solo-bar');
    }

    if (!settings.enabled || !mapState.isSolo || !mapState.activeSubloc) {
        bar.fadeOut(); return;
    }

    bar.html(`
        <div class="rpg-solo-title"><i class="fa-solid fa-shoe-prints"></i> ${t('solo_title')}</div>
        <div class="rpg-solo-loc">${t('solo_at')} <b>${escapeHtml(mapState.activeSubloc.name)}</b></div>
        <button id="rpg-end-solo" class="rpg-solo-return"><i class="fa-solid fa-arrow-left-long"></i> ${t('btn_return_char')}</button>
    `);
    bar.fadeIn();

    $('#rpg-end-solo').off('click').on('click', endSoloAdventure);
}

function updateContextInjection() {
    if (!settings.enabled || settings.injectDepth < 0) return;

    let openRooms = [];
    let lockedRooms = [];

    const activeBlocks = getActiveBlocks();
    activeBlocks.forEach(b => {
        (b.locations || []).forEach(l => {
            (l.sublocs || []).forEach(s => {
                if (s.locked) lockedRooms.push(s.name); else openRooms.push(s.name);
            });
        });
    });

    let text = `\n[Map Context: Active Location: "${mapState.activeSubloc ? mapState.activeSubloc.name : 'None'}". Available places: ${openRooms.join(', ')}. Locked places: ${lockedRooms.join(', ')}]\n`;

    if (mapState.isSolo && mapState.activeSubloc) {
        text += `\n[CRITICAL SYSTEM RULE: Active Location is "${mapState.activeSubloc.name}". Description: "${mapState.activeSubloc.desc || 'A simple room.'}".
        The main character is ABSENT from this scene. You are temporarily FORBIDDEN from acting, speaking, or generating thoughts as the character.
        Instead, you must act as the WORLD STORYTELLER / GAME MASTER.
        Describe the player's immediate surroundings in "${mapState.activeSubloc.name}".
        Let them explore, search drawers, meet local NPCs, or encounter small RPG challenges.
        ${t('inject_solo_lang')} Provide choices or ask what the player does next.]\n`;
    }

    setExtensionPrompt(PROMPT_KEY, text, 2, settings.injectDepth, false, extension_prompt_roles.SYSTEM);
}

// === MAP IMPORT & EXPORT ===
function downloadJson(obj, filename) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// Light export: only structure + image references (small, same-device backup)
function exportMap() {
    downloadJson(mapState.maps, 'rpg_map_profile.json');
    toastr.success(t('toast_exported'));
}

// Full export: inline the actual image bytes (from IndexedDB) so the file is
// portable to another device / share. Larger file, but self-contained.
async function exportMapFull() {
    toastr.info(t('toast_bundling'));
    try {
        const maps = JSON.parse(JSON.stringify(mapState.maps));
        for (const map of maps) {
            for (const b of (map.blocks || [])) {
                for (const l of (b.locations || [])) {
                    for (const s of (l.sublocs || [])) {
                        if (s.image && String(s.image).startsWith('idb:')) {
                            const data = await idbGet(String(s.image).slice(4));
                            s.image = data || null;   // embed the data URL, or drop if missing
                            delete s.imageKey;
                        }
                    }
                }
            }
        }
        downloadJson(maps, 'rpg_map_profile_full.json');
        toastr.success(t('toast_exported'));
    } catch (e) { console.error('Full export error:', e); toastr.error(t('toast_export_fail')); }
}

function importMap() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            (async () => {
                try {
                    const importedMaps = JSON.parse(event.target.result);
                    if (!Array.isArray(importedMaps)) { toastr.error(t('toast_import_bad')); return; }

                    // If a file carries inlined images (data URLs), move them back
                    // into IndexedDB so the running map state stays lightweight.
                    for (const map of importedMaps) {
                        for (const b of (map.blocks || [])) {
                            for (const l of (b.locations || [])) {
                                for (const s of (l.sublocs || [])) {
                                    if (s.image && String(s.image).startsWith('data:')) {
                                        const key = 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
                                        await idbSet(key, s.image);
                                        s.image = 'idb:' + key;
                                        s.imageKey = key;
                                    }
                                }
                            }
                        }
                    }

                    mapState.maps = importedMaps;
                    mapState.activeMapIndex = 0;
                    mapState.activeBlockIndex = 0;
                    saveMapState();
                    renderMapTree();
                    toastr.success(t('toast_imported'));
                } catch (err) { console.error('Import error:', err); toastr.error(t('toast_import_err')); }
            })();
        };
        reader.readAsText(file);
    };
    fileInput.click();
}

// === MAP UI RENDER ===
function renderMapUI() {
    const context = getContext();
    const inChat = !!context.chatId; // hide the floating button on the ST welcome screen

    let container = $('#rpg-buttons-container');
    if (container.length === 0) {
        container = $('<div id="rpg-buttons-container" style="position:fixed; bottom:20px; right:20px; display:flex; gap:15px; z-index:3000;"></div>');
        $('body').append(container);
    }

    let btn = $('#rpg-map-btn');
    if (btn.length === 0) {
        btn = $(`<div class="rpg-floating-btn" id="rpg-map-btn" title="${t('modal_title')}" style="position:static; width:50px; height:50px; margin:0; display:flex;"><i class="fa-solid fa-map-location-dot"></i></div>`);
        container.prepend(btn);
    }
    btn.attr('title', t('modal_title'));

    // Clean up any old standalone ghosts
    $('#rpg-map-btn-standalone').remove();

    // Icon only appears inside a character chat, never on the home screen
    if (!settings.enabled || !inChat) {
        btn.hide();
        $('#rpg-map-modal').removeClass('visible');
        return;
    }
    btn.show();

    let modal = $('#rpg-map-modal');
    if (modal.length === 0) {
        $('body').append(`
            <div class="rpg-modal" id="rpg-map-modal">
                <div class="rpg-modal-header" id="rpg-map-drag">
                    <span><i class="fa-solid fa-map-location-dot"></i> ${t('modal_title')}</span>
                    <div style="display:flex; align-items:center;">
                        <span id="rpg-amb-brief" data-nodrag title="${t('amb_brief')}" style="display:none;cursor:pointer;font-size:13px;margin-right:4px;user-select:none;vertical-align:middle;">✎</span>
                        <span id="rpg-amb-badge" data-nodrag title="" style="display:none;cursor:pointer;font-size:16px;margin-right:6px;user-select:none;vertical-align:middle;"></span>
                        <select id="rpg-amb-pick" title="${t('amb_pick')}" style="display:none;font-size:11px;padding:1px 4px;margin-right:6px;vertical-align:middle;border-radius:6px;"></select>
                        <span id="rpg-mus-badge" data-nodrag title="" style="display:none;cursor:pointer;font-size:16px;margin-right:4px;user-select:none;vertical-align:middle;"></span>
                        <select id="rpg-mus-mood" title="${t('mus_mood')}" style="display:none;font-size:11px;padding:1px 4px;margin-right:4px;vertical-align:middle;border-radius:6px;"></select>
                        <span id="rpg-mus-reroll" data-nodrag title="${t('mus_reroll')}" style="display:none;cursor:pointer;font-size:14px;margin-right:4px;user-select:none;vertical-align:middle;">🎲</span>
                        <span id="rpg-mus-brief" data-nodrag title="${t('mus_brief')}" style="display:none;cursor:pointer;font-size:14px;margin-right:4px;user-select:none;vertical-align:middle;">✎</span>
                        <span id="rpg-mus-compose" data-nodrag title="${t('mus_compose')}" style="display:none;cursor:pointer;font-size:14px;margin-right:4px;user-select:none;vertical-align:middle;">🎼</span>
                        <span id="rpg-mus-save" data-nodrag title="${t('mus_save')}" style="display:none;cursor:pointer;font-size:14px;margin-right:8px;user-select:none;vertical-align:middle;">⭐</span>
                        <span id="rpg-mus-del" data-nodrag title="${t('mus_del')}" style="display:none;cursor:pointer;font-size:13px;margin-right:8px;user-select:none;vertical-align:middle;">🗑</span>
                        <button id="rpg-map-edit-toggle">${t('btn_editor')}</button>
                        <i class="fa-solid fa-xmark rpg-modal-close"></i>
                    </div>
                </div>
                <div class="rpg-map-body">
                    <div class="rpg-map-left-panel">
                        <div id="rpg-map-tabs-holder"></div>
                        <div class="rpg-map-tree" id="rpg-map-tree-container"></div>
                    </div>
                    <div class="rpg-map-info-panel">
                        <div class="rpg-info-scroll" id="rpg-map-info-content">
                            <div class="rpg-quest-empty">${t('info_select_room')}</div>
                        </div>
                    </div>
                </div>
            </div>
        `);
        modal = $('#rpg-map-modal');
        makeModalDraggable(document.getElementById('rpg-map-modal'), document.getElementById('rpg-map-drag'));
    }

    btn.off('click').on('click', () => {
        renderMapTree();
        modal.toggleClass('visible');
    });
    // Delegated + namespaced, and scoped to OUR modal only: the previous blanket
    // $('.rpg-modal-close').off('click') stripped the Tavern engine's close
    // handlers from ITS modals too (they only kept working by luck).
    $(document).off('click.rpgMapClose').on('click.rpgMapClose', '#rpg-map-modal .rpg-modal-close', function () { $(this).closest('.rpg-modal').removeClass('visible'); });
}

function makeModalDraggable(elmnt, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.addEventListener('mousedown', dragMouseDown);

    function dragMouseDown(e) {
        // Anything you can actually operate must be left alone. preventDefault on the
        // header swallowed the mousedown, so a <select> in there never opened and a
        // badge never registered a click — the whole strip was one big drag handle.
        if (e.target.closest('select, button, input, textarea, option, label, [data-nodrag]')) return;
        if (e.target.closest('.rpg-modal-close') || e.target.closest('#rpg-map-edit-toggle')) return;
        e.preventDefault();
        pos3 = e.clientX; pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
        pos3 = e.clientX; pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// === SETTINGS MENU ===
function buildSettingsHtml() {
    return `
<div class="extension_settings rpg-map-settings">
    <div class="inline-drawer">
        <div class="rpg-map-toggle inline-drawer-header" style="cursor: pointer;">
            <b><i class="fa-solid fa-map-location-dot"></i> ${t('set_header')}</b>
            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content" id="rpg-map-drawer-content" style="display: none; padding-top: 10px;">
            <label class="checkbox_label"><input type="checkbox" id="rpg-map-enabled"> ${t('set_enable')}</label>
            <div class="flex-container alignitemscenter flexgap5 margin-b-10" style="margin-top:8px;">
                <label>${t('set_language')}:</label>
                <select id="rpg-map-language" class="text_pole" style="width:auto;">
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                </select>
            </div>
            <hr class="sysHR">
            <h4>${t('set_api')}</h4>
            <input type="text" id="rpg-map-base" class="text_pole margin-b-10" placeholder="${t('set_url')}" style="width:100%;">
            <input type="password" id="rpg-map-key" class="text_pole margin-b-10" placeholder="${t('set_key')}" style="width:100%;">
            <input type="text" id="rpg-map-model" class="text_pole margin-b-10" placeholder="${t('set_model')}" style="width:100%;">
            <div id="rpg-map-route" style="font-size:.72rem;opacity:.75;line-height:1.4;word-break:break-all;margin:-4px 0 10px;"></div>
            <div class="flex-container alignitemscenter flexgap5 margin-b-10">
                <label>${t('set_depth')}</label>
                <input type="number" id="rpg-map-depth" class="text_pole" min="0" style="width:50px;">
            </div>
            <div class="flex-container alignitemscenter flexgap5 margin-b-10">
                <label>${t('set_event_chance')}</label>
                <input type="number" id="rpg-map-event-chance" class="text_pole" min="0" max="1" step="0.05" style="width:60px;">
            </div>
            <hr class="sysHR">
            <h4>${t('set_scan')}</h4>
            <label class="checkbox_label">
                <input type="checkbox" id="rpg-map-scan-card"> ${t('set_use_card')}
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="rpg-map-scan-lore" style="margin-top:5px;"> ${t('set_use_lore')}
            </label>
            <hr class="sysHR">
            <h4>${t('amb_h')}</h4>
            <label class="checkbox_label"><input type="checkbox" id="rpg-amb-toggle"> ${t('amb_on')}</label>
            <div style="font-size:.78rem;opacity:.75;line-height:1.45;margin:4px 0 8px;">${t('amb_hint')}</div>
            <div class="flex-container alignitemscenter flexgap5 margin-b-10">
                <label style="min-width:90px;">${t('amb_vol')}</label>
                <input type="range" id="rpg-amb-vol" min="0" max="100" step="5" style="flex:1;">
                <span id="rpg-amb-vol-val" style="min-width:34px;text-align:right;"></span>
            </div>
            <label class="checkbox_label"><input type="checkbox" id="rpg-amb-room"> ${t('amb_room')}</label>
            <label class="checkbox_label"><input type="checkbox" id="rpg-amb-pad"> ${t('amb_pad')}</label>
            <div style="font-size:.78rem;opacity:.75;line-height:1.45;margin:-2px 0 8px;">${t('amb_pad_hint')}</div>
            <label class="checkbox_label"><input type="checkbox" id="rpg-amb-music"> ${t('mus_on')}</label>
            <div class="flex-container alignitemscenter flexgap5 margin-b-10">
                <label style="min-width:90px;">${t('mus_vol')}</label>
                <input type="range" id="rpg-amb-musvol" min="0" max="100" step="5" style="flex:1;">
                <span id="rpg-amb-musvol-val" style="min-width:34px;text-align:right;"></span>
            </div>
            <div style="font-size:.78rem;opacity:.75;line-height:1.45;margin:0 0 8px;">${t('mus_hint')}</div>
            <div class="flex-container alignitemscenter flexgap5 margin-b-10">
                <label style="min-width:90px;">${t('mus_lines')}</label>
                <input type="number" id="rpg-mus-lines" class="text_pole" min="0" max="12" style="width:60px;">
            </div>
            <label style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <b>${t('mus_prompt')}</b>
                <button class="menu_button" id="rpg-mus-prompt-reset" style="font-size:.7rem;padding:2px 8px;">${t('mus_reset')}</button>
            </label>
            <textarea id="rpg-mus-prompt" class="text_pole" rows="8" style="font-family:Consolas,monospace;font-size:.75rem;"></textarea>
            <div style="font-size:.78rem;opacity:.75;line-height:1.45;margin:4px 0 8px;">${t('mus_prompt_hint')}</div>
            <div class="menu_button" id="rpg-amb-test" style="margin-top:8px;">${t('amb_test')}</div>
            <hr class="sysHR">
            <h4>${t('img_section')}</h4>
            <label class="checkbox_label"><input type="checkbox" id="rpg-img-enabled"> ${t('img_enable')}</label>
            <div class="flex-container alignitemscenter flexgap5 margin-b-10" style="margin-top:8px;">
                <label>${t('img_mode')}:</label>
                <select id="rpg-img-mode" class="text_pole" style="width:auto;">
                    <option value="auto">${t('img_mode_auto')}</option>
                    <option value="openrouter">${t('img_mode_openrouter')}</option>
                    <option value="openai">${t('img_mode_openai')}</option>
                </select>
            </div>
            <input type="text" id="rpg-img-url" class="text_pole margin-b-10" placeholder="${t('img_api_url')}" style="width:100%;">
            <input type="password" id="rpg-img-key" class="text_pole margin-b-10" placeholder="${t('img_api_key')}" style="width:100%;">
            <input type="text" id="rpg-img-model" class="text_pole margin-b-10" placeholder="${t('img_model')}" style="width:100%;">
            <select id="rpg-img-size-preset" class="text_pole margin-b-10" style="width:100%;" title="${t('img_size')}">
                <option value="">${t('img_size_custom')}</option>
                <option value="1024x576">1024×576 (16:9)</option>
                <option value="1280x720">1280×720 (16:9)</option>
                <option value="1700x900">1700×900 (17:9)</option>
                <option value="1920x1080">1920×1080 (16:9 Full HD)</option>
            </select>
            <input type="text" id="rpg-img-size" class="text_pole margin-b-10" placeholder="${t('img_size')}" style="width:100%;">
            <input type="text" id="rpg-img-style" class="text_pole margin-b-10" placeholder="${t('img_style')}" style="width:100%;">
            <input type="text" id="rpg-img-time" class="text_pole margin-b-10" placeholder="${t('img_time')}" style="width:100%;">
            <input type="text" id="rpg-img-weather" class="text_pole margin-b-10" placeholder="${t('img_weather')}" style="width:100%;">
            <div class="flex-container alignitemscenter flexgap5 margin-b-10">
                <label>${t('img_frame')}:</label>
                <select id="rpg-img-frame" class="text_pole" style="width:auto;">
                    <option value="plain">${t('img_frame_plain')}</option>
                    <option value="worn">${t('img_frame_worn')}</option>
                </select>
            </div>
            <label style="font-size:0.8rem; color:#aaa; display:block; margin-bottom:4px;">${t('img_template')}</label>
            <textarea id="rpg-img-template" class="text_pole" style="width:100%; min-height:110px; font-size:0.78rem; line-height:1.4;"></textarea>
            <label class="checkbox_label" style="margin-top:8px;"><input type="checkbox" id="rpg-img-syncbg"> ${t('set_sync_bg')}</label>
            <label class="checkbox_label" style="margin-top:5px;"><input type="checkbox" id="rpg-img-savebg"> ${t('set_save_bg')}</label>
            <hr class="sysHR">
            <h4>${t('set_saves')}</h4>
            <button id="rpg-map-export-btn" class="rpg-add-stat-btn" style="width:100%; margin-bottom:10px;"><i class="fa-solid fa-file-export"></i> ${t('set_export')}</button>
            <button id="rpg-map-export-full-btn" class="rpg-add-stat-btn" style="width:100%; margin-bottom:10px;"><i class="fa-solid fa-file-zipper"></i> ${t('set_export_full')}</button>
            <button id="rpg-map-import-btn" class="rpg-add-stat-btn" style="width:100%; margin-bottom:10px; background:rgba(105, 240, 174, 0.1); border-color:#69f0ae;"><i class="fa-solid fa-file-import"></i> ${t('set_import')}</button>
            <hr class="sysHR">
            <button id="rpg-map-force-regen-btn" style="width:100%; padding:8px; background:rgba(139, 92, 246, 0.2); border:1px solid #e040fb; border-radius:6px; color:white; cursor:pointer;">${t('set_force_regen')}</button>
        </div>
    </div>
</div>
`;
}

function mountSettings() {
    $('.rpg-map-settings').remove();
    $('#extensions_settings').append(buildSettingsHtml());

    $('.rpg-map-settings .rpg-map-toggle').on('click', function () {
        $('#rpg-map-drawer-content').slideToggle();
        $(this).find('.inline-drawer-icon').toggleClass('down up');
    });

    $('#rpg-map-enabled').prop('checked', settings.enabled).on('change', function () {
        settings.enabled = this.checked; saveSettings();
        renderMapUI(); loadMapState();
    });

    const ambS = () => (settings.ambience || (settings.ambience = { enabled: false, volume: 40, room: true, pad: true }));
    $('#rpg-amb-toggle').prop('checked', !!ambS().enabled).on('change', function () {
        ambS().enabled = this.checked; saveSettings();
        if (this.checked) { const sub = mapState.activeSubloc; if (sub) { ambPlayFor(sub); musStart(sub); } }
        else { ambStop(); ambUpdateBadge(null); }
    });
    $('#rpg-amb-vol').val(ambS().volume ?? 40).on('input', function () {
        ambS().volume = Math.max(0, Math.min(100, parseInt(this.value, 10) || 0)); $('#rpg-amb-vol-val').text(ambS().volume + '%');
        saveSettings(); ambSetVolumes();
    });
    $('#rpg-amb-vol-val').text((ambS().volume ?? 40) + '%');
    $('#rpg-amb-room').prop('checked', ambS().room !== false).on('change', function () {
        ambS().room = this.checked; saveSettings(); ambSetVolumes();
    });
    $('#rpg-amb-pad').prop('checked', ambS().padAlt === true).on('change', function () {
        ambS().padAlt = this.checked; saveSettings();
        // the pad is built, not faded: switching it on has to start it playing
        const sub = mapState.activeSubloc;
        if (ambS().enabled && sub) { ambStop(); ambPlayFor(sub); } else ambSetVolumes();
    });
    $('#rpg-amb-music').prop('checked', ambS().music !== false).on('change', function () {
        ambS().music = this.checked; saveSettings();
        const sub = mapState.activeSubloc;
        if (this.checked && ambS().enabled && sub) musStart(sub); else musStop();
        musUpdateBadge();
    });
    $('#rpg-amb-musvol').val(ambS().musicVol ?? 55).on('input', function () {
        ambS().musicVol = Math.max(0, Math.min(100, parseInt(this.value, 10) || 0));
        $('#rpg-amb-musvol-val').text(ambS().musicVol + '%');
        saveSettings();
        if (MUS.gain && MUS.ctx) MUS.gain.gain.setTargetAtTime(ambS().musicVol / 100, MUS.ctx.currentTime, 0.3);
    });
    $('#rpg-amb-musvol-val').text((ambS().musicVol ?? 55) + '%');

    $('#rpg-mus-lines').val(ambS().sceneLines ?? 1).on('change', function () {
        ambS().sceneLines = Math.max(0, Math.min(12, parseInt(this.value, 10) || 0));
        $(this).val(ambS().sceneLines); saveSettings();
    });
    $('#rpg-mus-prompt').val(ambS().prompt || MUS_DEFAULT_PROMPT).on('change', function () {
        ambS().prompt = $(this).val(); saveSettings();
    });
    $('#rpg-mus-prompt-reset').on('click', function (e) {
        e.preventDefault();
        ambS().prompt = MUS_DEFAULT_PROMPT;
        $('#rpg-mus-prompt').val(MUS_DEFAULT_PROMPT); saveSettings();
    });

    $('#rpg-amb-test').on('click', function () {
        ambS().enabled = true; saveSettings(); $('#rpg-amb-toggle').prop('checked', true);
        const sub = mapState.activeSubloc || { name: 'test', desc: 'rain on the window' };
        ambStop(); ambPlayFor(sub); musStop(true); musStart(sub);
    });
    $(document).off('click', '#rpg-amb-badge').on('click', '#rpg-amb-badge', ambToggleFromBadge);
    $(document).off('click', '#rpg-mus-reroll').on('click', '#rpg-mus-reroll', musReroll);
    $(document).off('change', '#rpg-mus-mood').on('change', '#rpg-mus-mood', function () {
        const v = this.value;
        if (v.startsWith('pin:')) musUsePiece(v.slice(4)); else musSetMood(v);
    });
    $(document).off('click', '#rpg-mus-compose').on('click', '#rpg-mus-compose', async function () {
        const sub = mapState.activeSubloc;
        if (!sub) return;
        const piece = await musCompose(sub, false);
        if (piece) { musStop(true); musStart(sub); musUpdateBadge(); }
    });
    $(document).off('click', '#rpg-mus-save').on('click', '#rpg-mus-save', musSaveCurrent);
    $(document).off('click', '#rpg-mus-brief').on('click', '#rpg-mus-brief', musAskBrief);
    $(document).off('change', '#rpg-amb-pick').on('change', '#rpg-amb-pick', function () { ambSetProfile(this.value); });
    $(document).off('click', '#rpg-amb-brief').on('click', '#rpg-amb-brief', ambAskBrief);
    $(document).off('click', '#rpg-mus-del').on('click', '#rpg-mus-del', musDeleteCurrent);
    $(document).off('click', '#rpg-mus-badge').on('click', '#rpg-mus-badge', function () {
        const a = settings.ambience || (settings.ambience = {});
        a.music = a.music === false;
        saveSettings(); $('#rpg-amb-music').prop('checked', a.music);
        if (a.music) { const sub = mapState.activeSubloc; if (sub) musStart(sub); } else { musStop(); }
        musUpdateBadge();
    });

    $('#rpg-map-language').val(settings.language).on('change', function () {
        settings.language = $(this).val();
        saveSettings();
        // full re-skin without touching CSS/DOM structure
        mountSettings();
        $('#rpg-map-modal').remove();
        renderMapUI();
        renderMapTree();
        updateSoloBar();
        $('#rpg-map-info-content').html(`<div class="rpg-quest-empty">${t('info_select_room')}</div>`);
    });

    $('#rpg-map-base').val(settings.baseUrl).on('change', function () { settings.baseUrl = $(this).val(); saveSettings(); showRoute(); });
    $('#rpg-map-key').val(settings.apiKey).on('change', function () { settings.apiKey = $(this).val(); saveSettings(); showRoute(); });
    $('#rpg-map-model').val(settings.model).on('change', function () { settings.model = $(this).val(); saveSettings(); showRoute(); });
    $('#rpg-map-depth').val(settings.injectDepth).on('change', function () { settings.injectDepth = Math.max(0, parseInt($(this).val()) || 0); $(this).val(settings.injectDepth); saveSettings(); });
    $('#rpg-map-event-chance').val(settings.eventChance).on('change', function () {
        let v = parseFloat($(this).val());
        if (isNaN(v)) v = 0.25;
        settings.eventChance = Math.min(1, Math.max(0, v));
        saveSettings();
    });

    $('#rpg-map-scan-card').prop('checked', settings.scanCard).on('change', function () { settings.scanCard = this.checked; saveSettings(); });
    $('#rpg-map-scan-lore').prop('checked', settings.scanLore).on('change', function () { settings.scanLore = this.checked; saveSettings(); });

    // --- room image settings ---
    const img = settings.images;
    $('#rpg-img-enabled').prop('checked', img.enabled).on('change', function () { img.enabled = this.checked; saveSettings(); });
    $('#rpg-img-mode').val(img.mode).on('change', function () { img.mode = $(this).val(); saveSettings(); });
    $('#rpg-img-url').val(img.apiUrl).on('change', function () { img.apiUrl = $(this).val(); saveSettings(); });
    $('#rpg-img-key').val(img.apiKey).on('change', function () { img.apiKey = $(this).val(); saveSettings(); });
    $('#rpg-img-model').val(img.model).on('change', function () { img.model = $(this).val(); saveSettings(); });
    const syncSizePreset = () => { const known = ['1024x576', '1280x720', '1700x900', '1920x1080']; $('#rpg-img-size-preset').val(known.includes(img.size) ? img.size : ''); };
    $('#rpg-img-size').val(img.size).on('change', function () { img.size = $(this).val(); saveSettings(); syncSizePreset(); });
    $('#rpg-img-size-preset').on('change', function () { const v = $(this).val(); if (v) { img.size = v; $('#rpg-img-size').val(v); saveSettings(); } });
    syncSizePreset();
    $('#rpg-img-style').val(img.style).on('change', function () { img.style = $(this).val(); saveSettings(); });
    $('#rpg-img-time').val(img.timeOfDay).on('change', function () { img.timeOfDay = $(this).val(); saveSettings(); });
    $('#rpg-img-weather').val(img.weather).on('change', function () { img.weather = $(this).val(); saveSettings(); });
    $('#rpg-img-frame').val(img.frame).on('change', function () { img.frame = $(this).val(); saveSettings(); });
    $('#rpg-img-template').val(img.template).on('change', function () { img.template = $(this).val(); saveSettings(); });
    $('#rpg-img-syncbg').prop('checked', img.syncBackground).on('change', function () {
        img.syncBackground = this.checked;
        saveSettings();
        if (this.checked) { if (mapState.activeSubloc) applyRoomBackground(mapState.activeSubloc); }
        else { clearOverlayBg(); }
    });
    $('#rpg-img-savebg').prop('checked', img.saveToBgFolder).on('change', function () { img.saveToBgFolder = this.checked; saveSettings(); });

    $('#rpg-map-force-regen-btn').on('click', () => {
        if (confirm(t('confirm_force_regen'))) generateMapFromLore();
    });

    $('#rpg-map-export-btn').on('click', exportMap);
    $('#rpg-map-export-full-btn').on('click', exportMapFull);
    $('#rpg-map-import-btn').on('click', importMap);
}

// === DRAG & DROP REORDER (edit mode only, same level + same parent) ===
function arrayMove(arr, from, to) {
    if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return;
    const item = arr.splice(from, 1)[0];
    arr.splice(to, 0, item);
}
// A row may be dropped on its own kind (to reorder) or on the row one level up
// (to move into it). Dropping onto a parent is what makes an empty region or an
// empty locality reachable at all — with same-level drops only there would be
// nothing there to aim at.
function moveTreeItem(src, dst) {
    if (!src || !dst) return;
    const blocks = getActiveBlocks();
    if (!blocks) return;

    if (src.type === 'block') {
        if (dst.type !== 'block') return;
        arrayMove(blocks, src.bidx, dst.bidx);
    }
    else if (src.type === 'loc') {
        const from = blocks[src.bidx] && blocks[src.bidx].locations;
        if (!from) return;
        if (dst.type === 'loc' && src.bidx === dst.bidx) {
            arrayMove(from, src.lidx, dst.lidx);                 // reorder inside the region
        } else {
            // into another region: onto one of its localities, or onto the region itself
            const tb = (dst.type === 'loc' || dst.type === 'sub') ? dst.bidx : (dst.type === 'block' ? dst.bidx : undefined);
            if (tb === undefined || !blocks[tb]) return;
            if (!Array.isArray(blocks[tb].locations)) blocks[tb].locations = [];
            const [item] = from.splice(src.lidx, 1);
            if (!item) return;
            const at = (dst.type === 'loc' && typeof dst.lidx === 'number') ? dst.lidx : blocks[tb].locations.length;
            blocks[tb].locations.splice(Math.max(0, Math.min(at, blocks[tb].locations.length)), 0, item);
        }
    }
    else if (src.type === 'sub') {
        const fromLoc = blocks[src.bidx] && blocks[src.bidx].locations && blocks[src.bidx].locations[src.lidx];
        if (!fromLoc || !Array.isArray(fromLoc.sublocs)) return;
        if (dst.type === 'sub' && src.bidx === dst.bidx && src.lidx === dst.lidx) {
            arrayMove(fromLoc.sublocs, src.sidx, dst.sidx);      // reorder inside the locality
        } else {
            // into another locality: onto one of its sublocations, or onto the locality itself
            const tb = dst.bidx, tl = dst.lidx;
            if (tb === undefined || tl === undefined) return;
            const toLoc = blocks[tb] && blocks[tb].locations && blocks[tb].locations[tl];
            if (!toLoc) return;
            if (!Array.isArray(toLoc.sublocs)) toLoc.sublocs = [];
            const [item] = fromLoc.sublocs.splice(src.sidx, 1);
            if (!item) return;
            const at = (dst.type === 'sub' && typeof dst.sidx === 'number') ? dst.sidx : toLoc.sublocs.length;
            toLoc.sublocs.splice(Math.max(0, Math.min(at, toLoc.sublocs.length)), 0, item);
        }
    }
    saveMapState();
    renderMapTree();
    updateContextInjection();
}

// Which rows a dragged row is allowed to land on.
function dndAccepts(srcType, dstType) {
    if (srcType === 'block') return dstType === 'block';
    if (srcType === 'loc') return dstType === 'loc' || dstType === 'block';
    if (srcType === 'sub') return dstType === 'sub' || dstType === 'loc';
    return false;
}
function metaFromEl(el) {
    const num = (v) => (v === undefined || v === '') ? undefined : parseInt(v);
    return { type: el.dataset.dtype, bidx: num(el.dataset.bidx), lidx: num(el.dataset.lidx), sidx: num(el.dataset.sidx) };
}

const MAP_BUILD = 'map-1.1.0-nodnd-highlight';
console.log('[RPG Map] build:', MAP_BUILD, '— drag highlight removed');
setTimeout(() => { try { showRoute(); } catch (e) { } }, 1200);
let dragSrc = null;
// Strip every drag style from every row — idempotent, safe to call anytime.
function clearAllDnD() {
    // Classes, not inline styles, and queried across the whole document. The old
    // version wrote style.outline on rows inside one container: if the tree was
    // re-rendered mid-drag, or the drag ended over something else, the element
    // carrying the outline was no longer the element being cleaned, and the dashed
    // frame stayed on screen until a reload.
    document.querySelectorAll('.rpg-dnd-over, .rpg-dnd-src').forEach(el => {
        el.classList.remove('rpg-dnd-over', 'rpg-dnd-src');
        el.style.outline = '';          // wipe anything an older build left behind
        el.style.outlineOffset = '';
        el.style.opacity = '';
    });
}
function onRowDragStart(e) {
    clearAllDnD();                 // clear any leftovers from a previous stuck drag
    dragSrc = metaFromEl(this);
    // No visual marking at all. Whatever the outline was doing to the panel's
    // compositing, it left the whole interface brighter and it stayed that way.
    // The browser's own drag image and cursor are cue enough.
    try {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', dragSrc.type || 'row');
    } catch (_) {}
}
function onRowDragOver(e) {
    if (!dragSrc || !dndAccepts(dragSrc.type, this.dataset.dtype)) return;
    // preventDefault is what makes this row a legal drop target — without it the
    // drop event never fires. It stays; only the highlighting is gone.
    e.preventDefault();
    try { e.dataTransfer.dropEffect = 'move'; } catch (_) {}
}
function onRowDragLeave() { }
function onRowDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    clearAllDnD();                 // fires reliably on a valid drop, even when no re-render follows
    moveTreeItem(dragSrc, metaFromEl(this));
    dragSrc = null;
}
function onRowDragEnd() {
    dragSrc = null;
    clearAllDnD();                 // covers cancelled drags (no drop)
}
// Bind native DnD directly to freshly-rendered rows (called at end of renderMapTree).
function attachTreeDnD() {
    clearAllDnD();                 // new rows start clean
    document.querySelectorAll('#rpg-map-tree-container [draggable="true"]').forEach(el => {
        el.addEventListener('dragstart', onRowDragStart);
        el.addEventListener('dragover', onRowDragOver);
        el.addEventListener('dragleave', onRowDragLeave);
        el.addEventListener('drop', onRowDrop);
        el.addEventListener('dragend', onRowDragEnd);
    });
}
// Global safety net: if the browser drops/ends a drag anywhere, wipe stray styles.
document.addEventListener('drop', () => { dragSrc = null; clearAllDnD(); });
document.addEventListener('dragend', () => { dragSrc = null; clearAllDnD(); });
// Some browsers never fire dragend when the source node is replaced by a re-render.
// A pointer coming back down with nothing being dragged means the drag is long over.
document.addEventListener('mousedown', () => { if (!dragSrc) clearAllDnD(); });
// Two more nets. A drag that ends over another window never fires dragend in some
// browsers, and a tree redrawn mid-drag leaves the marks on nodes that no longer
// exist — but the CSS classes are all we look for, wherever they ended up.
document.addEventListener('dragover', (e) => { if (!dragSrc) clearAllDnD(); }, true);
window.addEventListener('blur', () => { dragSrc = null; clearAllDnD(); });

// === ROBUST DELEGATED EVENTS ===
$(document).off('click', '#rpg-map-edit-toggle').on('click', '#rpg-map-edit-toggle', function () {
    mapState.isEditMode = !mapState.isEditMode;
    $(this).toggleClass('active');
    saveMapState();
    renderMapTree();
});

$(document).off('click', '#rpg-map-add-block-btn').on('click', '#rpg-map-add-block-btn', addBlockManual);

$(document).off('click', '#rpg-map-regen-btn').on('click', '#rpg-map-regen-btn', () => {
    if (confirm(t('confirm_regen'))) generateMapFromLore();
});

// quick door status toggle (lock icon in editor)
$(document).off('click', '.rpg-tree-lock-toggle-btn').on('click', '.rpg-tree-lock-toggle-btn', function (e) {
    e.stopPropagation();
    const bidx = $(this).data('bidx');
    const lidx = $(this).data('lidx');
    const sidx = $(this).data('sidx');

    const sub = getActiveBlocks()[bidx].locations[lidx].sublocs[sidx];
    sub.locked = !sub.locked;
    if (!sub.locked) sub.lockAttempts = 0;

    saveMapState();
    renderMapTree();
    if (mapState.activeSubloc && mapState.activeSubloc.name === sub.name) {
        selectSublocation(sub, bidx, getActiveBlocks()[bidx].locations[lidx].name, getActiveBlocks()[bidx].name);
    }
});

// rename (regions / locations / rooms)
$(document).off('click', '.rpg-tree-rename-btn').on('click', '.rpg-tree-rename-btn', function (e) {
    e.stopPropagation();
    renameElementManual($(this).data('type'), $(this).data('bidx'), $(this).data('lidx'), $(this).data('sidx'));
});

$(document).off('click', '.rpg-tree-add-btn').on('click', '.rpg-tree-add-btn', function (e) {
    e.stopPropagation();
    const type = $(this).data('type');
    const bidx = $(this).data('bidx');
    const lidx = $(this).data('lidx');
    if (type === 'loc') addLocationManual(bidx);
    if (type === 'sub') addSublocationManual(bidx, lidx);
});

$(document).off('click', '.rpg-tree-del-btn').on('click', '.rpg-tree-del-btn', function (e) {
    e.stopPropagation();
    deleteElementManual($(this).data('type'), $(this).data('bidx'), $(this).data('lidx'), $(this).data('sidx'));
});

// === MAP TAB EVENTS ===
$(document).off('click', '.rpg-map-tab').on('click', '.rpg-map-tab', function (e) {
    if (e.target.closest('.rpg-map-tab-del')) return;
    mapState.activeMapIndex = parseInt($(this).data('midx'));
    mapState.activeBlockIndex = 0;
    saveMapState();
    renderMapTree();
    $('#rpg-map-info-content').html(`<div class="rpg-quest-empty">${t('info_switched', { name: escapeHtml(mapState.maps[mapState.activeMapIndex].name) })}</div>`);
});

$(document).off('click', '#rpg-map-add-tab-btn').on('click', '#rpg-map-add-tab-btn', function () {
    const name = prompt(t('prompt_tab_name'));
    if (!name) return;
    const useAi = confirm(t('confirm_ai_tab'));

    mapState.maps.push({ name: name, blocks: [] });
    mapState.activeMapIndex = mapState.maps.length - 1;
    mapState.activeBlockIndex = 0;
    saveMapState();

    if (useAi) {
        const directions = prompt(t('prompt_tab_directions'), name);
        generateMapFromLore(directions || name);
    } else {
        renderMapTree();
    }
});

$(document).off('click', '.rpg-map-tab-del').on('click', '.rpg-map-tab-del', function (e) {
    e.stopPropagation();
    const mIdx = parseInt($(this).data('midx'));
    if (!confirm(t('confirm_tab_delete', { name: mapState.maps[mIdx].name }))) return;

    mapState.maps.splice(mIdx, 1);
    // Only shift the active index when the deleted tab was at or before it —
    // deleting a tab AFTER the active one used to needlessly switch maps.
    if (mapState.activeMapIndex >= mIdx) mapState.activeMapIndex = Math.max(0, mapState.activeMapIndex - 1);
    if (mapState.activeMapIndex >= mapState.maps.length) mapState.activeMapIndex = Math.max(0, mapState.maps.length - 1);
    mapState.activeBlockIndex = 0;
    saveMapState();
    renderMapTree();
});

$(document).off('dblclick', '.rpg-map-tab').on('dblclick', '.rpg-map-tab', function () {
    if (!mapState.isEditMode) return;
    const mIdx = parseInt($(this).data('midx'));
    const newName = prompt(t('prompt_rename_tab'), mapState.maps[mIdx].name);
    if (newName) {
        mapState.maps[mIdx].name = newName;
        saveMapState();
        renderMapTree();
    }
});

jQuery(() => {
    loadSettings();
    pruneOldStates();
    mountSettings();
    renderMapUI();

    eventSource.on(event_types.CHAT_CHANGED, () => {
        // Release the old chat at once: in-flight AI calls must not save into
        // the new chat (loadMapState will claim it again after the switch).
        mapChatId = null;
        $('#rpg-map-modal').removeClass('visible');
        clearEncounterTimers();
        $('#rpg-encounter-modal').fadeOut();
        $('#rpg-unlock-modal').fadeOut();
        clearOverlayBg();
        // Sound belongs to the room, and the room belongs to the chat. Nothing stopped
        // it here, so the previous chat's piece kept playing into the new one and no
        // new one was ever started — the engine still believed it was in that room.
        musStop(true);
        ambStop();
        AMB.current = '';
        MUS.mood = null;
        setTimeout(() => {
            loadMapState();
            renderMapUI();
            try {
                const sub = mapState.activeSubloc;
                if (sub && settings.ambience && settings.ambience.enabled) {
                    ambPlayFor(sub);
                    musStart(sub);
                }
                ambUpdateBadge(AMB_PROFILES.find(p => p.id === AMB.current));
                musUpdateBadge();
                ambRefreshPicker();
                musRefreshControls();
            } catch (e) { console.error('[RPG Map] audio handover failed:', e); }
        }, 100);
    });

    eventSource.on(event_types.MESSAGE_RECEIVED, async () => {
        updateContextInjection();
    });
});

// ============================================================
// CROSS-EXTENSION BRIDGE — lets Vendors (ingredient gathering) read the map:
// which rooms exist and where the player currently is. Read-only, safe no-op
// for anyone who doesn't use it.
// ============================================================
window.RPG = window.RPG || {};
window.RPG.map = {
    available: true,
    isEnabled: () => !!(typeof settings !== 'undefined' && settings && settings.enabled),
    // Flat list of every existing room on the ACTIVE map: {block, location, room, locked}.
    // Vendors use this so ingredients live in rooms that already exist (no new rooms spawned).
    listRooms: () => {
        const out = [];
        try {
            const blocks = (mapState.maps && mapState.maps[mapState.activeMapIndex] ? mapState.maps[mapState.activeMapIndex].blocks : []) || [];
            blocks.forEach(b => (b.locations || []).forEach(l => (l.sublocs || []).forEach(s => {
                if (s && s.name) out.push({ block: b.name || '', location: l.name || '', room: s.name, locked: !!s.locked });
            })));
        } catch (e) { /* ignore */ }
        return out;
    },
    // The room the player is standing in right now, or null.
    getCurrent: () => {
        try {
            if (!mapState.activeSubloc || !mapState.activeSubloc.name) return null;
            const blocks = getActiveBlocks();
            const b = blocks[mapState.activeBlockIndex];
            return { block: b ? (b.name || '') : '', room: mapState.activeSubloc.name };
        } catch (e) { return null; }
    }
};
