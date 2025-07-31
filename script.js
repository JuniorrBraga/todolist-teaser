// Importações do Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- CONFIGURAÇÃO E INICIALIZAÇÃO DO FIREBASE ---

// Suas chaves do Firebase foram adicionadas aqui.
const firebaseConfig = {
  apiKey: "AIzaSyCkmtI3GPNiDkFyQ6Sm3_KfM-12SuYbU_M",
  authDomain: "todolist-teaser.firebaseapp.com",
  projectId: "todolist-teaser",
  storageBucket: "todolist-teaser.firebasestorage.app",
  messagingSenderId: "72112680265",
  appId: "1:72112680265:web:79700b6c5259298e2ebe98",
  measurementId: "G-F8L2MTFKP3"
};

// Inicializa o Firebase com suas chaves
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// A coleção agora usa o seu projectId para criar um caminho único para os dados.
const tasksCollection = collection(db, `tasks`);

// --- ELEMENTOS DO DOM ---
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

// --- ESTADO DA APLICAÇÃO ---
let allTasks = []; // Armazena todas as tarefas do Firestore
let currentDate = new Date();
let selectedDate = null;

// --- FUNÇÕES DE AUTENTICAÇÃO E INICIALIZAÇÃO ---
async function main() {
    try {
        await signInAnonymously(auth);
        
        // Escuta por mudanças em tempo real na coleção de tarefas
        onSnapshot(tasksCollection, (snapshot) => {
            allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Adiciona tarefa de exemplo se a coleção estiver vazia
            if (allTasks.length === 0) {
                addExampleTask();
            }
            
            renderAll();
            loadingOverlay.style.display = 'none';
            openModalBtn.disabled = false;
        });

    } catch (error) {
        console.error("Erro na inicialização ou autenticação:", error);
        loadingOverlay.innerHTML = "<p>Ocorreu um erro ao conectar. Verifique as chaves do Firebase e recarregue a página.</p>";
    }
}

main();

// --- FUNÇÕES DO MODAL ---
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

// --- FUNÇÕES DE RENDERIZAÇÃO ---
const renderAll = () => {
    renderCalendar();
    renderTasks();
}

const renderCalendar = () => {
    calendarEl.innerHTML = '';
    const weekStart = getWeekStart(currentDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    weekRangeEl.textContent = `${formatDate(weekStart, {day: 'numeric', month: 'short'})} - ${formatDate(weekEnd, {day: 'numeric', month: 'short', year: 'numeric'})}`;

    const dayHeaders = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    dayHeaders.forEach(day => {
        const dayHeaderEl = document.createElement('div');
        dayHeaderEl.className = 'font-bold text-gray-400 text-sm';
        dayHeaderEl.textContent = day;
        calendarEl.appendChild(dayHeaderEl);
    });

    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + i);
        
        const dayEl = document.createElement('button');
        dayEl.className = 'calendar-day p-2 rounded-full transition-colors focus:outline-none';
        dayEl.textContent = day.getDate();
        const dayString = day.toISOString().split('T')[0];
        dayEl.dataset.date = dayString;

        if (isSameDay(day, new Date())) {
            dayEl.classList.add('bg-indigo-500', 'text-white', 'font-bold');
        }
        
        if (selectedDate && dayString === selectedDate) {
            dayEl.classList.add('selected');
        }

        const tasksOnDay = allTasks.filter(t => !t.isComplete && t.dueDate === dayString);
        if (tasksOnDay.length > 0) {
            const dot = document.createElement('div');
            dot.className = 'w-1.5 h-1.5 bg-yellow-400 rounded-full mx-auto mt-1';
            dayEl.appendChild(dot);
        }

        dayEl.addEventListener('click', () => {
            selectedDate = dayEl.dataset.date;
            activeFilterEl.classList.remove('hidden');
            filterDateEl.textContent = formatDate(new Date(selectedDate), { weekday: 'long', day: 'numeric', month: 'long' });
            renderAll();
        });
        calendarEl.appendChild(dayEl);
    }
};

const renderTasks = () => {
    todoList.innerHTML = '';
    completedList.innerHTML = '';

    let filteredTasks = allTasks;
    if (selectedDate) {
        filteredTasks = allTasks.filter(task => task.dueDate === selectedDate);
    }

    const todoTasks = filteredTasks.filter(task => !task.isComplete);
    const completedTasks = filteredTasks.filter(task => task.isComplete);
    
    todoTasks.sort((a, b) => {
        const priorities = { alta: 0, media: 1, baixa: 2 };
        return priorities[a.priority] - priorities[b.priority];
    });

    if (todoTasks.length === 0) {
        todoList.appendChild(noTodoMsg);
        noTodoMsg.classList.remove('hidden');
    } else {
        noTodoMsg.classList.add('hidden');
        todoTasks.forEach(task => todoList.appendChild(createTaskElement(task)));
    }

    if (completedTasks.length === 0) {
        completedList.appendChild(noCompletedMsg);
        noCompletedMsg.classList.remove('hidden');
    } else {
        noCompletedMsg.classList.add('hidden');
        completedTasks.forEach(task => completedList.appendChild(createTaskElement(task)));
    }
};

const createTaskElement = (task) => {
    const card = document.createElement('div');
    card.className = `task-card bg-gray-800 p-4 rounded-lg shadow-md border-l-4 transition-all duration-300 priority-${task.priority}`;
    card.dataset.id = task.id;

    const formattedDate = formatDate(new Date(task.dueDate));
    const categoryBadge = task.category ? `<span class="bg-gray-600 text-indigo-300 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">${task.category}</span>` : '';

    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <h3 class="font-bold text-lg text-white">${task.title}</h3>
                <p class="text-gray-400 text-sm mt-1">${task.description}</p>
            </div>
            <div class="flex-shrink-0 flex items-center space-x-2 ml-2">
                ${!task.isComplete ? `
                <button class="complete-btn text-green-400 hover:text-green-300" title="Concluir"><i class="fas fa-check-circle fa-lg"></i></button>
                <button class="edit-btn text-blue-400 hover:text-blue-300" title="Editar"><i class="fas fa-edit fa-lg"></i></button>
                ` : `
                <button class="uncomplete-btn text-yellow-400 hover:text-yellow-300" title="Reabrir"><i class="fas fa-undo fa-lg"></i></button>
                `}
                <button class="delete-btn text-red-500 hover:text-red-400" title="Excluir"><i class="fas fa-trash-alt fa-lg"></i></button>
            </div>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
            <span class="text-xs text-gray-400"><i class="fas fa-calendar-alt mr-2"></i>${formattedDate}</span>
            ${categoryBadge}
        </div>
    `;

    card.querySelector('.delete-btn')?.addEventListener('click', () => deleteTask(task.id));
    card.querySelector('.edit-btn')?.addEventListener('click', () => editTask(task.id));
    card.querySelector('.complete-btn')?.addEventListener('click', () => toggleComplete(task.id, true));
    card.querySelector('.uncomplete-btn')?.addEventListener('click', () => toggleComplete(task.id, false));

    return card;
};

// --- FUNÇÕES DE MANIPULAÇÃO DE DADOS (CRUD com Firestore) ---
async function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('taskId').value;
    const taskData = {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        dueDate: document.getElementById('dueDate').value,
        priority: document.getElementById('priority').value,
        category: document.getElementById('category').value.trim(),
        updatedAt: serverTimestamp()
    };

    if (!taskData.title || !taskData.dueDate) {
        alert('Título e Data de Vencimento são obrigatórios.');
        return;
    }

    try {
        if (id) {
            const taskRef = doc(db, "tasks", id);
            await updateDoc(taskRef, taskData);
        } else {
            await addDoc(tasksCollection, {
                ...taskData,
                isComplete: false,
                createdAt: serverTimestamp()
            });
        }
        closeModal();
    } catch (error) {
        console.error("Erro ao salvar tarefa:", error);
        alert("Não foi possível salvar a tarefa. Tente novamente.");
    }
};

async function editTask(id) {
    const task = allTasks.find(task => task.id == id);
    if (task) {
        modalTitle.textContent = 'Editar Tarefa';
        document.getElementById('taskId').value = task.id;
        document.getElementById('title').value = task.title;
        document.getElementById('description').value = task.description;
        document.getElementById('dueDate').value = task.dueDate;
        document.getElementById('priority').value = task.priority;
        document.getElementById('category').value = task.category;
        openModal();
    }
};

async function deleteTask(id) {
    if (confirm('Tem certeza que deseja excluir esta tarefa permanentemente?')) {
        try {
            await deleteDoc(doc(db, "tasks", id));
        } catch (error) {
            console.error("Erro ao excluir tarefa:", error);
            alert("Não foi possível excluir a tarefa.");
        }
    }
};

async function toggleComplete(id, status) {
    try {
        const taskRef = doc(db, "tasks", id);
        await updateDoc(taskRef, { isComplete: status });
    } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
        alert("Não foi possível atualizar o status da tarefa.");
    }
};

async function addExampleTask() {
    try {
        await addDoc(tasksCollection, {
            title: "Estudar conversação",
            description: "Praticar por 25 minutos, como planejado.",
            dueDate: new Date().toISOString().split('T')[0],
            priority: "alta",
            category: "Estudos",
            isComplete: false,
            createdAt: serverTimestamp()
        });
    } catch(error) {
        console.error("Erro ao adicionar tarefa de exemplo: ", error);
    }
}

// --- FUNÇÕES UTILITÁRIAS DE DATA ---
const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
};

const isSameDay = (date1, date2) => {
    return date1.getUTCFullYear() === date2.getUTCFullYear() &&
           date1.getUTCMonth() === date2.getUTCMonth() &&
           date1.getUTCDate() === date2.getUTCDate();
};

const formatDate = (date, options = { year: 'numeric', month: 'long', day: 'numeric' }) => {
    return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC', ...options });
};

// --- EVENT LISTENERS GLOBAIS ---
openModalBtn.addEventListener('click', () => {
    taskForm.reset();
    document.getElementById('taskId').value = '';
    modalTitle.textContent = 'Nova Tarefa';
    document.getElementById('dueDate').value = selectedDate || new Date().toISOString().split('T')[0];
    openModal();
});
closeModalBtn.addEventListener('click', closeModal);
taskForm.addEventListener('submit', handleFormSubmit);

prevWeekBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 7);
    renderCalendar();
});

nextWeekBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 7);
    renderCalendar();
});

clearFilterBtn.addEventListener('click', () => {
    selectedDate = null;
    activeFilterEl.classList.add('hidden');
    renderAll();
});

taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) closeModal();
});
