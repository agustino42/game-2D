// ===== NICKNAME & GAME FUNCTIONS =====
function startGame() {
    const nicknameInput = document.getElementById('nickname');
    const nickname = nicknameInput.value.trim();
    
    if (!nickname) {
        alert("⚠️ ¡Ingresa un nickname para aparecer en el ranking!");
        nicknameInput.focus();
        return;
    }
    
    if (nickname.length < 3) {
        alert("❌ El nickname debe tener al menos 3 caracteres");
        return;
    }
    
    if (nickname.length > 20) {
        alert("❌ El nickname no puede tener más de 20 caracteres");
        return;
    }
    
    // Validar caracteres especiales
    if (!/^[a-zA-Z0-9 _-]+$/.test(nickname)) {
        alert("❌ El nickname solo puede contener letras, números, espacios, guiones y guiones bajos");
        return;
    }
    
    // Guardar en localStorage
    localStorage.setItem('space_survival_nickname', nickname);
    
    // Agregar a lista de recientes
    addToRecentPlayers(nickname);
    
    // Abrir juego en nueva pestaña (game.html es el juego real)
    window.open('game.html', '_blank');
}

function addToRecentPlayers(nickname) {
    // Guardar últimos 5 jugadores
    let recent = JSON.parse(localStorage.getItem('recent_players') || '[]');
    recent = recent.filter(name => name !== nickname); // quitar duplicados
    recent.unshift(nickname); // agregar al inicio
    recent = recent.slice(0, 5); // mantener solo 5
    
    localStorage.setItem('recent_players', JSON.stringify(recent));
    updateRecentPlayersDisplay();
}

function updateRecentPlayersDisplay() {
    const recent = JSON.parse(localStorage.getItem('recent_players') || '[]');
    if (recent.length > 0) {
        document.getElementById('recent-players-list').textContent = recent.join(', ');
    }
}

// ===== LOAD SAVED NICKNAME =====
document.addEventListener('DOMContentLoaded', () => {
    const savedNickname = localStorage.getItem('space_survival_nickname');
    if (savedNickname) {
        document.getElementById('nickname').value = savedNickname;
    }
    updateRecentPlayersDisplay();
    
    // Cargar rankings
    loadRankings();
    
    // Cargar estadísticas
    loadStats();
});

// ===== RANKING FUNCTIONS =====
let currentFilter = 'all';

function filterRanking(filter) {
    currentFilter = filter;
    
    // Actualizar botones
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(filter === 'all' ? 'todos' : 
                   filter === 'today' ? 'hoy' : 'semana')) {
            btn.classList.add('active');
        }
    });
    
    // Recargar rankings con filtro
    loadRankings();
}

async function loadRankings() {
    const tbody = document.getElementById('ranking-body');
    tbody.innerHTML = '<tr class="loading-row"><td colspan="4">Cargando rankings...</td></tr>';
    
    try {
        // Simular datos locales (en producción usarás la API de Python)
        const rankings = await getMockRankings();
        
        tbody.innerHTML = '';
        
        rankings.forEach((player, index) => {
            const row = document.createElement('tr');
            
            // Clase especial para top 3
            let rankClass = '';
            if (index === 0) rankClass = 'rank-1';
            else if (index === 1) rankClass = 'rank-2';
            else if (index === 2) rankClass = 'rank-3';
            
            row.innerHTML = `
                <td class="rank ${rankClass}">${index + 1}</td>
                <td class="player">${player.player}</td>
                <td class="score">${player.score.toLocaleString()}</td>
                <td class="date">${formatDate(player.date)}</td>
            `;
            
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading rankings:', error);
        tbody.innerHTML = '<tr class="loading-row"><td colspan="4">Error al cargar rankings</td></tr>';
    }
}

async function getMockRankings() {
    // Simular llamada a API con datos mock
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { player: 'SpaceWarrior', score: 25000, date: '2024-01-15' },
                { player: 'GalacticPilot', score: 22500, date: '2024-01-14' },
                { player: 'ZombieSlayer', score: 20000, date: '2024-01-13' },
                { player: 'CosmicHunter', score: 18500, date: '2024-01-12' },
                { player: 'NebulaRanger', score: 17200, date: '2024-01-11' },
                { player: 'StarCommander', score: 15800, date: '2024-01-10' },
                { player: 'PlanetDefender', score: 14300, date: '2024-01-09' },
                { player: 'SolarFighter', score: 13100, date: '2024-01-08' },
                { player: 'AstroGuard', score: 12500, date: '2024-01-07' },
                { player: 'OrbitSurvivor', score: 11200, date: '2024-01-06' }
            ]);
        }, 500);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// ===== STATS FUNCTIONS =====
async function loadStats() {
    // Simular datos (en producción usarás la API de Python)
    setTimeout(() => {
        document.getElementById('total-zombies').textContent = '1,234,567';
        document.getElementById('top-score').textContent = '25,000';
        document.getElementById('players-today').textContent = '856';
        document.getElementById('avg-score').textContent = '12,500';
    }, 300);
}

// ===== VALIDATE NICKNAME ON INPUT =====
document.getElementById('nickname').addEventListener('input', (e) => {
    const value = e.target.value;
    
    // Permitir solo letras, números, espacios, guiones y guiones bajos
    e.target.value = value.replace(/[^a-zA-Z0-9 _-]/g, '');
});

// ===== PREVENT FORM SUBMISSION =====
document.querySelector('.nickname-input').addEventListener('submit', (e) => {
    e.preventDefault();
});
