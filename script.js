// Importações do Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- CONFIGURAÇÃO E INICIALIZAÇÃO DO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCkmtI3GPNiDkFyQ6Sm3_KfM-12SuYbU_M",
    authDomain: "todolist-teaser.firebaseapp.com",
    projectId: "todolist-teaser",
    storageBucket: "todolist-teaser.firebasestorage.app",
    messagingSenderId: "72112680265",
    appId: "1:72112680265:web:79700b6c5259298e2ebe98",
    measurementId: "G-F8L2MTFKP3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- COLEÇÕES DO FIRESTORE ---
const tasksCollection = collection(db, 'tasks');
const linksCollection = collection(db, 'links');

// --- ELEMENTOS DO DOM (TAREFAS) ---
const loadingOverlay = document.getElementById('loadingOverlay');
const taskModal = document.getElementById('taskModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');
const todoList = document.getElementById('todoList');
const completedList = document.getElementById('completedList');
const noTodoMsg = document.getElementById('noTodoMsg');
const noCompletedMsg = document.getElementById('noCompletedMsg');
const calendarEl = document.getElementById('calendar');
const weekRangeEl = document.getElementById('weekRange');
const prevWeekBtn = document.getElementById('prevWeekBtn');
const nextWeekBtn = document.getElementById('nextWeekBtn');
const activeFilterEl = document.getElementById('activeFilter');
const filterDateEl = document.getElementById('filterDate');
const clearFilterBtn = document.getElementById('clearFilterBtn');

// --- ELEMENTOS DO DOM (LINKS & VISUALIZAÇÃO) ---
const tasksView = document.getElementById('tasksView');
const linksView = document.getElementById('linksView');
const showTasksBtn = document.getElementById('showTasksBtn');
const showLinksBtn = document.getElementById('showLinksBtn');
const linkModal = document.getElementById('linkModal');
const openLinkModalBtn = document.getElementById('openLinkModalBtn');
const closeLinkModalBtn = document.getElementById('closeLinkModalBtn');
const linkForm = document.getElementById('linkForm');
const linkModalTitle = document.getElementById('linkModalTitle');
const linksList = document.getElementById('linksList');
const noLinksMsg = document.getElementById('noLinksMsg');
const searchInput = document.getElementById('searchInput');
const sortLinks = document.getElementById('sortLinks');
// +++ NOVOS ELEMENTOS DO MODAL DE GRUPO DE LINKS +++
const linkGroupTitle = document.getElementById('linkGroupTitle');
const urlFieldsContainer = document.getElementById('urlFieldsContainer');
const addUrlFieldBtn = document.getElementById('addUrlFieldBtn');


// --- ESTADO DA APLICAÇÃO ---
let allTasks = [];
let allLinks = [];
let currentDate = new Date();
let selectedDate = null;
let currentView = 'tasks';

// --- FUNÇÕES DE AUTENTICAÇÃO E INICIALIZAÇÃO ---
async function main() {
    try {
        await signInAnonymously(auth);
        
        onSnapshot(tasksCollection, (snapshot) => {
            allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (currentView === 'tasks') renderAll();
        });

        onSnapshot(linksCollection, (snapshot) => {
            allLinks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (currentView === 'links') renderLinks();
        });

        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            openModalBtn.disabled = false;
        }, 1500);

    } catch (error) {
        console.error("Erro na inicialização ou autenticação:", error);
        loadingOverlay.innerHTML = "<p>Ocorreu um erro ao conectar. Verifique as chaves do Firebase e recarregue a página.</p>";
    }
}
main();

// --- LÓGICA DE TROCA DE VISUALIZAÇÃO ---
const switchView = (view) => {
    currentView = view;
    if (view === 'tasks') {
        tasksView.classList.remove('hidden');
        linksView.classList.add('hidden');
        showTasksBtn.classList.add('active-view-btn');
        showLinksBtn.classList.remove('active-view-btn');
        renderAll();
    } else {
        tasksView.classList.add('hidden');
        linksView.classList.remove('hidden');
        showTasksBtn.classList.remove('active-view-btn');
        showLinksBtn.classList.add('active-view-btn');
        renderLinks();
    }
}

// --- FUNÇÕES DO MODAL (TAREFAS) ---
const openModal = () => {
    taskModal.classList.remove('hidden');
    setTimeout(() => {
        taskModal.querySelector('div').classList.remove('-translate-y-10', 'opacity-0');
    }, 10);
};

const closeModal = () => {
    taskModal.querySelector('div').classList.add('-translate-y-10', 'opacity-0');
    setTimeout(() => {
        taskModal.classList.add('hidden');
        taskForm.reset();
        document.getElementById('taskId').value = '';
        modalTitle.textContent = 'Nova Tarefa';
    }, 300);
};

// --- FUNÇÕES DO MODAL (GRUPO DE LINKS) ---

// +++ ATUALIZADO: Função para criar um novo campo de URL no modal +++
const createNewUrlField = (label = '', url = '') => {
    const urlEntryDiv = document.createElement('div');
    urlEntryDiv.className = 'url-entry flex items-center gap-2';
    
    urlEntryDiv.innerHTML = `
        <input type="text" class="link-label-input bg-gray-700 border border-gray-600 rounded w-1/3 py-2 px-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="Nome do Link" value="${label}" required>
        <input type="url" class="link-url-input bg-gray-700 border border-gray-600 rounded flex-grow py-2 px-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="https://..." value="${url}" required>
        <button type="button" class="remove-url-field-btn flex-shrink-0 h-8 w-8 bg-red-600 text-white rounded flex items-center justify-center hover:bg-red-700 text-sm">&times;</button>
    `;
    
    urlEntryDiv.querySelector('.remove-url-field-btn').addEventListener('click', () => {
        if (urlFieldsContainer.childElementCount > 1) {
            urlEntryDiv.remove();
        }
    });

    urlFieldsContainer.appendChild(urlEntryDiv);
};

const openLinkModal = () => {
    linkModal.classList.remove('hidden');
    setTimeout(() => {
        linkModal.querySelector('div').classList.remove('-translate-y-10', 'opacity-0');
    }, 10);
};

const closeLinkModal = () => {
    linkModal.querySelector('div').classList.add('-translate-y-10', 'opacity-0');
    setTimeout(() => {
        linkModal.classList.add('hidden');
        linkForm.reset();
        urlFieldsContainer.innerHTML = '';
        document.getElementById('linkId').value = '';
    }, 300);
};


// --- FUNÇÕES DE RENDERIZAÇÃO (TAREFAS) ---
// ... (Nenhuma alteração nesta seção, o código é o mesmo da versão anterior)
const renderAll = () => { renderCalendar(); renderTasks(); };
const renderCalendar = () => { /* ...código idêntico... */ calendarEl.innerHTML = ''; const weekStart = getWeekStart(currentDate); const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6); weekRangeEl.textContent = `${formatDate(weekStart, {day: 'numeric', month: 'short'})} - ${formatDate(weekEnd, {day: 'numeric', month: 'short', year: 'numeric'})}`; const dayHeaders = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']; dayHeaders.forEach(day => { const dayHeaderEl = document.createElement('div'); dayHeaderEl.className = 'font-bold text-gray-400 text-sm'; dayHeaderEl.textContent = day; calendarEl.appendChild(dayHeaderEl); }); for (let i = 0; i < 7; i++) { const day = new Date(weekStart); day.setDate(day.getDate() + i); const dayEl = document.createElement('button'); dayEl.className = 'calendar-day p-2 rounded-full transition-colors focus:outline-none'; dayEl.textContent = day.getDate(); const dayString = day.toISOString().split('T')[0]; dayEl.dataset.date = dayString; const isToday = isSameDay(day, new Date()); const isSelected = selectedDate === dayString; if (isSelected) { dayEl.classList.add('selected'); } else if (isToday && selectedDate === null) { dayEl.classList.add('bg-indigo-500', 'text-white', 'font-bold'); } const tasksOnDay = allTasks.filter(t => !t.isComplete && t.dueDate === dayString); if (tasksOnDay.length > 0) { const dot = document.createElement('div'); dot.className = 'w-1.5 h-1.5 bg-yellow-400 rounded-full mx-auto mt-1'; dayEl.appendChild(dot); } dayEl.addEventListener('click', () => { selectedDate = dayEl.dataset.date; activeFilterEl.classList.remove('hidden'); filterDateEl.textContent = formatDate(new Date(selectedDate), { weekday: 'long', day: 'numeric', month: 'long' }); renderAll(); }); calendarEl.appendChild(dayEl); }};
const renderTasks = () => { /* ...código idêntico... */ todoList.innerHTML = ''; completedList.innerHTML = ''; const todayString = new Date().toISOString().split('T')[0]; let todoTasks; let completedTasks; if (selectedDate) { todoTasks = allTasks.filter(task => !task.isComplete && task.dueDate === selectedDate); completedTasks = allTasks.filter(task => task.isComplete && task.dueDate === selectedDate); noTodoMsg.textContent = "Nenhuma tarefa pendente para esta data."; noCompletedMsg.textContent = "Nenhuma tarefa concluída para esta data."; } else { todoTasks = allTasks.filter(task => !task.isComplete); completedTasks = allTasks.filter(task => task.isComplete && task.dueDate >= todayString); noTodoMsg.textContent = "Nenhuma tarefa pendente."; noCompletedMsg.textContent = "Nenhuma tarefa concluída recentemente."; } todoTasks.sort((a, b) => { const priorities = { alta: 0, media: 1, baixa: 2 }; return priorities[a.priority] - priorities[b.priority]; }); if (todoTasks.length === 0) { todoList.appendChild(noTodoMsg); noTodoMsg.classList.remove('hidden'); } else { noTodoMsg.classList.add('hidden'); todoTasks.forEach(task => todoList.appendChild(createTaskElement(task))); } if (completedTasks.length === 0) { completedList.appendChild(noCompletedMsg); noCompletedMsg.classList.remove('hidden'); } else { noCompletedMsg.classList.add('hidden'); completedTasks.forEach(task => completedList.appendChild(createTaskElement(task))); }};
const createTaskElement = (task) => { /* ...código idêntico... */ const card = document.createElement('div'); card.className = `task-card bg-gray-800 p-4 rounded-lg shadow-md border-l-4 transition-all duration-300 priority-${task.priority}`; card.dataset.id = task.id; const formattedDate = formatDate(new Date(task.dueDate)); const categoryBadge = task.category ? `<span class="bg-gray-600 text-indigo-300 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">${task.category}</span>` : ''; card.innerHTML = ` <div class="flex justify-between items-start"> <div> <h3 class="font-bold text-lg text-white">${task.title}</h3> <p class="text-gray-400 text-sm mt-1">${task.description}</p> </div> <div class="flex-shrink-0 flex items-center space-x-2 ml-2"> ${!task.isComplete ? ` <button class="complete-btn text-green-400 hover:text-green-300" title="Concluir"><i class="fas fa-check-circle fa-lg"></i></button> <button class="edit-btn text-blue-400 hover:text-blue-300" title="Editar"><i class="fas fa-edit fa-lg"></i></button> ` : ` <button class="uncomplete-btn text-yellow-400 hover:text-yellow-300" title="Reabrir"><i class="fas fa-undo fa-lg"></i></button> `} <button class="delete-btn text-red-500 hover:text-red-400" title="Excluir"><i class="fas fa-trash-alt fa-lg"></i></button> </div> </div> <div class="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center"> <span class="text-xs text-gray-400"><i class="fas fa-calendar-alt mr-2"></i>${formattedDate}</span> ${categoryBadge} </div> `; card.querySelector('.delete-btn')?.addEventListener('click', () => deleteTask(task.id)); card.querySelector('.edit-btn')?.addEventListener('click', () => editTask(task.id)); card.querySelector('.complete-btn')?.addEventListener('click', () => toggleComplete(task.id, true)); card.querySelector('.uncomplete-btn')?.addEventListener('click', () => toggleComplete(task.id, false)); return card;};

// --- FUNÇÕES DE RENDERIZAÇÃO (GRUPOS DE LINKS) ---
const renderLinks = () => {
    linksList.innerHTML = '';
    const searchTerm = searchInput.value.toLowerCase();
    const sortOption = sortLinks.value;

    let filteredLinks = allLinks.filter(link => link.title.toLowerCase().includes(searchTerm));
    
    filteredLinks.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        switch (sortOption) {
            case 'name_asc': return titleA.localeCompare(titleB);
            case 'name_desc': return titleB.localeCompare(titleA);
            case 'date_asc': return timeA - timeB;
            case 'date_desc': return timeB - timeA;
            default: return 0;
        }
    });

    if (filteredLinks.length === 0) {
        linksList.appendChild(noLinksMsg);
        noLinksMsg.classList.remove('hidden');
    } else {
        noLinksMsg.classList.add('hidden');
        filteredLinks.forEach(linkGroup => linksList.appendChild(createLinkElement(linkGroup)));
    }
};

// +++ ATUALIZADO: Função para criar o CARD do GRUPO de links +++
const createLinkElement = (linkGroup) => {
    const card = document.createElement('div');
    card.className = 'link-card bg-gray-800 p-4 rounded-lg shadow-md transition-all duration-300';
    card.dataset.id = linkGroup.id;

    // Gera o HTML para a lista de links individuais
    const linksHtml = linkGroup.links.map(link => {
        let url = link.url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        return `
            <a href="${url}" target="_blank" rel="noopener noreferrer" class="flex items-center p-2 rounded-md hover:bg-gray-700 transition-colors">
                <i class="fas fa-link fa-xs text-gray-500 mr-3"></i>
                <span class="text-indigo-300 font-medium">${link.label}</span>
            </a>
        `;
    }).join('');

    card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <h3 class="font-bold text-xl text-white">${linkGroup.title}</h3>
            <div class="flex-shrink-0 flex items-center space-x-2 ml-4">
                <button class="edit-link-btn text-blue-400 hover:text-blue-300" title="Editar Grupo"><i class="fas fa-edit fa-lg"></i></button>
                <button class="delete-link-btn text-red-500 hover:text-red-400" title="Excluir Grupo"><i class="fas fa-trash-alt fa-lg"></i></button>
            </div>
        </div>
        <div class="space-y-1 border-t border-gray-700 pt-3">
            ${linksHtml}
        </div>
    `;

    card.querySelector('.edit-link-btn').addEventListener('click', () => editLink(linkGroup.id));
    card.querySelector('.delete-link-btn').addEventListener('click', () => deleteLink(linkGroup.id));

    return card;
};

// --- FUNÇÕES DE MANIPULAÇÃO DE DADOS (TAREFAS) ---
// ... (Nenhuma alteração nesta seção, o código é o mesmo da versão anterior)
async function handleFormSubmit(e) { /* ...código idêntico... */ e.preventDefault(); const id = document.getElementById('taskId').value; const taskData = { title: document.getElementById('title').value.trim(), description: document.getElementById('description').value.trim(), dueDate: document.getElementById('dueDate').value, priority: document.getElementById('priority').value, category: document.getElementById('category').value.trim(), updatedAt: serverTimestamp() }; if (!taskData.title || !taskData.dueDate) { alert('Título e Data de Vencimento são obrigatórios.'); return; } try { if (id) { await updateDoc(doc(db, "tasks", id), taskData); } else { await addDoc(tasksCollection, { ...taskData, isComplete: false, createdAt: serverTimestamp() }); } closeModal(); } catch (error) { console.error("Erro ao salvar tarefa:", error); alert("Não foi possível salvar a tarefa. Tente novamente."); } };
async function editTask(id) { /* ...código idêntico... */ const task = allTasks.find(task => task.id == id); if (task) { modalTitle.textContent = 'Editar Tarefa'; document.getElementById('taskId').value = task.id; document.getElementById('title').value = task.title; document.getElementById('description').value = task.description; document.getElementById('dueDate').value = task.dueDate; document.getElementById('priority').value = task.priority; document.getElementById('category').value = task.category; openModal(); } };
async function deleteTask(id) { /* ...código idêntico... */ if (confirm('Tem certeza que deseja excluir esta tarefa permanentemente?')) { try { await deleteDoc(doc(db, "tasks", id)); } catch (error) { console.error("Erro ao excluir tarefa:", error); alert("Não foi possível excluir a tarefa."); } } };
async function toggleComplete(id, status) { /* ...código idêntico... */ try { await updateDoc(doc(db, "tasks", id), { isComplete: status }); } catch (error) { console.error("Erro ao atualizar tarefa:", error); alert("Não foi possível atualizar o status da tarefa."); } };


// --- FUNÇÕES DE MANIPULAÇÃO DE DADOS (GRUPOS DE LINKS) ---
// +++ ATUALIZADO: Salva o grupo de links com seu array de URLs +++
async function handleLinkFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('linkId').value;
    const title = linkGroupTitle.value.trim();

    if (!title) {
        alert('O Título do Grupo é obrigatório.');
        return;
    }

    const urlEntries = urlFieldsContainer.querySelectorAll('.url-entry');
    const linksArray = [];
    for (const entry of urlEntries) {
        const label = entry.querySelector('.link-label-input').value.trim();
        const url = entry.querySelector('.link-url-input').value.trim();
        if (label && url) {
            linksArray.push({ label, url });
        }
    }

    if (linksArray.length === 0) {
        alert('Adicione pelo menos um link válido (com nome e URL).');
        return;
    }

    const linkGroupData = {
        title,
        links: linksArray
    };

    try {
        if (id) { // Editando um grupo existente
            await updateDoc(doc(db, "links", id), linkGroupData);
        } else { // Criando um novo grupo
            linkGroupData.createdAt = serverTimestamp();
            await addDoc(linksCollection, linkGroupData);
        }
        closeLinkModal();
    } catch (error) {
        console.error("Erro ao salvar grupo de links:", error);
        alert("Não foi possível salvar o grupo de links.");
    }
}

// +++ ATUALIZADO: Edita o grupo de links, populando o modal +++
async function editLink(id) {
    const linkGroup = allLinks.find(lg => lg.id == id);
    if (linkGroup) {
        linkModalTitle.textContent = 'Editar Grupo de Links';
        document.getElementById('linkId').value = linkGroup.id;
        linkGroupTitle.value = linkGroup.title;

        urlFieldsContainer.innerHTML = ''; // Limpa campos existentes
        linkGroup.links.forEach(link => {
            createNewUrlField(link.label, link.url);
        });
        
        openLinkModal();
    }
}

async function deleteLink(id) {
    if (confirm('Tem certeza que deseja excluir este grupo de links permanentemente?')) {
        try {
            await deleteDoc(doc(db, "links", id));
        } catch (error) {
            console.error("Erro ao excluir grupo:", error);
            alert("Não foi possível excluir o grupo.");
        }
    }
}


// --- FUNÇÕES UTILITÁRIAS DE DATA ---
// ... (Nenhuma alteração nesta seção)
const getWeekStart = (date) => { const d = new Date(date); const day = d.getDay(); const diff = d.getDate() - day; return new Date(d.setDate(diff)); };
const isSameDay = (d1, d2) => d1.getUTCFullYear() === d2.getUTCFullYear() && d1.getUTCMonth() === d2.getUTCMonth() && d1.getUTCDate() === d2.getUTCDate();
const formatDate = (date, options = { year: 'numeric', month: 'long', day: 'numeric' }) => new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC', ...options });

// --- EVENT LISTENERS GLOBAIS ---
showTasksBtn.addEventListener('click', () => switchView('tasks'));
showLinksBtn.addEventListener('click', () => switchView('links'));

// Modal de Tarefas
openModalBtn.addEventListener('click', () => { taskForm.reset(); document.getElementById('taskId').value = ''; modalTitle.textContent = 'Nova Tarefa'; document.getElementById('dueDate').value = selectedDate || new Date().toISOString().split('T')[0]; openModal(); });
closeModalBtn.addEventListener('click', closeModal);
taskForm.addEventListener('submit', handleFormSubmit);
taskModal.addEventListener('click', (e) => { if (e.target === taskModal) closeModal(); });

// Modal de Grupos de Links
openLinkModalBtn.addEventListener('click', () => {
    linkModalTitle.textContent = 'Novo Grupo de Links';
    urlFieldsContainer.innerHTML = ''; // Limpa campos
    createNewUrlField(); // Adiciona o primeiro campo em branco
    openLinkModal();
});
closeLinkModalBtn.addEventListener('click', closeLinkModal);
linkForm.addEventListener('submit', handleLinkFormSubmit); 
linkModal.addEventListener('click', (e) => { if (e.target === linkModal) closeLinkModal(); });

// Botão para adicionar mais campos de URL
addUrlFieldBtn.addEventListener('click', () => createNewUrlField());

// Calendário e Filtros de Tarefas
prevWeekBtn.addEventListener('click', () => { currentDate.setDate(currentDate.getDate() - 7); renderCalendar(); });
nextWeekBtn.addEventListener('click', () => { currentDate.setDate(currentDate.getDate() + 7); renderCalendar(); });
clearFilterBtn.addEventListener('click', () => { selectedDate = null; activeFilterEl.classList.add('hidden'); renderAll(); });

// Filtros de Links
searchInput.addEventListener('input', renderLinks);
sortLinks.addEventListener('change', renderLinks);