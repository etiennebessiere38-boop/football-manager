let db = {};
let playerSelected = null;
let radarChartInstance = null;
let currentDateObj = new Date(2026, 6, 4);
let currentManagerName = "Entraîneur";

let inboxData = [];

async function chargerJeu() {
    try {
        const reponse = await fetch('./database.json');
        db = await reponse.json();
        
        initialiserClubs();
        lucide.createIcons();
    } catch (err) {
        console.error("Erreur de chargement du fichier JSON:", err);
    }
}

function initialiserClubs() {
    const selectSquad = document.getElementById('squad-club-select');
    const selectStart = document.getElementById('start-club-select');
    
    selectSquad.innerHTML = '';
    selectStart.innerHTML = '';

    Object.keys(db).forEach(ligue => {
        db[ligue].clubs.forEach((club, idx) => {
            const optValue = `${ligue}__${idx}`;
            const optText = `${club.nom} (${ligue})`;

            selectSquad.appendChild(new Option(optText, optValue));
            selectStart.appendChild(new Option(optText, optValue));
        });
    });

    selectSquad.addEventListener('change', () => {
        afficherEffectif();
        miseAJourHeaderClub();
    });
}

function lancerNouvellePartie() {
    const val = document.getElementById('start-club-select').value;
    currentManagerName = document.getElementById('start-manager-name').value.trim() || "Entraîneur";
    
    document.getElementById('squad-club-select').value = val;
    document.getElementById('modal-start').classList.add('hidden');
    
    const [ligue, idx] = val.split('__');
    const club = db[ligue].clubs[idx];

    inboxData = [
        {
            id: 1,
            sender: "Présidence du Club",
            title: `Bienvenue à ${club.nom}, ${currentManagerName} !`,
            date: "04 Jul 2026",
            content: `Le conseil d'administration est ravi de vous confier les clés de l'équipe première de ${club.nom}. Nos objectifs pour cette saison sont ambitieux. Utilisez le bouton "CONTINUER" pour faire avancer le calendrier et gérer le mercato.`
        }
    ];

    afficherEffectif();
    miseAJourHeaderClub();
    naviguerVers('inbox');
}

function miseAJourHeaderClub() {
    const val = document.getElementById('squad-club-select').value;
    if (!val) return;
    const [ligue, idx] = val.split('__');
    const club = db[ligue].clubs[idx];
    
    document.getElementById('club-header-info').innerText = `${club.nom} (${ligue}) | Manager : ${currentManagerName}`;
}

function afficherEffectif() {
    const val = document.getElementById('squad-club-select').value;
    if (!val) return;

    const [ligue, idx] = val.split('__');
    const club = db[ligue].clubs[idx];

    const tbody = document.getElementById('squad-table-body');
    tbody.innerHTML = '';

    club.joueurs.forEach((j, i) => {
        const valEur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(j.valeur_eur || 0);
        tbody.innerHTML += `
            <tr class="hover:bg-purple-900/30 transition border-b border-[#2d1850]">
                <td class="p-3 font-bold text-white cursor-pointer" onclick="ouvrirProfilJoueur('${ligue}', ${idx}, ${i})">${j.nom}</td>
                <td class="p-3 text-purple-300">${j.poste || 'MOC'}</td>
                <td class="p-3 text-slate-400">${j.nationalite || 'N/A'}</td>
                <td class="p-3 text-right text-emerald-400 font-mono font-bold">${valEur}</td>
                <td class="p-3 text-center">
                    <button onclick="ouvrirProfilJoueur('${ligue}', ${idx}, ${i})" class="bg-purple-700 hover:bg-purple-600 px-2 py-1 rounded text-[10px] font-bold">
                        Profil
                    </button>
                </td>
            </tr>
        `;
    });
}

function ouvrirProfilJoueur(ligue, clubIdx, playerIdx) {
    playerSelected = db[ligue].clubs[clubIdx].joueurs[playerIdx];
    
    document.getElementById('p-name').innerText = playerSelected.nom;
    document.getElementById('p-sub').innerText = `27 ans | ${playerSelected.poste || 'Milieu Offensif'}`;
    document.getElementById('p-value').innerText = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(playerSelected.valeur_eur || 0);

    genererStatsFM();
    naviguerVers('player');
}

function genererStatsFM() {
    const tech = ["Corners", "Centres", "Dribbles", "Finition", "Contrôle", "Tirs de loin", "Passes", "Tacles"];
    const mental = ["Agressivité", "Anticipation", "Sang-froid", "Concentration", "Décisions", "Détermination", "Vision"];
    const phys = ["Accélération", "Agilité", "Équilibre", "Vitesse", "Endurance", "Puissance"];

    const toutRemplir = (containerId, liste) => {
        const el = document.getElementById(containerId);
        el.innerHTML = '';
        liste.forEach(s => {
            const val = Math.floor(Math.random() * 11) + 10;
            let colorClass = 'stat-low';
            if (val >= 16) colorClass = 'stat-high';
            else if (val >= 12) colorClass = 'stat-med';

            el.innerHTML += `
                <div class="flex justify-between items-center">
                    <span class="text-slate-300">${s}</span>
                    <span class="${colorClass}">${val}</span>
                </div>
            `;
        });
    };

    toutRemplir('stats-tech', tech);
    toutRemplir('stats-mental', mental);
    toutRemplir('stats-phys', phys);

    renderRadar();
}

function renderRadar() {
    const ctx = document.getElementById('radarChart').getContext('2d');
    if (radarChartInstance) radarChartInstance.destroy();

    const randomStats = Array.from({length: 6}, () => Math.floor(Math.random() * 9) + 11);

    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Attaque', 'Technique', 'Vision', 'Vitesse', 'Physique', 'Défense'],
            datasets: [{
                data: randomStats,
                backgroundColor: 'rgba(16, 185, 129, 0.3)',
                borderColor: '#10b981',
                borderWidth: 2,
                pointBackgroundColor: '#10b981'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: '#361f5e' },
                    grid: { color: '#361f5e' },
                    pointLabels: { color: '#94a3b8', font: { size: 9 } },
                    ticks: { display: false },
                    suggestedMin: 0,
                    suggestedMax: 20
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function naviguerVers(vue) {
    ['inbox', 'squad', 'player', 'tactics'].forEach(v => {
        document.getElementById(`view-${v}`).classList.add('hidden');
    });
    document.getElementById(`view-${vue}`).classList.remove('hidden');

    if (vue === 'inbox') chargerInboxUI();
}

function chargerInboxUI() {
    const list = document.getElementById('inbox-list');
    list.innerHTML = '';
    inboxData.forEach(m => {
        list.innerHTML += `
            <div onclick="afficherMessageDetail(${m.id})" class="p-3 cursor-pointer hover:bg-purple-900/30 transition border-b border-[#2d1850]">
                <div class="text-[10px] text-amber-400 font-bold">${m.sender} - ${m.date}</div>
                <div class="text-xs font-bold text-white">${m.title}</div>
            </div>
        `;
    });
    if (inboxData.length > 0) afficherMessageDetail(inboxData[0].id);
    document.getElementById('inbox-count').innerText = inboxData.length;
}

function afficherMessageDetail(id) {
    const msg = inboxData.find(m => m.id === id);
    if (!msg) return;

    document.getElementById('inbox-detail').innerHTML = `
        <div>
            <div class="text-xs text-amber-400 font-bold mb-1">${msg.sender} | ${msg.date}</div>
            <h2 class="text-lg font-bold text-white mb-4">${msg.title}</h2>
            <p class="text-xs text-slate-300 leading-relaxed">${msg.content}</p>
        </div>
        <div class="mt-6 pt-4 border-t border-[#361f5e] flex justify-end gap-2">
            <button onclick="naviguerVers('squad')" class="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded">Voir l'effectif</button>
        </div>
    `;
}

function avancerTemps() {
    currentDateObj.setDate(currentDateObj.getDate() + 1);
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    const dateStr = currentDateObj.toLocaleDateString('fr-FR', options);
    document.getElementById('current-date').innerText = dateStr;

    const rand = Math.random();

    if (rand < 0.20) {
        const nbClubs = Math.floor(Math.random() * 4);
        if (nbClubs === 0) {
            inboxData.unshift({
                id: Date.now(),
                sender: "Directeur Sportif",
                title: "Marché calme",
                date: dateStr,
                content: "Aucun club n'a manifesté d'intérêt formel aujourd'hui pour vos joueurs transférables."
            });
        } else {
            inboxData.unshift({
                id: Date.now(),
                sender: "Agent Intermédiaire",
                title: `Intérêt de ${nbClubs} club(s) sur le marché`,
                date: dateStr,
                content: `${nbClubs} club(s) ont pris des renseignements sur votre effectif.`
            });
        }
    } else if (rand < 0.35) {
        inboxData.unshift({
            id: Date.now(),
            sender: "Staff Médical",
            title: "Inquiétude à l'entraînement",
            date: dateStr,
            content: "Un joueur a ressenti une alerte musculaire lors de la séance matinale. Bilan médical en attente."
        });
    } else if (rand < 0.45) {
        inboxData.unshift({
            id: Date.now(),
            sender: "Chef Recruteur",
            title: "Nouveau rapport de détection",
            date: dateStr,
            content: "Nos recruteurs ont transmis une fiche d'observation sur une pépite émergente."
        });
    }

    chargerInboxUI();
}

function ouvrirModalIntermediaire() {
    if (!playerSelected) return;

    const list = document.getElementById('agent-list');
    list.innerHTML = '';

    const nbAgents = Math.floor(Math.random() * 4) + 1;
    const nomsAgents = ["Stefano Battistini", "Paulo Rocha", "Luís Novo", "Riccardo Miggiano", "Danijel Prpić", "Mindy Thompson", "Harry Dunne", "Fabio Capanna"];
    const scopes = ["Régional", "National", "Continental", "Mondial"];

    const agentsProposes = nomsAgents.sort(() => 0.5 - Math.random()).slice(0, nbAgents);

    agentsProposes.forEach((nom, index) => {
        const com = Math.floor(Math.random() * 8) + 2;
        const scope = scopes[Math.floor(Math.random() * scopes.length)];
        
        const valBase = playerSelected.valeur_eur || 1500000;
        const minVal = Math.round((valBase * (0.8 + Math.random() * 0.2)) / 50000) * 50000;
        const maxVal = Math.round((minVal * (1.1 + Math.random() * 0.4)) / 50000) * 50000;

        const minStr = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(minVal);
        const maxStr = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(maxVal);

        list.innerHTML += `
            <label class="flex items-center justify-between p-3 fm-card rounded cursor-pointer border border-[#361f5e] hover:border-amber-500 transition">
                <div class="flex items-center gap-3">
                    <input type="radio" name="agent_choice" value="${nom}" ${index === 0 ? 'checked' : ''} class="accent-amber-500">
                    <div>
                        <div class="font-bold text-white">${nom}</div>
                        <div class="text-[10px] text-slate-400">Agent ${scope}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-amber-400 font-bold">${com} % com.</div>
                    <div class="text-[10px] text-slate-400">Estimation : ${minStr} - ${maxStr}</div>
                </div>
            </label>
        `;
    });

    document.getElementById('modal-agent').classList.remove('hidden');
}

function fermerModalAgent() {
    document.getElementById('modal-agent').classList.add('hidden');
}

function confirmerAgent() {
    fermerModalAgent();
    
    const succes = Math.random() > 0.3;
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    const dateStr = currentDateObj.toLocaleDateString('fr-FR', options);

    if (succes) {
        const nbClubs = Math.floor(Math.random() * 3) + 1;
        inboxData.unshift({
            id: Date.now(),
            sender: "Intermédiaire Mandaté",
            title: `Offres obtenues pour ${playerSelected.nom}`,
            date: dateStr,
            content: `L'agent mandaté a sondé ses réseaux. ${nbClubs} club(s) préparent une offre officielle.`
        });
    } else {
        inboxData.unshift({
            id: Date.now(),
            sender: "Intermédiaire Mandaté",
            title: `Échec pour ${playerSelected.nom}`,
            date: dateStr,
            content: `Les clubs contactés ont refusé de s'aligner sur les exigences financières.`
        });
    }

    chargerInboxUI();
    naviguerVers('inbox');
}

window.onload = chargerJeu;