// ===== AI Dungeon Master - Main Application =====

// ===== State Management =====
const gameState = {
    character: null,
    currentCampaign: null,
    storyHistory: [],
    settings: {
        aiProvider: 'groq',
        apiKey: '',
        temperature: 0.8,
        dmStyle: 'balanced',
        autoRoll: true,
        soundEffects: false,
        darkMode: true
    },
    inCombat: false,
    enemies: []
};

// ===== Campaign Data =====
const campaigns = [
    {
        id: 1,
        name: "Lost Mine of Phandelver",
        category: "official",
        description: "A classic starter adventure. Escort a wagon to Phandalin and uncover a conspiracy involving a lost dwarven mine.",
        setting: "Forgotten Realms",
        difficulty: "Beginner",
        icon: "bi-gem",
        intro: "You have been hired by a dwarf named Gundren Rockseeker to escort a wagon of supplies from the city of Neverwinter to the rough-and-tumble settlement of Phandalin, a couple of days' travel southeast. Gundren has gone ahead with a warrior escort to attend to business while you follow with the supplies. You're on the Triboar Trail, a dusty path through wild lands. The morning sun filters through the trees as your wagon creaks along..."
    },
    {
        id: 2,
        name: "Curse of Strahd",
        category: "official",
        description: "A gothic horror adventure in the mist-shrouded land of Barovia, ruled by the vampire lord Strahd von Zarovich.",
        setting: "Ravenloft",
        difficulty: "Advanced",
        icon: "bi-moon-stars",
        intro: "The mists close in around you, thick and impenetrable. When they finally part, you find yourself in a land of perpetual twilight. Dead trees claw at an overcast sky, and in the distance, perched atop a massive spire of rock, looms a dark castle. The air is cold and carries the scent of decay. Welcome to Barovia, where the dark lord Strahd von Zarovich rules with an iron fist..."
    },
    {
        id: 3,
        name: "Dragon Heist",
        category: "official",
        description: "Urban adventure in Waterdeep. Find a hidden cache of gold while navigating faction politics.",
        setting: "Forgotten Realms",
        difficulty: "Intermediate",
        icon: "bi-cash-coin",
        intro: "Welcome to Waterdeep, the City of Splendors! The greatest city in the Forgotten Realms, where merchants and nobles rub shoulders with rogues and adventurers. You've come seeking fortune and glory. As you enter the Yawning Portal tavern, famous for the entrance to Undermountain in its taproom floor, the sound of laughter and clinking mugs fills the air. Little do you know, a treasure hunt spanning the entire city is about to begin..."
    },
    {
        id: 4,
        name: "The Goblin Cave",
        category: "community",
        description: "A simple dungeon crawl perfect for new players. Clear out a goblin infestation threatening a nearby village.",
        setting: "Generic Fantasy",
        difficulty: "Beginner",
        icon: "bi-emoji-angry",
        intro: "The village of Millbrook has been plagued by goblin raids for weeks. Livestock has gone missing, travelers have been attacked, and the villagers live in fear. The mayor has posted a bounty: 50 gold pieces for whoever can clear out the goblin cave in the nearby hills. Armed with your weapons and your wits, you stand at the entrance to a dark cave. The smell of smoke and rotting meat wafts from within..."
    },
    {
        id: 5,
        name: "The Haunted Manor",
        category: "community",
        description: "Investigate a mysterious manor where visitors vanish. Uncover dark secrets and survive the night.",
        setting: "Gothic Horror",
        difficulty: "Intermediate",
        icon: "bi-house-door",
        intro: "Blackwood Manor has stood abandoned for fifty years, ever since the entire Blackwood family vanished in a single night. Now, strange lights have been seen in the windows, and those who venture too close never return. The local lord has offered a substantial reward to anyone brave enough to investigate. As you approach the rusted iron gates, a cold wind howls through the dead gardens..."
    },
    {
        id: 6,
        name: "Tomb of the Forgotten King",
        category: "community",
        description: "Explore an ancient tomb filled with traps, puzzles, and undead guardians protecting legendary treasures.",
        setting: "Ancient Egypt-inspired",
        difficulty: "Advanced",
        icon: "bi-building",
        intro: "After months of research, you've finally found it: the entrance to the Tomb of Pharaoh Khet-Amun, the Forgotten King. Legends say he was buried with treasures beyond imagination, but also that he cursed all who would disturb his rest. The stone doors before you bear ancient warnings in hieroglyphics. Sand swirls at your feet as you prepare to enter..."
    },
    {
        id: 7,
        name: "Random Adventure",
        category: "ai-generated",
        description: "Let the AI generate a unique adventure based on your character and preferences.",
        setting: "Dynamic",
        difficulty: "Variable",
        icon: "bi-shuffle",
        intro: null
    },
    {
        id: 8,
        name: "Tavern Tales",
        category: "ai-generated",
        description: "Start in a tavern and let fate decide your adventure. Classic D&D beginning!",
        setting: "Fantasy",
        difficulty: "Variable",
        icon: "bi-cup-hot",
        intro: "The Prancing Pony tavern is warm and welcoming after your long journey. A fire crackles in the hearth, bards play merry tunes, and adventurers from all walks of life share tales of their exploits. The bartender, a portly halfling with a magnificent mustache, nods at you as you enter. 'New face! Welcome, welcome. Take a seat, have a drink. Adventure always seems to find its way to folk like yourself.' As if on cue, the door bursts open..."
    }
];

// ===== Demo AI Responses =====
const demoResponses = {
    look: [
        "You survey your surroundings carefully. {setting_description} The air carries {atmosphere}. You notice {detail}.",
        "Taking a moment to observe, you see {setting_description} {detail} catches your eye.",
        "Your keen eyes scan the area. {setting_description} Something {interesting} draws your attention."
    ],
    search: [
        "You search the area thoroughly. After a moment, you discover {found_item}. {additional_info}",
        "Rummaging through {search_area}, your hands close around {found_item}. {reaction}",
        "Your search reveals {found_item} hidden {location}. This could prove useful."
    ],
    attack: [
        "You ready your weapon and strike! Roll for attack. {combat_result}",
        "With a battle cry, you charge forward! {combat_description}",
        "You take aim and attack with deadly precision. {combat_result}"
    ],
    talk: [
        "You approach and speak. {npc_response} They seem {npc_mood}.",
        "The figure turns to face you. {npc_description} '{npc_dialogue}' they say.",
        "Your words echo in the {location}. {npc_response}"
    ],
    magic: [
        "Arcane energy crackles at your fingertips as you channel your spell. {spell_effect}",
        "You invoke the ancient words of power. {spell_description} {spell_result}",
        "Magic flows through you as the spell takes form. {spell_effect}"
    ],
    default: [
        "You attempt to {action}. {result} {consequence}",
        "Focusing on your task, you {action}. {outcome}",
        "{action_description} {result}"
    ]
};

const storyElements = {
    setting_description: [
        "Shadows dance along the stone walls.",
        "Torchlight flickers, casting eerie patterns.",
        "The chamber opens before you, vast and ancient.",
        "Cobwebs hang from forgotten corners.",
        "Dust motes float in shafts of pale light."
    ],
    atmosphere: [
        "the scent of old parchment and mystery.",
        "a faint magical hum that makes your skin tingle.",
        "the dampness of underground depths.",
        "an unsettling stillness.",
        "the distant echo of dripping water."
    ],
    detail: [
        "Strange runes glow faintly on the far wall.",
        "A chest sits in the corner, its lock rusted but intact.",
        "Footprints in the dust lead deeper into the darkness.",
        "An ancient statue seems to watch your every move.",
        "A lever protrudes from the wall, purpose unknown."
    ],
    found_item: [
        "a small pouch containing 15 gold pieces",
        "a dusty health potion",
        "an old map with mysterious markings",
        "a silver key with intricate engravings",
        "a scroll containing an unknown spell"
    ],
    npc_response: [
        "'Ah, an adventurer! I've been expecting someone like you.'",
        "'State your business, stranger. These are dangerous times.'",
        "'Finally! Someone who might be able to help.'",
        "'You shouldn't be here. Turn back while you still can.'",
        "'Interesting... very interesting indeed.'"
    ]
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    loadGameState();
    initializeNavigation();
    initializeDiceRoller();
    initializeCharacterForm();
    initializeCampaigns();
    initializeSettings();
    initializeGameplay();
    updateCharacterQuickView();
});

// ===== Navigation =====
function initializeNavigation() {
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(link.dataset.section);
        });
    });
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update nav links
    document.querySelectorAll('[data-section]').forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionName);
    });
}

// ===== Dice Roller =====
function initializeDiceRoller() {
    // Standard dice buttons
    document.querySelectorAll('.dice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sides = parseInt(btn.dataset.dice);
            rollDice(sides);
        });
    });

    // Custom dice roller
    document.getElementById('roll-custom').addEventListener('click', () => {
        const input = document.getElementById('custom-dice').value;
        rollCustomDice(input);
    });

    document.getElementById('custom-dice').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            rollCustomDice(e.target.value);
        }
    });
}

function rollDice(sides, count = 1) {
    const results = [];
    for (let i = 0; i < count; i++) {
        results.push(Math.floor(Math.random() * sides) + 1);
    }

    const total = results.reduce((a, b) => a + b, 0);
    displayDiceResult(total, sides, count);

    // Add to story if in game
    if (gameState.currentCampaign) {
        addStoryMessage(`Rolled ${count}d${sides}: ${results.join(' + ')} = ${total}`, 'system');
    }

    return { results, total };
}

function rollCustomDice(input) {
    const match = input.match(/(\d+)?d(\d+)([+-]\d+)?/i);
    if (!match) {
        showNotification('Invalid dice format. Use format like 2d6+3', 'warning');
        return;
    }

    const count = parseInt(match[1]) || 1;
    const sides = parseInt(match[2]);
    const modifier = parseInt(match[3]) || 0;

    const roll = rollDice(sides, count);
    const total = roll.total + modifier;

    displayDiceResult(total, sides, count, modifier);

    if (gameState.currentCampaign) {
        const modStr = modifier > 0 ? `+${modifier}` : modifier < 0 ? modifier : '';
        addStoryMessage(`Rolled ${count}d${sides}${modStr}: ${roll.results.join(' + ')}${modStr} = ${total}`, 'system');
    }
}

function displayDiceResult(total, sides, count, modifier = 0) {
    const resultEl = document.getElementById('dice-result');
    resultEl.classList.remove('roll-result', 'critical-hit', 'critical-miss');

    // Trigger reflow for animation
    void resultEl.offsetWidth;

    resultEl.classList.add('roll-result');
    resultEl.textContent = total;

    // Check for critical (d20)
    if (sides === 20 && count === 1) {
        if (total - modifier === 20) {
            resultEl.classList.add('critical-hit');
            showNotification('Critical Hit! Natural 20!', 'success');
        } else if (total - modifier === 1) {
            resultEl.classList.add('critical-miss');
            showNotification('Critical Miss! Natural 1!', 'danger');
        }
    }
}

// ===== Character Creation =====
function initializeCharacterForm() {
    const form = document.getElementById('character-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveCharacter();
    });

    document.getElementById('roll-stats').addEventListener('click', rollAllStats);
    document.getElementById('random-character').addEventListener('click', generateRandomCharacter);
    document.getElementById('generate-backstory').addEventListener('click', generateBackstory);

    // Update HP when class/level changes
    document.getElementById('char-class').addEventListener('change', updateDefaultHP);
    document.getElementById('char-level').addEventListener('change', updateDefaultHP);
}

function rollAllStats() {
    const stats = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

    stats.forEach(stat => {
        // Roll 4d6, drop lowest
        const rolls = [];
        for (let i = 0; i < 4; i++) {
            rolls.push(Math.floor(Math.random() * 6) + 1);
        }
        rolls.sort((a, b) => b - a);
        const total = rolls[0] + rolls[1] + rolls[2];

        document.getElementById(`stat-${stat}`).value = total;
    });

    showNotification('Stats rolled! (4d6 drop lowest)', 'success');
}

function updateDefaultHP() {
    const charClass = document.getElementById('char-class').value;
    const level = parseInt(document.getElementById('char-level').value) || 1;
    const con = parseInt(document.getElementById('stat-con').value) || 10;
    const conMod = Math.floor((con - 10) / 2);

    const hitDice = {
        'Barbarian': 12, 'Fighter': 10, 'Paladin': 10, 'Ranger': 10,
        'Bard': 8, 'Cleric': 8, 'Druid': 8, 'Monk': 8, 'Rogue': 8, 'Warlock': 8,
        'Sorcerer': 6, 'Wizard': 6
    };

    const hd = hitDice[charClass] || 8;
    const hp = hd + conMod + ((level - 1) * (Math.floor(hd / 2) + 1 + conMod));

    document.getElementById('char-hp').value = Math.max(1, hp);
}

function generateRandomCharacter() {
    const races = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling'];
    const classes = ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'];
    const backgrounds = ['Acolyte', 'Criminal', 'Folk Hero', 'Noble', 'Outlander', 'Sage', 'Soldier', 'Urchin'];
    const names = ['Thorin', 'Elara', 'Grimm', 'Luna', 'Zephyr', 'Raven', 'Storm', 'Ash', 'Lyra', 'Kira', 'Dax', 'Ember'];

    document.getElementById('char-name').value = names[Math.floor(Math.random() * names.length)];
    document.getElementById('char-race').value = races[Math.floor(Math.random() * races.length)];
    document.getElementById('char-class').value = classes[Math.floor(Math.random() * classes.length)];
    document.getElementById('char-background').value = backgrounds[Math.floor(Math.random() * backgrounds.length)];

    rollAllStats();
    updateDefaultHP();

    showNotification('Random character generated!', 'success');
}

async function generateBackstory() {
    const name = document.getElementById('char-name').value || 'the adventurer';
    const race = document.getElementById('char-race').value || 'human';
    const charClass = document.getElementById('char-class').value || 'fighter';
    const background = document.getElementById('char-background').value || 'outlander';

    const prompt = `Generate a brief, compelling backstory for a ${race} ${charClass} named ${name} with a ${background} background.`;

    document.getElementById('char-backstory').value = 'Generating backstory...';

    const backstory = await getAIResponse(prompt, 'backstory');
    document.getElementById('char-backstory').value = backstory;
}

function saveCharacter() {
    const character = {
        name: document.getElementById('char-name').value,
        race: document.getElementById('char-race').value,
        class: document.getElementById('char-class').value,
        level: parseInt(document.getElementById('char-level').value),
        background: document.getElementById('char-background').value,
        alignment: document.getElementById('char-alignment').value,
        hp: parseInt(document.getElementById('char-hp').value),
        maxHp: parseInt(document.getElementById('char-hp').value),
        stats: {
            str: parseInt(document.getElementById('stat-str').value),
            dex: parseInt(document.getElementById('stat-dex').value),
            con: parseInt(document.getElementById('stat-con').value),
            int: parseInt(document.getElementById('stat-int').value),
            wis: parseInt(document.getElementById('stat-wis').value),
            cha: parseInt(document.getElementById('stat-cha').value)
        },
        backstory: document.getElementById('char-backstory').value
    };

    gameState.character = character;
    saveGameState();
    updateCharacterQuickView();
    showNotification(`${character.name} has been saved!`, 'success');
    showSection('play');
}

function updateCharacterQuickView() {
    const container = document.getElementById('character-quick-view');

    if (!gameState.character) {
        container.innerHTML = `
            <p class="text-muted text-center mb-0">No character created</p>
            <button class="btn btn-sm btn-outline-warning w-100 mt-2" onclick="showSection('character')">
                Create Character
            </button>
        `;
        return;
    }

    const char = gameState.character;
    const hpPercent = (char.hp / char.maxHp) * 100;

    container.innerHTML = `
        <h6 class="mb-1">${char.name}</h6>
        <small class="text-muted">${char.race} ${char.class} (Lvl ${char.level})</small>
        <div class="char-hp-bar mt-2">
            <div class="char-hp-fill" style="width: ${hpPercent}%"></div>
        </div>
        <small class="d-block mt-1">HP: ${char.hp}/${char.maxHp}</small>
        <div class="mt-2">
            <span class="stat-badge">STR ${char.stats.str}</span>
            <span class="stat-badge">DEX ${char.stats.dex}</span>
            <span class="stat-badge">CON ${char.stats.con}</span>
            <span class="stat-badge">INT ${char.stats.int}</span>
            <span class="stat-badge">WIS ${char.stats.wis}</span>
            <span class="stat-badge">CHA ${char.stats.cha}</span>
        </div>
        <button class="btn btn-sm btn-outline-secondary w-100 mt-2" onclick="showSection('character')">
            <i class="bi bi-pencil me-1"></i>Edit
        </button>
    `;
}

// ===== Campaigns =====
function initializeCampaigns() {
    renderCampaigns('all');

    document.querySelectorAll('#campaign-tabs .nav-link').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('#campaign-tabs .nav-link').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderCampaigns(tab.dataset.category);
        });
    });

    document.getElementById('ai-generate-campaign').addEventListener('click', generateCampaign);
    document.getElementById('start-custom-campaign').addEventListener('click', startCustomCampaign);
}

function renderCampaigns(category) {
    const container = document.getElementById('campaigns-container');
    const filtered = category === 'all'
        ? campaigns
        : campaigns.filter(c => c.category === category);

    container.innerHTML = filtered.map(campaign => `
        <div class="col-md-6 col-lg-4">
            <div class="card campaign-card position-relative" onclick="startCampaign(${campaign.id})">
                <div class="campaign-placeholder-img">
                    <i class="bi ${campaign.icon}"></i>
                </div>
                <span class="badge campaign-badge ${getCategoryBadgeClass(campaign.category)}">${campaign.category}</span>
                <div class="card-body">
                    <h5 class="card-title">${campaign.name}</h5>
                    <p class="card-text text-muted small">${campaign.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-warning"><i class="bi bi-geo-alt me-1"></i>${campaign.setting}</small>
                        <span class="badge bg-secondary">${campaign.difficulty}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getCategoryBadgeClass(category) {
    const classes = {
        'official': 'bg-warning text-dark',
        'community': 'bg-info',
        'ai-generated': 'bg-purple'
    };
    return classes[category] || 'bg-secondary';
}

function startCampaign(campaignId) {
    if (!gameState.character) {
        showNotification('Please create a character first!', 'warning');
        showSection('character');
        return;
    }

    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    gameState.currentCampaign = campaign;
    gameState.storyHistory = [];

    document.getElementById('current-campaign').textContent = campaign.name;
    document.getElementById('story-container').innerHTML = '';
    document.getElementById('player-input').disabled = false;
    document.getElementById('send-action').disabled = false;

    // Start the adventure
    if (campaign.intro) {
        addStoryMessage(campaign.intro, 'dm');
    } else {
        generateCampaignIntro(campaign);
    }

    saveGameState();
    showSection('play');
    showNotification(`Starting: ${campaign.name}`, 'success');
}

async function generateCampaignIntro(campaign) {
    const prompt = `You are a Dungeon Master. Create an engaging opening scene for a ${campaign.setting} campaign called "${campaign.name}".
    The player is ${gameState.character.name}, a ${gameState.character.race} ${gameState.character.class}.
    Set the scene dramatically and end with a hook that invites player action.`;

    addTypingIndicator();
    const intro = await getAIResponse(prompt, 'story');
    removeTypingIndicator();
    addStoryMessage(intro, 'dm');
}

async function generateCampaign() {
    const name = document.getElementById('campaign-name').value || 'Untitled Adventure';
    const setting = document.getElementById('campaign-setting').value;
    const description = document.getElementById('campaign-description').value;

    const prompt = `Create a D&D campaign premise for "${name}" in a ${setting} setting.
    Additional details: ${description || 'Classic fantasy adventure'}
    Provide: 1) A one-paragraph description 2) The opening scene`;

    document.getElementById('campaign-description').value = 'Generating...';
    const result = await getAIResponse(prompt, 'campaign');
    document.getElementById('campaign-description').value = result;
}

function startCustomCampaign() {
    const name = document.getElementById('campaign-name').value || 'Custom Adventure';
    const setting = document.getElementById('campaign-setting').value;
    const description = document.getElementById('campaign-description').value;

    const customCampaign = {
        id: Date.now(),
        name: name,
        category: 'custom',
        description: description,
        setting: setting,
        difficulty: 'Custom',
        icon: 'bi-star',
        intro: description
    };

    bootstrap.Modal.getInstance(document.getElementById('customCampaignModal')).hide();

    gameState.currentCampaign = customCampaign;
    gameState.storyHistory = [];

    document.getElementById('current-campaign').textContent = name;
    document.getElementById('story-container').innerHTML = '';
    document.getElementById('player-input').disabled = false;
    document.getElementById('send-action').disabled = false;

    if (description) {
        addStoryMessage(description, 'dm');
        addStoryMessage('What do you do?', 'dm');
    } else {
        generateCampaignIntro(customCampaign);
    }

    saveGameState();
    showSection('play');
}

// ===== Gameplay =====
function initializeGameplay() {
    const input = document.getElementById('player-input');
    const sendBtn = document.getElementById('send-action');

    sendBtn.addEventListener('click', () => sendPlayerAction());
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendPlayerAction();
    });

    // Quick action buttons
    document.querySelectorAll('.quick-action').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            document.getElementById('player-input').value = action;
            sendPlayerAction();
        });
    });
}

async function sendPlayerAction() {
    const input = document.getElementById('player-input');
    const action = input.value.trim();

    if (!action || !gameState.currentCampaign) return;

    input.value = '';
    addStoryMessage(action, 'player');

    // Auto-roll if needed
    if (gameState.settings.autoRoll && shouldRoll(action)) {
        const rollType = detectRollType(action);
        const roll = rollDice(20);
        addStoryMessage(`[${rollType} check: d20 = ${roll.total}]`, 'system');
    }

    addTypingIndicator();
    const response = await getAIResponse(action, 'gameplay');
    removeTypingIndicator();

    addStoryMessage(response, 'dm');

    // Check for combat triggers
    if (detectCombat(response)) {
        initiateCombat();
    }

    saveGameState();
}

function shouldRoll(action) {
    const rollTriggers = ['attack', 'hit', 'strike', 'cast', 'sneak', 'hide', 'climb', 'jump', 'persuade', 'intimidate', 'deceive', 'search', 'investigate', 'pick lock', 'steal'];
    return rollTriggers.some(trigger => action.toLowerCase().includes(trigger));
}

function detectRollType(action) {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('attack') || actionLower.includes('hit') || actionLower.includes('strike')) return 'Attack';
    if (actionLower.includes('sneak') || actionLower.includes('hide')) return 'Stealth';
    if (actionLower.includes('persuade')) return 'Persuasion';
    if (actionLower.includes('intimidate')) return 'Intimidation';
    if (actionLower.includes('search') || actionLower.includes('investigate')) return 'Investigation';
    if (actionLower.includes('climb') || actionLower.includes('jump')) return 'Athletics';
    return 'Ability';
}

function detectCombat(response) {
    const combatTriggers = ['roll for initiative', 'combat begins', 'attacks you', 'battle starts', 'enemies appear', 'hostile'];
    return combatTriggers.some(trigger => response.toLowerCase().includes(trigger));
}

function initiateCombat() {
    gameState.inCombat = true;
    addStoryMessage('Combat has begun! Roll for initiative!', 'combat');
}

function addStoryMessage(text, type = 'dm') {
    const container = document.getElementById('story-container');

    // Remove intro if present
    const intro = container.querySelector('.story-intro');
    if (intro) intro.remove();

    const authorLabels = {
        dm: 'Dungeon Master',
        player: gameState.character?.name || 'You',
        system: 'System',
        combat: 'Combat'
    };

    const messageDiv = document.createElement('div');
    messageDiv.className = `story-message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-author">${authorLabels[type] || 'Narrator'}</div>
        <div class="message-content">${text}</div>
    `;

    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;

    gameState.storyHistory.push({ type, text, timestamp: Date.now() });
}

function addTypingIndicator() {
    const container = document.getElementById('story-container');
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// ===== AI Integration =====
async function getAIResponse(prompt, context = 'gameplay') {
    const provider = gameState.settings.aiProvider;

    if (provider === 'demo') {
        return getDemoResponse(prompt, context);
    }

    const apiKey = gameState.settings.apiKey;
    if (!apiKey) {
        showNotification('Please set your API key in Settings to use AI', 'warning');
        return getDemoResponse(prompt, context);
    }

    try {
        switch (provider) {
            case 'openai':
                return await callOpenAI(prompt, context, apiKey);
            case 'groq':
                return await callGroq(prompt, context, apiKey);
            case 'together':
                return await callTogether(prompt, context, apiKey);
            case 'mistral':
                return await callMistral(prompt, context, apiKey);
            case 'cohere':
                return await callCohere(prompt, context, apiKey);
            case 'huggingface':
                return await callHuggingFace(prompt, context, apiKey);
            default:
                return getDemoResponse(prompt, context);
        }
    } catch (error) {
        console.error('AI API Error:', error);
        showNotification(`AI error: ${error.message}. Using demo mode.`, 'warning');
        return getDemoResponse(prompt, context);
    }
}

async function callOpenAI(prompt, context, apiKey) {
    const systemPrompt = getSystemPrompt(context);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                ...getConversationHistory(),
                { role: 'user', content: prompt }
            ],
            temperature: gameState.settings.temperature,
            max_tokens: 500
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

async function callGroq(prompt, context, apiKey) {
    const systemPrompt = getSystemPrompt(context);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                ...getConversationHistory(),
                { role: 'user', content: prompt }
            ],
            temperature: gameState.settings.temperature,
            max_tokens: 800
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

async function callTogether(prompt, context, apiKey) {
    const systemPrompt = getSystemPrompt(context);

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                ...getConversationHistory(),
                { role: 'user', content: prompt }
            ],
            temperature: gameState.settings.temperature,
            max_tokens: 800
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

async function callMistral(prompt, context, apiKey) {
    const systemPrompt = getSystemPrompt(context);

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'mistral-small-latest',
            messages: [
                { role: 'system', content: systemPrompt },
                ...getConversationHistory(),
                { role: 'user', content: prompt }
            ],
            temperature: gameState.settings.temperature,
            max_tokens: 800
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

async function callCohere(prompt, context, apiKey) {
    const systemPrompt = getSystemPrompt(context);

    const response = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'command',
            message: prompt,
            preamble: systemPrompt,
            temperature: gameState.settings.temperature
        })
    });

    const data = await response.json();
    return data.text;
}

async function callHuggingFace(prompt, context, apiKey) {
    const systemPrompt = getSystemPrompt(context);

    // Use chat format for better results
    const messages = [
        { role: 'system', content: systemPrompt },
        ...getConversationHistory(),
        { role: 'user', content: prompt }
    ];

    // Try Mistral model on HuggingFace (free and good for RP)
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            inputs: formatMessagesForHF(messages),
            parameters: {
                max_new_tokens: 600,
                temperature: gameState.settings.temperature,
                return_full_text: false
            }
        })
    });

    const data = await response.json();
    if (data.error) {
        if (data.error.includes('loading')) {
            showNotification('Model is loading, please wait...', 'info');
            await new Promise(r => setTimeout(r, 3000));
            return await callHuggingFace(prompt, context, apiKey);
        }
        throw new Error(data.error);
    }
    return data[0]?.generated_text?.trim() || getDemoResponse(prompt, context);
}

function formatMessagesForHF(messages) {
    return messages.map(m => {
        if (m.role === 'system') return `[INST] ${m.content} [/INST]`;
        if (m.role === 'user') return `[INST] ${m.content} [/INST]`;
        return m.content;
    }).join('\n');
}

function getSystemPrompt(context) {
    const char = gameState.character;
    const campaign = gameState.currentCampaign;
    const style = gameState.settings.dmStyle;

    const styleGuides = {
        balanced: 'Balance epic storytelling with tactical combat and mysterious exploration. Create moments of tension and wonder.',
        narrative: 'Focus on immersive descriptions, emotional depth, and character development. Combat should serve the story. Create memorable NPCs with distinct voices.',
        combat: 'Emphasize tactical combat, strategic positioning, and action sequences. Describe attacks vividly. Track enemy positions and conditions.',
        roleplay: 'Prioritize dialogue, character interactions, and social intrigue. Give NPCs personalities, secrets, and motivations. Create diplomatic challenges.',
        hardcore: 'Be ruthlessly fair. Resources are scarce, enemies are deadly, and poor decisions have permanent consequences. Death is always possible.'
    };

    if (context === 'backstory') {
        return `You are a creative writing assistant for D&D characters. Generate a compelling backstory for a ${char?.race || 'human'} ${char?.class || 'adventurer'} named ${char?.name || 'the hero'} with a ${char?.background || 'mysterious'} background.

Include:
- A defining moment from their past that shaped who they are
- A personal motivation driving them to adventure
- A secret, flaw, or unresolved conflict
- A connection to the world (person, place, or organization)

Write 2-3 vivid paragraphs in third person. Make it feel personal and emotionally resonant.`;
    }

    if (context === 'campaign') {
        return `You are a D&D campaign designer. Create an engaging campaign premise with:
- A compelling hook that draws adventurers in
- A mysterious or threatening situation
- Hints of a larger story
- An evocative opening scene

Write 2-3 paragraphs that set the tone and invite exploration.`;
    }

    // Main gameplay prompt
    return `You are an expert Dungeon Master running "${campaign?.name || 'an epic adventure'}" in a ${campaign?.setting || 'fantasy'} setting. ${styleGuides[style] || styleGuides.balanced}

THE PLAYER CHARACTER:
${char?.name || 'The Hero'}, a level ${char?.level || 1} ${char?.race || 'Human'} ${char?.class || 'Adventurer'}
Background: ${char?.background || 'Unknown'} | HP: ${char?.hp || 10}/${char?.maxHp || 10}
Stats: STR ${char?.stats?.str || 10}, DEX ${char?.stats?.dex || 10}, CON ${char?.stats?.con || 10}, INT ${char?.stats?.int || 10}, WIS ${char?.stats?.wis || 10}, CHA ${char?.stats?.cha || 10}

YOUR ROLE AS DUNGEON MASTER:
- IMMERSE the player with vivid sensory details (sights, sounds, smells, textures)
- REACT dynamically to player choices - their actions have real consequences
- CREATE interesting NPCs with distinct personalities, speech patterns, and motivations
- CHALLENGE the player with meaningful decisions, not just combat
- PACE the adventure with tension, mystery, and moments of discovery
- USE the player's backstory and abilities when relevant
- SUGGEST skill checks when actions require them (e.g., "Roll a DC 15 Perception check")

RESPONSE FORMAT:
- Write 2-4 paragraphs of engaging narrative
- End with a clear situation or choice that invites player response
- Use dialogue for NPCs (give them personality!)
- Describe combat cinematically when it occurs

Remember: You're telling a collaborative story. Make the player feel like a hero in an epic tale.`;
}

function getConversationHistory() {
    return gameState.storyHistory.slice(-10).map(msg => ({
        role: msg.type === 'player' ? 'user' : 'assistant',
        content: msg.text
    }));
}

function getDemoResponse(action, context) {
    const actionLower = action.toLowerCase();
    const char = gameState.character;
    const charName = char?.name || 'Adventurer';
    const charClass = char?.class || 'warrior';

    if (context === 'backstory') {
        return generateDemoBackstory();
    }

    if (context === 'campaign') {
        return generateDemoCampaign();
    }

    // Enhanced demo responses based on action type
    if (actionLower.includes('look') || actionLower.includes('observe') || actionLower.includes('examine')) {
        return getRandomResponse([
            `${charName} surveys the surroundings with practiced vigilance. The chamber stretches before you, ancient stone walls bearing the scars of countless years. Torchlight flickers against faded murals depicting battles long forgotten. In the far corner, something glints—metal, perhaps gold. The air carries the musty scent of age and secrets.\n\nTo your left, a narrow passage descends into darkness. Ahead, a heavy oak door stands slightly ajar, and you can hear faint whispers from beyond. What catches your attention?`,
            `You take a moment to study your environment. Shadows dance along the walls as your torch wavers in an unseen draft. The floor is covered in a fine layer of dust, but you notice footprints—fresh ones—leading toward the eastern archway. Someone has been here recently.\n\nA stone pedestal in the center of the room holds an ornate box, its surface covered in strange runes that seem to pulse with a faint inner light. The whisper of danger tingles at the edge of your senses.`,
            `Your keen eyes sweep across the area. This place tells a story of abandonment and mystery. Broken furniture lies scattered about, and ancient tapestries hang in tatters. But amid the decay, you spot something unusual: a section of wall that doesn't quite match the rest, as if it were added later.\n\nThe silence here feels heavy, expectant. Even the dust motes hanging in the air seem to wait for your next move.`
        ]);
    }

    if (actionLower.includes('search') || actionLower.includes('find') || actionLower.includes('investigate')) {
        const findings = ['a leather pouch containing 15 gold pieces', 'a dusty healing potion', 'a crumpled note with a cryptic message', 'a silver key with an unfamiliar crest', 'a hidden compartment in the wall'];
        const found = findings[Math.floor(Math.random() * findings.length)];
        return `${charName} searches the area methodically, running fingers along edges and checking beneath surfaces. Your persistence pays off—you discover ${found}!\n\nAs you pocket your find, you hear a sound from somewhere nearby. A door creaking? Footsteps? The dungeon seems to respond to your presence.\n\nWhat's your next move?`;
    }

    if (actionLower.includes('attack') || actionLower.includes('fight') || actionLower.includes('strike') || actionLower.includes('hit')) {
        return getRandomResponse([
            `${charName} springs into action! Your weapon arcs through the air with deadly precision. Roll for attack!\n\nYour enemy reacts, but your ${charClass} training serves you well. The clash of steel rings out as combat is joined. The creature before you snarls, wounded but not defeated—its eyes burning with malevolent fury.\n\n*Roll a d20 + your attack modifier to see if you hit!*`,
            `With a fierce battle cry, you launch your assault! The enemy barely manages to raise its guard as your attack comes crashing down. This is what you were born for—the thrill of combat, the test of skill against skill.\n\nYour opponent staggers back, reassessing you with newfound wariness. Around you, the shadows seem to deepen, as if the dungeon itself watches this confrontation with interest.\n\n*Make your attack roll!*`,
            `${charName} moves with the fluid grace of a seasoned combatant. Your strike is swift and sure—but your foe is cunning. They twist away at the last moment, your weapon grazing their armor.\n\nThe battle has begun in earnest. Your enemy circles you, looking for an opening. The air crackles with tension and the promise of violence.\n\nHow do you press your attack?`
        ]);
    }

    if (actionLower.includes('talk') || actionLower.includes('speak') || actionLower.includes('ask') || actionLower.includes('greet')) {
        return getRandomResponse([
            `You approach and speak in a measured tone. The figure turns to face you, revealing weathered features and eyes that have seen much.\n\n"Ah, another adventurer," they say, voice rough as gravel. "I've been expecting someone like you. These halls... they've been restless lately. Something stirs in the deep places." They lean closer, lowering their voice. "If you seek the treasure, beware the guardian. It doesn't sleep—it waits."\n\nThey seem willing to say more, if you ask the right questions.`,
            `${charName} steps forward to engage in conversation. The stranger regards you with a mixture of curiosity and caution.\n\n"You have courage, coming here," they observe. "Or perhaps foolishness—the two often look the same." A dry laugh escapes them. "I can help you, ${charClass}, but nothing in this world is free. Do something for me first, and I'll share what I know about what lies ahead."\n\nWhat do you say?`,
            `You make contact, choosing your words carefully. The NPC listens with an unreadable expression.\n\n"Interesting," they murmur when you finish. "Very interesting indeed. You're not the first to come seeking answers, but you may be the first worthy of receiving them." They gesture toward a worn map on the table. "Let me show you something. But understand—once you see this, there's no turning back."\n\nDo you look at the map?`
        ]);
    }

    if (actionLower.includes('cast') || actionLower.includes('spell') || actionLower.includes('magic')) {
        return getRandomResponse([
            `${charName} reaches for the arcane energies that flow through all things. Your fingers trace mystic patterns in the air as words of power spill from your lips. The spell builds, reality bending to your will—\n\nMagical energy erupts from your hands in a brilliant display! The effect ripples outward, and for a moment, the very air shimmers with otherworldly light. Your magic has been unleashed.\n\nWhat was your target, and what happens next?`,
            `You channel your magical abilities, feeling the familiar surge of power course through your veins. The spell components align perfectly as you complete the incantation.\n\nArcane fire—or perhaps lightning, or ice—manifests at your command. The raw power of magic answers your call, ready to be shaped by your intent. Even in demo mode, a ${charClass} can feel the thrill of wielding such forces.\n\nDescribe your spell's effect!`,
            `Drawing upon your training, ${charName} begins weaving a spell. The ambient magical energy in this ancient place responds eagerly—perhaps too eagerly. The dungeon's walls seem to pulse in rhythm with your casting.\n\nYour spell succeeds, but you sense that magic works... differently here. More powerfully, but also more dangerously. The shadows seem to lean in, curious about this display of arcane might.\n\nWhat did you cast, and what do you do now?`
        ]);
    }

    // Default response for other actions
    return getRandomResponse([
        `${charName}'s action sends ripples through the narrative. The dungeon responds in unexpected ways—a distant echo, a shift in the air, the feeling of being watched.\n\nYou've made your move. Now the world reacts. Something has changed, though whether for better or worse remains to be seen. The path forward beckons, full of mystery and potential.\n\nWhat do you do next?`,
        `You act decisively. Your choice matters here—every decision shapes the story, every action has consequences. The adventure continues to unfold around you, responsive to your will.\n\nThe chamber holds its breath, waiting to see what ${charName} will do next. Opportunities and dangers alike present themselves.\n\nHow do you proceed?`,
        `The ${charClass} makes their move. In the grand tapestry of this adventure, another thread is woven. Whether this leads to glory or peril, only time will tell.\n\n*[Demo mode provides scripted responses. For dynamic AI storytelling, configure an API key in Settings!]*\n\nWhat action do you take?`
    ]);
}

function getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
}

function generateDemoBackstory() {
    const char = gameState.character;
    const name = char?.name || 'The hero';
    const race = char?.race || 'human';
    const charClass = char?.class || 'adventurer';

    const backstories = [
        `${name} was not always a ${charClass}. Born into a humble family of ${race} craftspeople, their life changed forever when a band of raiders destroyed their village. Amidst the flames and chaos, ${name} discovered a hidden strength—a power that had slumbered within them, waiting for the moment of greatest need.\n\nTaken in by a wandering mentor who recognized their potential, ${name} spent years honing their skills. The mentor spoke often of a darkness gathering in the world, of ancient evils stirring in forgotten places. When the mentor disappeared without a trace, ${name} knew their time of preparation was over.\n\nNow ${name} walks the dangerous paths between civilization and shadow, searching for answers about their mentor's fate while confronting the growing darkness. Every battle brings them closer to the truth—and to the vengeance they've sworn against those who destroyed everything they loved.`,

        `The ${race} known as ${name} carries a secret that could shake kingdoms. Once a trusted member of an elite order, they uncovered a conspiracy reaching to the highest levels of power. Betrayed by those they trusted most, ${name} barely escaped with their life—and with evidence of the plot.\n\nThe skills that made ${name} an exceptional ${charClass} now serve a different purpose: survival. Hunted by assassins and unable to trust anyone, they've learned to rely on their wits and their weapon. But ${name} is not content merely to survive. The same fire that made them excel in their former life now drives them to expose the truth.\n\nSomewhere in the world, the conspirators continue their machinations. ${name} moves through the shadows, gathering allies where they can be found, building strength for the day of reckoning. The road is dangerous, but ${name} has never been one to shy away from a fight.`,

        `Legend speaks of a child born under a blood-red moon, marked by fate for greatness—or destruction. ${name}, the ${race} ${charClass}, is that child. Raised in secrecy by those who recognized the signs, ${name} grew up knowing they were different, but never understanding why.\n\nThe powers that manifested during adolescence were both a gift and a curse. ${name} could do things others couldn't, but each use of these abilities drew the attention of dark forces. Their guardians were killed protecting them, and ${name} was forced to flee into the wider world.\n\nNow ${name} seeks to understand the truth of their origins. The prophecy speaks of a choice that must be made—a moment when ${name} will determine the fate of many. Will they embrace the darkness, or stand against it? Only time, and the trials ahead, will reveal the answer.`
    ];

    return backstories[Math.floor(Math.random() * backstories.length)];
}

function generateDemoCampaign() {
    return `In this adventure, ancient forces stir in the forgotten corners of the realm. Dark omens have appeared across the land, and heroes are needed to uncover the truth and prevent catastrophe. The adventure begins in a small village where strange disappearances have the locals terrified...`;
}

// ===== Settings =====
function initializeSettings() {
    // Load settings
    document.getElementById('ai-provider').value = gameState.settings.aiProvider;
    document.getElementById('api-key').value = gameState.settings.apiKey;
    document.getElementById('ai-temperature').value = gameState.settings.temperature * 100;
    document.getElementById('dm-style').value = gameState.settings.dmStyle;
    document.getElementById('auto-roll').checked = gameState.settings.autoRoll;
    document.getElementById('sound-effects').checked = gameState.settings.soundEffects;
    document.getElementById('dark-mode').checked = gameState.settings.darkMode;

    // Event listeners
    document.getElementById('ai-provider').addEventListener('change', (e) => {
        gameState.settings.aiProvider = e.target.value;
        document.getElementById('api-key-section').style.display =
            e.target.value === 'demo' ? 'none' : 'block';
        saveGameState();
    });

    document.getElementById('api-key').addEventListener('change', (e) => {
        gameState.settings.apiKey = e.target.value;
        saveGameState();
    });

    document.getElementById('toggle-api-key').addEventListener('click', () => {
        const input = document.getElementById('api-key');
        const icon = document.getElementById('toggle-api-key').querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('bi-eye', 'bi-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('bi-eye-slash', 'bi-eye');
        }
    });

    document.getElementById('ai-temperature').addEventListener('input', (e) => {
        gameState.settings.temperature = e.target.value / 100;
        saveGameState();
    });

    document.getElementById('dm-style').addEventListener('change', (e) => {
        gameState.settings.dmStyle = e.target.value;
        saveGameState();
    });

    document.getElementById('auto-roll').addEventListener('change', (e) => {
        gameState.settings.autoRoll = e.target.checked;
        saveGameState();
    });

    document.getElementById('sound-effects').addEventListener('change', (e) => {
        gameState.settings.soundEffects = e.target.checked;
        saveGameState();
    });

    document.getElementById('dark-mode').addEventListener('change', (e) => {
        gameState.settings.darkMode = e.target.checked;
        document.documentElement.setAttribute('data-bs-theme', e.target.checked ? 'dark' : 'light');
        saveGameState();
    });

    // Data management
    document.getElementById('export-data').addEventListener('click', exportData);
    document.getElementById('import-data').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importData);
    document.getElementById('clear-data').addEventListener('click', clearData);

    // Hide API key section if demo mode
    if (gameState.settings.aiProvider === 'demo') {
        document.getElementById('api-key-section').style.display = 'none';
    }
}

// ===== Data Persistence =====
function saveGameState() {
    localStorage.setItem('dnd-game-state', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('dnd-game-state');
    if (saved) {
        const loaded = JSON.parse(saved);
        Object.assign(gameState, loaded);

        // Restore campaign state if exists
        if (gameState.currentCampaign && gameState.storyHistory.length > 0) {
            document.getElementById('current-campaign').textContent = gameState.currentCampaign.name;
            document.getElementById('player-input').disabled = false;
            document.getElementById('send-action').disabled = false;

            // Restore story
            gameState.storyHistory.forEach(msg => {
                addStoryMessageDirect(msg.text, msg.type);
            });
        }
    }
}

function addStoryMessageDirect(text, type) {
    const container = document.getElementById('story-container');
    const intro = container.querySelector('.story-intro');
    if (intro) intro.remove();

    const authorLabels = {
        dm: 'Dungeon Master',
        player: gameState.character?.name || 'You',
        system: 'System',
        combat: 'Combat'
    };

    const messageDiv = document.createElement('div');
    messageDiv.className = `story-message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-author">${authorLabels[type] || 'Narrator'}</div>
        <div class="message-content">${text}</div>
    `;

    container.appendChild(messageDiv);
}

function exportData() {
    const data = JSON.stringify(gameState, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `dnd-save-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showNotification('Game data exported!', 'success');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            Object.assign(gameState, data);
            saveGameState();
            location.reload();
        } catch (err) {
            showNotification('Invalid save file', 'danger');
        }
    };
    reader.readAsText(file);
}

function clearData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.removeItem('dnd-game-state');
        location.reload();
    }
}

// ===== Notifications =====
function showNotification(message, type = 'info') {
    const toast = document.getElementById('notification-toast');
    const toastBody = document.getElementById('toast-message');

    toast.className = `toast bg-${type === 'success' ? 'success' : type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'info'}`;
    toastBody.textContent = message;

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// ===== Make functions globally available =====
window.showSection = showSection;
window.startCampaign = startCampaign;
