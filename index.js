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
    model: 'google/gemma-2-27b-it',
    temperature: 0.7,
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
        size: '1024x576',  // small 16:9 snapshot (not the full 1700x900)
        style: 'modern anime setting, clean semi-realistic detail, neon and natural light',
        timeOfDay: 'night with moonlight and candlelight, dark atmosphere',
        weather: 'clear weather',
        frame: 'worn',     // 'plain' | 'worn'
        syncBackground: false,   // change chat background when entering a room
        saveToBgFolder: false,   // (experimental) upload generated images to ST backgrounds/
        template: 'Generate a background scene: an empty location with no characters and no people. Anime visual novel background, detailed digital painting of {ROOM}. Setting style: {STYLE}. Time of day: {TIME}. Weather: {WEATHER}. Wide establishing shot, 16:9 aspect ratio (about {SIZE}), no people, no characters, empty scene, highly detailed environment, atmospheric depth, soft volumetric cinematic lighting.'
    },
    mapStates: {}
};

let settings = {};
function freshMapState() {
    return {
        maps: [{ name: "Main", blocks: [] }],
        activeMapIndex: 0,
        activeBlockIndex: 0,
        activeSubloc: null,
        isSolo: false,
        soloHistoryCount: 0,
        mapGenerated: false,
        isEditMode: false
    };
}
let mapState = freshMapState();

function loadSettings() {
    if (!extension_settings[MODULE_NAME]) extension_settings[MODULE_NAME] = {};
    settings = Object.assign({}, defaultSettings, extension_settings[MODULE_NAME]);
    if (!settings.mapStates) settings.mapStates = {};
    // deep-merge the nested images object so a saved config keeps future defaults
    settings.images = Object.assign({}, defaultSettings.images, extension_settings[MODULE_NAME].images || {});
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
    if (!chatId) return;

    if (settings.mapStates[chatId]) {
        mapState = settings.mapStates[chatId];
    } else {
        const chat = context.chat;
        let restored = false;
        if (chat && chat.length > 0) {
            for (let i = chat.length - 1; i >= 0; i--) {
                if (chat[i].extra && chat[i].extra.rpg_map_checkpoint) {
                    mapState = chat[i].extra.rpg_map_checkpoint;
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

    if (!mapState.mapGenerated && context.chat && context.chat.length > 0) {
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
    settings.mapStates[chatId] = mapState;
    saveSettings();

    const chat = context.chat;
    if (chat && chat.length > 0) {
        const lastMsg = chat[chat.length - 1];
        if (!lastMsg.extra) lastMsg.extra = {};
        lastMsg.extra.rpg_map_checkpoint = mapState;
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
async function callAI(systemPrompt, userPrompt) {
    if (!settings.apiKey) throw new Error("API key is not set!");
    let endpointUrl = (settings.baseUrl || 'https://openrouter.ai/api/v1').replace(/\/$/, '') + '/chat/completions';
    const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${settings.apiKey.trim()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: settings.model,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
            temperature: settings.temperature,
            response_format: { type: "json_object" }
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
        if (!result || !Array.isArray(result.blocks)) throw new Error("No blocks returned");

        mapState.maps[mapState.activeMapIndex].blocks = result.blocks;
        mapState.mapGenerated = true;
        saveMapState();
        renderMapTree();
        toastr.success(t('toast_designed'));
    } catch (e) { console.error("Map Gen Error:", e); toastr.error(t('toast_gen_fail')); }
}

// === GENERATE A ROOM DESCRIPTION ON DEMAND ===
async function generateRoomDescription(sub, blockName, locName, userPrompt = "") {
    toastr.info(t('toast_describing'));
    try {
        const sysPrompt = `You are an RPG Game Master. Describe the room "${sub.name}" inside "${locName}" of "${blockName}".
Write a short, highly detailed, atmospheric description (D&D search style). Brief (2-3 sentences), strictly factual. ${t('ai_lang_text')}${userPrompt ? `\nFollow this guidance from the player: ${userPrompt}` : ''}
Output strictly JSON: { "desc": "Room description here." }`;

        const result = await callAI(sysPrompt, userPrompt ? `Describe the room. Guidance: ${userPrompt}` : "Describe the room.");
        // be defensive: models sometimes return desc as a non-string
        let d = result && result.desc;
        if (typeof d !== 'string') d = (d && typeof d === 'object') ? (d.text || d.description || '') : (d == null ? '' : String(d));
        sub.desc = d;
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

const IMG_TIME_PRESETS = [
    'dawn, soft golden light',
    'midday, bright natural light',
    'sunset, warm orange glow',
    'night with moonlight and candlelight, dark atmosphere',
    'overcast grey daylight'
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
        const body = { model: cfg.model, prompt, n: 1 };
        const ar = aspectFromSize(cfg.size);
        if (ar) body.aspect_ratio = ar; // Gemini/Grok prefer aspect_ratio over pixel size
        const resp = await fetch(base + '/images', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${(cfg.apiKey || '').trim()}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': (typeof location !== 'undefined' ? location.origin : 'https://sillytavern.app'),
                'X-Title': 'SillyTavern RPG Map'
            },
            body: JSON.stringify(body)
        });
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
    const doPost = async (includeSize) => {
        const body = { model: cfg.model, prompt, n: 1 };
        if (includeSize && cfg.size) body.size = cfg.size;
        return fetch(base + '/images/generations', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${(cfg.apiKey || '').trim()}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    };

    let resp = await doPost(true);
    // some models/proxies reject a non-standard size (e.g. 1024x576) → retry without it
    if (!resp.ok && (resp.status === 400 || resp.status === 422)) {
        let txt = '';
        try { txt = JSON.stringify(await resp.clone().json()); } catch (e) {}
        if (/size|dimension|resolution/i.test(txt)) resp = await doPost(false);
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
// Contract kept identical: reads/writes extension_settings['tavern_rpg_engine'].chatStates[chatId].inventory
function getInventoryItems() {
    const context = getContext();
    const rpgEngineState = extension_settings['tavern_rpg_engine']?.chatStates?.[context.chatId];
    return rpgEngineState?.inventory || [];
}

function removeInventoryItem(keyId) {
    const context = getContext();
    const rpgEngineState = extension_settings['tavern_rpg_engine']?.chatStates?.[context.chatId];
    if (rpgEngineState && rpgEngineState.inventory) {
        rpgEngineState.inventory = rpgEngineState.inventory.filter(i => i.id !== keyId);
        if (typeof saveSettingsDebounced === 'function') saveSettingsDebounced();
    }
}

// Item is a "key/lockpick" in either language
function itemIsKeyLike(name) {
    const n = String(name || '').toLowerCase();
    const words = new Set([...(langObj().key_words || []), ...I18N.en.key_words, ...I18N.ru.key_words]);
    for (const w of words) if (n.includes(String(w).toLowerCase())) return true;
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
                <span>${map.name}</span>
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
        tree.append(`<div class="rpg-map-block" ${blockDnd}><span><i class="fa-solid fa-map"></i> ${block.name}</span>${editHtml}</div>`);

        (block.locations || []).forEach((loc, lIdx) => {
            let locEditHtml = mapState.isEditMode ? `
                <span class="rpg-tree-edit-actions">
                    <i class="fa-solid fa-pen rpg-tree-rename-btn" style="color:#3f5d78;" title="${t('title_rename')}" data-type="loc" data-bidx="${bIdx}" data-lidx="${lIdx}"></i>
                    <i class="fa-solid fa-plus rpg-tree-add-btn" title="${t('title_add_room')}" data-type="sub" data-bidx="${bIdx}" data-lidx="${lIdx}"></i>
                    <i class="fa-solid fa-trash rpg-tree-del-btn" title="${t('title_del_loc')}" data-type="loc" data-bidx="${bIdx}" data-lidx="${lIdx}"></i>
                </span>
            ` : '';
            const locDnd = mapState.isEditMode ? `draggable="true" data-dtype="loc" data-bidx="${bIdx}" data-lidx="${lIdx}" style="cursor:grab;"` : '';
            tree.append(`<div class="rpg-map-loc" ${locDnd}><span><i class="fa-solid fa-location-dot"></i> ${loc.name}</span>${locEditHtml}</div>`);

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
                        <span><i class="fa-solid fa-door-open"></i> ${sub.name}</span>
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
    if (typeof sub.name !== 'string') { sub.name = (sub.name == null) ? 'Room' : String(sub.name); changed = true; }
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
        ? `<div class="rpg-room-photo-wrap ${settings.images.frame === 'worn' ? 'worn' : ''}"><img class="rpg-room-photo" id="rpg-room-photo-img" ${(!sub.image && sub.bgFile) ? `src="${String(bgThumbUrl(sub.bgFile)).replace(/"/g, '&quot;')}"` : ''} alt="${sub.name}"></div>`
        : '';

    let html = `
        <div class="rpg-info-title">${sub.name}${!isLocked ? `<button class="rpg-here-mini" id="rpg-set-here" title="${t('btn_set_here')}" style="margin-left:8px;padding:2px 8px;font-size:11px;font-weight:600;vertical-align:middle;cursor:pointer;border:1px solid rgba(139,92,246,.5);border-radius:10px;background:rgba(139,92,246,.14);color:#6b4fa0;white-space:nowrap;"><i class="fa-solid fa-location-dot"></i> ${t('btn_here_mini')}</button>` : ''}</div>
        <div class="rpg-info-status ${isLocked ? 'closed' : 'open'}">${isLocked ? t('status_locked') : t('status_open')}</div>
        ${photoHtml}
        <div class="rpg-info-desc" id="rpg-info-desc">${isLocked ? t('desc_locked') : (hasDesc ? sub.desc : t('desc_empty'))}</div>
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
            <div class="rpg-info-title">${(sub && sub.name) || 'Room'}</div>
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
    toastr.info(t('toast_building_region'));
    try {
        const sysPrompt = `You are an RPG map builder. Generate exactly 2 Locations (areas) for the region "${blockName}".
Each Location must have 2 Sub-locations (rooms). Keep descriptions empty (""). ${t('ai_lang_names')}
Output JSON: { "locations": [{"name": "Location Name", "sublocs": [{"name": "Room Name", "locked": false}]}] }`;
        const result = await callAI(sysPrompt, "Generate structure.");
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
        if (sub.lockAttempts >= 2 && itemIsPickLike(key.name)) {
            keysHtml += `<div class="rpg-unlock-option" style="opacity:0.3; cursor:not-allowed;">${t('unlock_broken', { name: key.name })}</div>`;
        } else {
            keysHtml += `<div class="rpg-unlock-option rpg-use-key" data-id="${key.id}">${t('unlock_use_key', { name: key.name, chance })}</div>`;
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
    let info = { distance: t('travel_default_distance'), time: t('travel_default_time') };
    try {
        const sys = `Estimate a realistic travel distance and time between two in-world places, fitting the story's setting and era. Keep both very short. ${t('ai_lang_text')}
Output strictly JSON: { "distance": "e.g. 3 miles", "time": "e.g. 30 minutes" }`;
        const r = await callAI(sys, `From "${fromName}" to "${toName}".`);
        if (r && r.distance && r.time) info = { distance: r.distance, time: r.time };
    } catch (e) {}
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
}

async function startTravel(sub, blockIndex, isSolo = false) {
    const charName = primaryCharName();
    const activeBlocks = getActiveBlocks();

    if (mapState.activeBlockIndex !== blockIndex) {
        const oldBlockName = activeBlocks[mapState.activeBlockIndex] ? activeBlocks[mapState.activeBlockIndex].name : (activeBlocks[blockIndex]?.name || "start");
        const newBlockName = activeBlocks[blockIndex] ? activeBlocks[blockIndex].name : "the new location";

        if (oldBlockName !== newBlockName) {
            const tr = await getTravelInfo(oldBlockName, newBlockName);
            const travelMsg = t('sys_travel', { old: oldBlockName, new: newBlockName, dist: tr.distance, time: tr.time, char: charName });
            $('#send_textarea').val(travelMsg).trigger('input');
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

    if (isSolo) {
        toastr.info(t('toast_solo_enter', { name: sub.name }));
        $('#send_textarea').val(t('sys_go_alone', { name: sub.name })).trigger('input');
    } else {
        $('#send_textarea').val(t('sys_go_together', { name: sub.name, desc: sub.desc || t('default_room') })).trigger('input');
    }

    // hidden random encounter (not every time)
    if (Math.random() < (settings.eventChance ?? 0.25)) {
        setTimeout(() => triggerMapEncounter(sub), 500);
    }
}

// === HIDDEN RANDOM ENCOUNTERS (reaction mini-game + inventory + consequences) ===
async function triggerMapEncounter(sub) {
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
          items.map(i => `<button class="rpg-enc-item" data-id="${i.id}" data-name="${i.name}">${i.name}</button>`).join('') + `</div>`
        : '';

    modal.html(`
        <div class="rpg-enc-card">
            <div class="rpg-enc-tag"><i class="fa-solid fa-bolt"></i> ${t('enc_tag')}</div>
            <div class="rpg-enc-situation">${enc.situation}</div>
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
            .html(`${outcome}<br><button id="rpg-enc-send" class="rpg-enc-send"><i class="fa-solid fa-paper-plane"></i> ${t('enc_send')}</button>`);
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
        <div class="rpg-solo-loc">${t('solo_at')} <b>${mapState.activeSubloc.name}</b></div>
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
    $('.rpg-modal-close').off('click').on('click', function () { $(this).closest('.rpg-modal').removeClass('visible'); });
}

function makeModalDraggable(elmnt, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.addEventListener('mousedown', dragMouseDown);

    function dragMouseDown(e) {
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

    $('#rpg-map-base').val(settings.baseUrl).on('change', function () { settings.baseUrl = $(this).val(); saveSettings(); });
    $('#rpg-map-key').val(settings.apiKey).on('change', function () { settings.apiKey = $(this).val(); saveSettings(); });
    $('#rpg-map-model').val(settings.model).on('change', function () { settings.model = $(this).val(); saveSettings(); });
    $('#rpg-map-depth').val(settings.injectDepth).on('change', function () { settings.injectDepth = parseInt($(this).val()); saveSettings(); });
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
function moveTreeItem(src, dst) {
    if (!src || !dst || src.type !== dst.type) return;
    const blocks = getActiveBlocks();
    if (src.type === 'block') {
        arrayMove(blocks, src.bidx, dst.bidx);
    } else if (src.type === 'loc') {
        if (src.bidx !== dst.bidx) return; // only within the same region
        arrayMove(blocks[src.bidx].locations, src.lidx, dst.lidx);
    } else if (src.type === 'sub') {
        if (src.bidx !== dst.bidx || src.lidx !== dst.lidx) return; // only within the same location
        arrayMove(blocks[src.bidx].locations[src.lidx].sublocs, src.sidx, dst.sidx);
    }
    saveMapState();
    renderMapTree();
    updateContextInjection();
}
function metaFromEl(el) {
    const num = (v) => (v === undefined || v === '') ? undefined : parseInt(v);
    return { type: el.dataset.dtype, bidx: num(el.dataset.bidx), lidx: num(el.dataset.lidx), sidx: num(el.dataset.sidx) };
}

let dragSrc = null;
// Strip every drag style from every row — idempotent, safe to call anytime.
function clearAllDnD() {
    document.querySelectorAll('#rpg-map-tree-container [draggable="true"]').forEach(el => {
        el.style.outline = '';
        el.style.outlineOffset = '';
        el.style.opacity = '';
    });
}
function onRowDragStart(e) {
    clearAllDnD();                 // clear any leftovers from a previous stuck drag
    dragSrc = metaFromEl(this);
    this.style.opacity = '0.4';
    try {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', dragSrc.type || 'row');
    } catch (_) {}
}
function onRowDragOver(e) {
    if (!dragSrc || this.dataset.dtype !== dragSrc.type) return; // only same level
    e.preventDefault();
    try { e.dataTransfer.dropEffect = 'move'; } catch (_) {}
    // keep exactly one highlighted target: clear others, mark this one
    document.querySelectorAll('#rpg-map-tree-container [draggable="true"]').forEach(el => {
        if (el !== this) { el.style.outline = ''; el.style.outlineOffset = ''; }
    });
    this.style.outline = '2px dashed #c79a2e';
    this.style.outlineOffset = '2px';
}
function onRowDragLeave() {
    this.style.outline = '';
    this.style.outlineOffset = '';
}
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
    $('#rpg-map-info-content').html(`<div class="rpg-quest-empty">${t('info_switched', { name: mapState.maps[mapState.activeMapIndex].name })}</div>`);
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
    mapState.activeMapIndex = Math.max(0, mapState.activeMapIndex - 1);
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
    mountSettings();
    renderMapUI();

    eventSource.on(event_types.CHAT_CHANGED, () => {
        $('#rpg-map-modal').removeClass('visible');
        clearEncounterTimers();
        $('#rpg-encounter-modal').fadeOut();
        $('#rpg-unlock-modal').fadeOut();
        clearOverlayBg();
        setTimeout(() => {
            loadMapState();
            renderMapUI();
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
