// Constants
const BATCH_SIZE = 50; 
const COLORS = ['#e542a3', '#1f7aec', '#d44638', '#2ecc71', '#f39c12', '#9b59b6', '#3498db', '#1abc9c'];

// State
let globalMessages = [];    
let messageOnlyCount = 0;   
let myName = "";
let renderRange = { start: 0, end: 0 };
let colorMap = {};
let searchResultsIDs = [];
let searchPointer = -1;

//UI Selector
const $ = (id) => {
    const el = document.getElementById(id);
    return el;
};

// Initialisation
window.onload = () => {
    // Hide Loader
    const loader = $('loader');
    const bar = document.querySelector('.fill');
    if (bar) setTimeout(() => bar.style.width = '100%', 100);
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }, 800);
    }
};

// FILE INPUT LISTENER 
const fileInputEl = $('file-input');
if(fileInputEl) {
    fileInputEl.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            const dropTarget = $('drop-target');
            if(dropTarget) {
                const dropP = dropTarget.querySelector('p');
                const dropI = dropTarget.querySelector('i');
                if(dropP) dropP.innerHTML = `<strong>${fileName}</strong><br><span style="font-size:12px;opacity:0.7">Ready</span>`;
                if(dropI) {
                    dropI.className = "ph-fill ph-check-circle";
                    dropI.style.color = "#00a884";
                }
                dropTarget.style.borderColor = "#00a884";
                dropTarget.style.background = "rgba(0, 168, 132, 0.1)";
            }
        }
    });
}

// Core Process
async function initViewer() {
    const fileInput = $('file-input');
    const nameInput = $('display-name');
    
    if(!fileInput || !fileInput.files.length) return showToast("Please select a file");
    if(!nameInput || !nameInput.value.trim()) return showToast("Enter your display name");
    
    myName = nameInput.value.trim();
    
    if(window.innerWidth <= 800) toggleSidebar();
    
    const file = fileInput.files[0];
    let rawText = "";

    try {
        if(file.name.endsWith('.zip')) {
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);
            const chatFile = Object.keys(contents.files).find(n => n.endsWith('.txt') && !n.startsWith('__MACOSX'));
            if(!chatFile) throw new Error("No .txt file found in ZIP");
            rawText = await contents.files[chatFile].async("string");
        } else {
            rawText = await readFile(file);
        }
        
        parseChatData(rawText);
        updateUIState(file.name);
        
    } catch(e) {
        showToast("Error: " + e.message);
        console.error(e);
    }
}

function readFile(f) {
    return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = e => res(e.target.result);
        r.readAsText(f);
    });
}

// Parsing Engine
function parseChatData(text) {
    globalMessages = [];
    messageOnlyCount = 0;
    
    const lines = text.split(/\r?\n/);
    const regex = /^\[?(\d{1,4}[/-]\d{1,2}[/-]\d{1,4},? \d{1,2}:\d{2}(?::\d{2})?(?:\s?[APap][Mm])?)\]? (?:- )?([^:]+): (.*)/;
    
    let lastDate = "";
    let mediaCount = 0;
    let senderStats = {}; 
    
    lines.forEach((line, idx) => {
        if(!line.trim()) return;
        const match = line.match(regex);
        
        if(match) {
            const rawTime = match[1];
            const sender = match[2];
            let content = match[3];
            const dateStr = rawTime.split(',')[0];
            
            // Date Marker
            if(dateStr !== lastDate) {
                globalMessages.push({ type: 'date', content: dateStr, id: 'sys-'+idx });
                lastDate = dateStr;
            }
            
            // Analyze Content
            if(content.includes('<Media omitted>')) {
                content = '📷 Media omitted';
                mediaCount++;
            }
            
            // Update Stats
            senderStats[sender] = (senderStats[sender] || 0) + 1;
            messageOnlyCount++;
            
            // Store Message
            globalMessages.push({
                type: 'msg',
                id: idx,
                time: rawTime.match(/\d{1,2}:\d{2}\s?([APap][Mm])?/)?.[0] || rawTime.split(',')[1],
                sender: sender,
                content: content,
                isMe: (sender.toLowerCase() === myName.toLowerCase() || sender === "You")
            });
        }
    });
    
    generateStats(senderStats, mediaCount);
    
    renderRange = { start: Math.max(0, globalMessages.length - BATCH_SIZE), end: globalMessages.length };
    renderChatList();
    scrollToBottom();
}

// Analytics
function generateStats(senders, media) {
    if($('stat-total')) $('stat-total').innerText = messageOnlyCount.toLocaleString();
    if($('stat-media')) $('stat-media').innerText = media.toLocaleString();
    
    const list = $('stats-list');
    if(list) {
        list.innerHTML = '';
        const sorted = Object.entries(senders).sort((a,b) => b[1] - a[1]);
        
        sorted.forEach(([name, count]) => {
            const pct = ((count / messageOnlyCount) * 100).toFixed(1);
            const html = `
                <div class="stat-row">
                    <div class="stat-row-header">
                        <span>${name}</span>
                        <span>${pct}% (${count})</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width:${pct}%"></div>
                    </div>
                </div>`;
            list.insertAdjacentHTML('beforeend', html);
        });
    }
}

// Rendering
function renderChatList() {
    const list = $('message-list');
    if(!list) return;
    list.innerHTML = '';
    
    const slice = globalMessages.slice(renderRange.start, renderRange.end);
    let lastSender = null;
    
    slice.forEach(item => {
        if(item.type === 'date') {
            list.insertAdjacentHTML('beforeend', `<div class="system-msg sticky-date">${item.content}</div>`);
            lastSender = null;
        } else {
            const isFirst = item.sender !== lastSender;
            const tailClass = isFirst ? (item.isMe ? 'tail-out' : 'tail-in') : '';
            const rowClass = `msg-row ${item.isMe ? 'sent' : 'received'} ${isFirst ? 'tail' : ''} ${tailClass}`;
            
            let nameHtml = (!item.isMe && isFirst) ? `<div class="sender" style="color:${getColor(item.sender)}">${item.sender}</div>` : '';
            let bodyHtml = formatLinks(item.content);
            
            const html = `
                <div class="${rowClass}" id="msg-${item.id}">
                    <div class="bubble">
                        ${nameHtml}
                        <span class="msg-text">${bodyHtml}</span>
                        <div class="meta">
                            <span>${item.time}</span>
                            ${item.isMe ? '<i class="ph-bold ph-check" style="color:#53bdeb"></i>' : ''}
                        </div>
                    </div>
                </div>`;
            list.insertAdjacentHTML('beforeend', html);
            lastSender = item.sender;
        }
    });
}

// Lazy Load
const viewport = $('viewport');
if(viewport) {
    viewport.addEventListener('scroll', (e) => {
        if(e.target.scrollTop === 0 && renderRange.start > 0) {
            const oldHeight = e.target.scrollHeight;
            renderRange.start = Math.max(0, renderRange.start - BATCH_SIZE);
            renderChatList();
            const newHeight = e.target.scrollHeight;
            e.target.scrollTop = newHeight - oldHeight;
        }
    });
}

function scrollToBottom() {
    const v = $('viewport');
    if(v) v.scrollTop = v.scrollHeight;
}

// Search Engine
function handleSearch(query) {
    if(!query || query.length < 2) {
        searchResultsIDs = [];
        if($('search-counter')) $('search-counter').innerText = "";
        return;
    }
    
    query = query.toLowerCase();
    
    searchResultsIDs = globalMessages
        .filter(m => m.type === 'msg' && m.content.toLowerCase().includes(query))
        .map(m => m.id);
        
    const count = searchResultsIDs.length;
    if($('search-counter')) $('search-counter').innerText = count > 0 ? `${count} found` : "No matches";
    
    if(count > 0) {
        searchPointer = count - 1; 
        jumpToMessage(searchResultsIDs[searchPointer]);
    }
}

function navSearch(dir) {
    if(searchResultsIDs.length === 0) return;
    
    if(dir === 'up') searchPointer--;
    else searchPointer++;
    
    if(searchPointer < 0) searchPointer = searchResultsIDs.length - 1;
    if(searchPointer >= searchResultsIDs.length) searchPointer = 0;
    
    jumpToMessage(searchResultsIDs[searchPointer]);
    
    if($('search-counter')) $('search-counter').innerText = `${searchResultsIDs.length - searchPointer}/${searchResultsIDs.length}`;
}

function jumpToMessage(msgId) {
    const idx = globalMessages.findIndex(m => m.id === msgId);
    if(idx === -1) return;
    
    renderRange.start = Math.max(0, idx - 40);
    renderRange.end = Math.min(globalMessages.length, idx + 40);
    renderChatList();
    
    setTimeout(() => {
        const el = document.getElementById(`msg-${msgId}`);
        if(el) {
            el.scrollIntoView({ block: 'center', behavior: 'auto' });
            const txt = el.querySelector('.msg-text');
            const query = $('live-search').value;
            const regex = new RegExp(`(${query})`, 'gi');
            txt.innerHTML = txt.innerText.replace(regex, `<span class="hl focus">$1</span>`);
        }
    }, 50);
}

// Utils
function formatLinks(text) {
    return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:#53bdeb">$1</a>')
               .replace(/\*(.*?)\*/g, '<strong>$1</strong>');
}

function getColor(name) {
    if (!colorMap[name]) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        colorMap[name] = COLORS[Math.abs(hash) % COLORS.length];
    }
    return colorMap[name];
}

function updateUIState(filename) {
    if($('upload-panel')) $('upload-panel').classList.add('hidden');
    if($('chat-list-panel')) $('chat-list-panel').classList.remove('hidden');
    if($('empty-state')) $('empty-state').classList.add('hidden');
    
    const cleanName = filename.replace(/(_chat\.txt|WhatsApp Chat with |\.\w+$)/g, '');
    
    if($('sidebar-title')) $('sidebar-title').innerText = cleanName;
    if($('header-name')) $('header-name').innerText = cleanName;
    if($('header-meta')) $('header-meta').innerText = `${messageOnlyCount.toLocaleString()} messages`;
    if($('sidebar-sub')) $('sidebar-sub').innerText = "Loaded successfully";
}

// UI Toggles
function openDrawer(id) { 
    const d = $(id+'-drawer');
    if(d) d.classList.add('open'); 
}
function closeDrawer(id) { 
    const d = $(id+'-drawer');
    if(d) d.classList.remove('open'); 
}
function toggleSidebar() { 
    const s = $('sidebar');
    if(s) s.classList.toggle('active'); 
}
function toggleTheme() { document.body.classList.toggle('light-theme'); }

function toggleSearch() { 
    const bar = $('search-toolbar');
    if(bar) {
        bar.classList.toggle('active'); 
        if(bar.classList.contains('active')) $('live-search').focus();
        else {
            $('live-search').value = "";
            searchResultsIDs = [];
            if($('search-counter')) $('search-counter').innerText = "";
            renderRange = { start: Math.max(0, globalMessages.length - BATCH_SIZE), end: globalMessages.length };
            renderChatList();
            scrollToBottom();
        }
    }
}

function showToast(msg) {
    const t = $('toast');
    if(t) {
        t.innerText = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);
    }
}

function copyUPI() {
    navigator.clipboard.writeText('paras2326@fam');
    showToast('UPI ID Copied!');
}

const pfpInput = $('pfp-upload');
if(pfpInput) {
    pfpInput.addEventListener('change', (e) => {
        if(e.target.files[0]) {
            const u = URL.createObjectURL(e.target.files[0]);
            if($('my-pfp-img')) $('my-pfp-img').src = u;
            if($('drawer-pfp-img')) $('drawer-pfp-img').src = u;
            const headerPfp = document.querySelector('.header-pfp');
            if(headerPfp) headerPfp.src = u;
        }
    });
}