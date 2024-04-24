// Elementos
const notesContainer = document.querySelector('#notes-container');
const noteInput = document.querySelector('#note-content');
const addNoteBtn = document.querySelector('.add-note');
const searchInput = document.querySelector('#search-input');
const exportBtn = document.querySelector('#export-notes');

// Funções
function showNotes() {
    // Limpa e ordena as notas com as fixadas primeiro
    cleanNotes();

    getNotes().forEach((note) => {
        const noteElement = createNote(note.id, note.content, note.fixed);
        notesContainer.appendChild(noteElement);
    });
};

function cleanNotes() {
    // Excluindo todas as notas da área de exibição
    notesContainer.replaceChildren([])
}

function addNote() {
    // Criando um array vazio para salvar o conteúdo na localStorage
    const notes = getNotes();


    const noteObject = {
        id: generateId(),
        content: noteInput.value,
        fixed: false,
    };
    const noteElement = createNote(noteObject.id, noteObject.content);
    notesContainer.appendChild(noteElement);

    notes.push(noteObject);

    saveNotes(notes);

    noteInput.value = '';
};

function generateId() {
    return Math.floor(Math.random() * 5000);
}

function createNote(id, content, fixed) {
    const element = document.createElement('div');
    element.classList.add('note');

    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.placeholder = 'Adicione algum texto...';
    element.appendChild(textarea);

    const pinIcon = document.createElement('i');
    pinIcon.classList.add(...['bi', 'bi-pin']);
    element.appendChild(pinIcon);

    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add(...['bi', 'bi-x-lg']);
    element.appendChild(deleteIcon);

    const duplicateIcon = document.createElement('i');
    duplicateIcon.classList.add(...['bi', 'bi-file-earmark-plus']);
    element.appendChild(duplicateIcon);

    if(fixed === true) {
        element.classList.add('fixed');
    }

    // Eventos do elemento

    // Evento que edita o conteúdo na textarea
    // O keyup permite saber o que o usuário digitou por último, logo quando solta a tecla
    element.querySelector('textarea').addEventListener('keyup', (e) => {
        // Pegando o valor atual do conteúdo
        const noteContent = e.target.value;

        updateNote(id, noteContent);
    });

    element.querySelector('.bi-pin').addEventListener('click', () => {
        toggleFixNote(id);
    });

    element.querySelector('.bi-x-lg').addEventListener('click', () => {
        deleteNote(id, element);
    })

    element.querySelector('.bi-file-earmark-plus').addEventListener('click', () => {
        copyNote(id);
    })

    return element;
}

function deleteNote(id, element) {
    // Pegando as notas da localStorage
    let notes = getNotes();

    // Filtrar as notas para remover a nota escolhida com id igual, ou seja, o filter vai deixar todas as notas diferentes do id escolhido
    notes = notes.filter((note) => note.id !== id);

    // Salvando na localStorage
    saveNotes(notes)

    // Remover a nota do DOM
    notesContainer.removeChild(element);


}

function copyNote(id) {
    // Achar a nota escolhida
    // Criar um novo objeto baseado em seus dados com id diderente(mesmo sendo uma cópia)

    // Pegar todas as notas do localStorage
    const notes = getNotes();

    // Filtrando o elemento com o id igual ao escolhido e pego o primeiro elemento[0] que retornou
    const targetNote = notes.filter((note) => note.id === id)[0];

    // Criando um novo objeto com um novo id, o mesmo conteudo e iniciando como nota não fixa
    const noteObject = {
        id: generateId(),
        content: targetNote.content,
        fixed: false,
    };

    // Criando o elemento
    const noteElement = createNote(noteObject.id, noteObject.content, noteObject.fixed);

    // Adicionando o elemento na DOM
    notesContainer.appendChild(noteElement);

    // Adicionando no local storage
    notes.push(noteObject) //Adicionando no array

    // Salvando no local storage
    saveNotes(notes);
}

function toggleFixNote(id) {
    const notes = getNotes();

    // Filtrar a lista para achar a nota alvo
    const targetNote = notes.filter((note) => note.id === id)[0];

    targetNote.fixed = !targetNote.fixed;

    saveNotes(notes);

    // Limpa e ordena as notas com as fixadas primeiro
    showNotes();
}

function updateNote(id, newContent) {
    // Pegando as notas na localStorage
    const notes = getNotes();

    // Pegando a nota-alvo
    const targetNote = notes.filter((note) => note.id === id)[0];

    // Atualizando o array de notas com o novo conteúdo
    targetNote.content = newContent;

    // Salvando as alterações feitas no local storage
    saveNotes(notes);
}

// Local Storage
function getNotes() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');

    // a, b = é um item e outro item
    // Fazendo a comparação se o fixed de a > b
    const orderedNotes = notes.sort((a, b) => (a.fixed > b.fixed ? -1 : 1));

    return orderedNotes;
}

function saveNotes(notes) {
    localStorage.setItem('notes', JSON.stringify(notes))
};

function searchNotes(search) {
    // Pegando as notas no local storage e filtrando
    // const searchResults = getNotes().filter((note) => {
    //     return note.content.includes(search);
    // });
    // Em uma linha 
    const searchResults = getNotes().filter((note) => note.content.includes(search));

    // Validando se o search não tá vazio 
    if(search !== '') {
        // Limpar as notas
        cleanNotes();

        // Exibir as encontradas
        searchResults.forEach((note) => {
            const noteElement = createNote(note.id, note.content);
            notesContainer.appendChild(noteElement);
        });
        return;
    };

    cleanNotes();

    showNotes();
};

function exportData() {
    // Pegar as notas
    const notes = getNotes();

    // Criar padrão de csv
    // Separa o dado por vígula
    // Quebra linha com \n

    const csvString = [
        ['ID', 'Conteúdo', 'Fixado?'],
        ...notes.map((note) => [note.id, note.content, note.fixed]),
    ].map((note) => note.join(',')).join('\n');

    console.log(csvString);
    // Download
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
    link.target = '_blank';
    link.download = 'notes.csv';
    link.click();
}

// Eventos
noteInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && noteInput.value !== '') addNote();
});

searchInput.addEventListener('keyup', (e) => {

    // Pegando o valor
    const search = e.target.value;

    searchNotes(search);
})

addNoteBtn.addEventListener('click', () => addNote());

exportBtn.addEventListener('click', () => {
    exportData();
})

// Inicialização
showNotes();