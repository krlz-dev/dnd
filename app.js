// ===== AI Dungeon Master - Main Application =====

// ===== State Management =====
const gameState = {
    character: null,
    currentCampaign: null,
    storyHistory: [],
    settings: {
        aiProvider: 'demo',
        apiKey: '',
        temperature: 0.7,
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
        showNotification('Please set your API key in settings', 'warning');
        return getDemoResponse(prompt, context);
    }

    try {
        switch (provider) {
            case 'openai':
                return await callOpenAI(prompt, context, apiKey);
            case 'groq':
                return await callGroq(prompt, context, apiKey);
            case 'cohere':
                return await callCohere(prompt, context, apiKey);
            case 'huggingface':
                return await callHuggingFace(prompt, context, apiKey);
            default:
                return getDemoResponse(prompt, context);
        }
    } catch (error) {
        console.error('AI API Error:', error);
        showNotification('AI request failed, using demo mode', 'warning');
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
            model: 'llama-3.1-70b-versatile',
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

    const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            inputs: `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`,
            parameters: {
                max_new_tokens: 500,
                temperature: gameState.settings.temperature
            }
        })
    });

    const data = await response.json();
    return data[0]?.generated_text?.split('Assistant:').pop().trim() || getDemoResponse(prompt, context);
}

function getSystemPrompt(context) {
    const char = gameState.character;
    const campaign = gameState.currentCampaign;
    const style = gameState.settings.dmStyle;

    const styleGuides = {
        balanced: 'Balance storytelling with combat and exploration.',
        narrative: 'Focus on rich descriptions and character development. Minimize combat.',
        combat: 'Emphasize tactical combat and action sequences.',
        roleplay: 'Prioritize dialogue, character interactions, and social encounters.',
        hardcore: 'Be challenging and unforgiving. Consequences are real and permanent.'
    };

    let prompt = `You are an expert Dungeon Master running a D&D 5e campaign. ${styleGuides[style] || ''}

Current Campaign: ${campaign?.name || 'Custom Adventure'}
Setting: ${campaign?.setting || 'Fantasy'}

Player Character:
- Name: ${char?.name || 'Unknown'}
- Race: ${char?.race || 'Unknown'}
- Class: ${char?.class || 'Unknown'}
- Level: ${char?.level || 1}
- Background: ${char?.background || 'Unknown'}

Guidelines:
- Keep responses concise (2-4 paragraphs max)
- Be descriptive but not verbose
- Present meaningful choices to the player
- Follow D&D 5e rules where applicable
- React to player actions logically
- Include dice roll suggestions when appropriate
- Create engaging NPCs and encounters`;

    if (context === 'backstory') {
        prompt = 'Generate a compelling character backstory for a D&D character. Keep it to 2-3 paragraphs, include a motivation, a conflict, and a goal.';
    } else if (context === 'campaign') {
        prompt = 'You are creating a D&D campaign. Provide an engaging premise and opening scene.';
    }

    return prompt;
}

function getConversationHistory() {
    return gameState.storyHistory.slice(-10).map(msg => ({
        role: msg.type === 'player' ? 'user' : 'assistant',
        content: msg.text
    }));
}

function getDemoResponse(action, context) {
    // Simulate AI response in demo mode
    const actionLower = action.toLowerCase();
    let responseType = 'default';

    if (actionLower.includes('look') || actionLower.includes('observe') || actionLower.includes('examine')) {
        responseType = 'look';
    } else if (actionLower.includes('search') || actionLower.includes('find') || actionLower.includes('investigate')) {
        responseType = 'search';
    } else if (actionLower.includes('attack') || actionLower.includes('fight') || actionLower.includes('strike')) {
        responseType = 'attack';
    } else if (actionLower.includes('talk') || actionLower.includes('speak') || actionLower.includes('ask')) {
        responseType = 'talk';
    } else if (actionLower.includes('cast') || actionLower.includes('spell') || actionLower.includes('magic')) {
        responseType = 'magic';
    }

    if (context === 'backstory') {
        return generateDemoBackstory();
    }

    if (context === 'campaign') {
        return generateDemoCampaign();
    }

    const templates = demoResponses[responseType];
    let response = templates[Math.floor(Math.random() * templates.length)];

    // Fill in template variables
    Object.keys(storyElements).forEach(key => {
        const values = storyElements[key];
        const value = values[Math.floor(Math.random() * values.length)];
        response = response.replace(`{${key}}`, value);
    });

    // Clean up any remaining placeholders
    response = response.replace(/\{[^}]+\}/g, '...');

    return response + '\n\nWhat do you do next?';
}

function generateDemoBackstory() {
    const hooks = [
        'was raised by wolves in the wilderness',
        'escaped from a noble house after witnessing a terrible crime',
        'was the sole survivor of a village destroyed by dragons',
        'served in a legendary mercenary company',
        'was trained by a mysterious hermit'
    ];
    const motivations = [
        'seeks revenge against those who wronged them',
        'searches for a lost family heirloom',
        'hopes to prove their worth to the world',
        'wants to discover the truth about their mysterious past',
        'aims to protect the innocent from evil'
    ];

    return `${hooks[Math.floor(Math.random() * hooks.length)]}. After years of hardship, they ${motivations[Math.floor(Math.random() * motivations.length)]}. Their journey has led them to become an adventurer, seeking fortune and glory in dangerous lands.`;
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
