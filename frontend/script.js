
const API_URL = "http://localhost/my_cinema/backend/index.php";

let allMovies = []; // POUR GARDER LES FILMS EN MEMOIRE
let currentMoviePage = 1;
let showArchives = false;


function loadMovies(page =1) {
    const listContainer = document.getElementById('movie-list');
    // FETCH PERMET D'ENVOYER DES REQUETTES HTTP ASYNCHRONE VERS LE SERVEUR
    fetch(`${API_URL}?action=list_movies_pagination&page=${page}`)
        .then(res => res.json())
        .then(data => {
            if (data.success){
                const movies = data.movies;
            allMovies = movies; // ON STOCKE LA LISTE REÇUE
            listContainer.innerHTML = "";

            if (movies.length === 0) {
                listContainer.innerHTML = "<p class='text-slate-400'>Aucun film à l'affiche.</p>";
                return;
            }

            movies.forEach(movie => {
                listContainer.innerHTML += `
            <div class="flex flex-col md:flex-row md:items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors gap-4">

                <div class="flex-1">
                    <div class="flex flex-col items-start gap-3 mb-1 ">
                        <h3 class="font-bold text-sm md:text-2xl text-slate-900">${movie.title}</h3>
                        <span class="text-sm md:text-base bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded">
                        ${movie.genre}
                        </span>
                    </div>

                    <div class="text-sm md:text-base font-medium text-slate-700 mb-1">
                        Réalisé par : <span class="text-slate-900">${movie.director || 'Inconnu'}</span>
                    </div>
            
                    <div class="flex items-center text-sm text-slate-500 mb-2">
                        <span>${movie.release_year}</span>
                        <span class="mx-2">•</span>
                        <span>${movie.duration || '120'} min</span>
                    </div>

                    <p class="hidden md:block text-sm text-slate-600 leading-relaxed mt-2 border-l-2 border-slate-300 pl-3">
                        ${movie.description || 'Aucune description disponible pour ce film.'}
                    </p>
                </div>

                <div class="flex flex-col items-center gap-4 justify-end border-t md:border-t-0 pt-3 md:pt-0">
                    <button type="button" onclick="prepareEdit(${movie.id})" class="text-blue-600 font-bold">
                        Modifier
                    </button>
                    <button onclick="deleteMovie(${movie.id})" class="text-red-500 hover:text-red-700 font-bold">
                        Supprimer
                    </button>
                </div>
            </div>
                `;
            });

            visuelPagination(data.totalPages, data.currentPage);}
        })
        .catch(err => {
            console.error("Erreur API:", err);
            listContainer.innerHTML = "<p class='text-red-500'>Erreur lors de la récupération des films.</p>";
        });
}

function visuelPagination(totalPages, currentPage){
    const containerPagination = document.getElementById('pagination');
    if(!containerPagination) return;

    containerPagination.innerHTML = "";
    if(totalPages <= 1) return;

    const previousBtn = document.createElement('button');
    previousBtn.innerHTML = "« Précédent";
    previousBtn.className = `px-4 py-2 rounded font-bold ${currentPage === 1 ? 'bg-slate-300 text-slate-500' : 'bg-slate-800 text-white'}`;
    previousBtn.disabled = (currentPage === 1);
    previousBtn.onclick = () => loadMovies(currentPage -1);

    // Infos de page
    const pageInfo = document.createElement('span');
    pageInfo.innerHTML = `Page <strong>${currentPage}</strong> sur <strong>${totalPages}</strong>`;
    pageInfo.className = "text-slate-700 self-center";

    // Bouton Suivant
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = "Suivant »";
    nextBtn.className = `px-4 py-2 rounded font-bold ${currentPage === totalPages ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-700'}`;
    nextBtn.disabled = (currentPage === totalPages);
    nextBtn.onclick = () => loadMovies(currentPage + 1);

    // On assemble tout dans le container
    containerPagination.appendChild(previousBtn);
    containerPagination.appendChild(pageInfo);
    containerPagination.appendChild(nextBtn);
}

function deleteMovie(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce film ?")) {
        fetch(`${API_URL}?action=delete_movie&id=${id}`)
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    loadMovies(); // On recharge la liste pour voir le changement
                } else {
                    alert("Erreur lors de la suppression.");
                }
            });
    }
}

function toggleForm() {
    const form = document.getElementById('add-movie-form');
    form.classList.toggle('hidden');
}

async function saveMovie(event) {
    event.preventDefault(); // Empêche la page de se recharger

    const id = document.getElementById('movieId').value;
    console.log("ID détecté avant envoi :", id);
    
    const movieData = {
        title: document.getElementById('title').value,
        director: document.getElementById('director').value,
        genre: document.getElementById('genre').value,
        release_year: document.getElementById('release_year').value,
        duration: document.getElementById('duration').value,
        description: document.getElementById('description').value
    };

    // Choix de l'action selon la présence d'un ID
    let action = "add_movie";
    if (id) {
        action = "update_movie";
        movieData.id = id; 
    }
    
    console.log("Action choisie :", action);

    try {
        const response = await fetch(`${API_URL}?action=${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movieData)
        });

        const result = await response.json();

        if (result.success) {
            alert(id ? "Film mis à jour !" : "Film ajouté !");
            resetForm(); // Vide le formulaire et l'ID caché
            loadMovies(); // Recharge la liste
            toggleForm(); // Ferme le formulaire dans tous les cas
        } else {
            alert("Erreur : " + (result.error || "Action échouée"));
        }
    } catch (error) {
        console.error("Erreur lors de l'envoi:", error);
        alert("Une erreur critique est survenue.");
    }
}

// --- GESTION DES SALLES ---

function toggleArchiveView() {
    showArchives = !showArchives;
    const btn = document.getElementById('btn-archive');
    btn.innerText = showArchives ? "Masquer les archives" : "Voir les salles supprimées";
    loadRooms();
}

function loadRooms() {
    const container = document.getElementById('room-list');
    if (!container) return; // Sécurité si on n'est pas sur la page salle

    fetch(`${API_URL}?action=list_rooms`)
        .then(res => res.json())
        .then(rooms => {
            container.innerHTML = "";
            
            // On filtre les salles à afficher
            // Si showArchives est faux, on ne garde que les active == 1
            const roomsToDisplay = rooms.filter(room => showArchives ? true : room.active == 1);

            if (roomsToDisplay.length === 0) {
                container.innerHTML = `<p class='text-slate-500 italic'>${showArchives ? "Aucune archive." : "Aucune salle active."}</p>`;
                return;
            }

            roomsToDisplay.forEach(room => {
                const isDeleted = room.active == 0;
                
                container.innerHTML += `
                <div class="flex items-center justify-between p-4 border rounded-lg shadow-sm mb-3 transition-all ${isDeleted ? 'bg-gray-200 opacity-75 border-gray-300' : 'bg-slate-50 border-slate-200'}">
                    <div>
                        <div class="flex items-center gap-2">
                            <h3 class="font-bold text-base md:text-xl ${isDeleted ? 'text-slate-500' : 'text-slate-900'}">${room.name}</h3>
                            ${isDeleted ? '<span class="text-[10px] bg-gray-400 text-white px-1.5 rounded uppercase">Archivée</span>' : ''}
                        </div>
                        <p class="md:text-base text-sm text-slate-500">
                            <span class="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs md:text-sm font-bold mr-2 uppercase">${room.type}</span>
                            ${room.capacity} places
                        </p>
                    </div>
                    <div class="flex gap-4">
                        ${isDeleted 
                            ? `<button onclick="restoreRoom(${room.id})" class="text-green-600 hover:text-green-800 font-bold text-sm">Réactiver</button>`
                            : `<button onclick="deleteRoom(${room.id})" class="text-red-500 hover:text-red-700 font-bold text-sm">Désactiver</button>`
                        }
                    </div>
                </div>
                `;
            });
        });
}

function saveRoom(event) {
    event.preventDefault();

    const roomData = {
        name: document.getElementById('room_name').value,
        capacity: document.getElementById('room_capacity').value,
        type: document.getElementById('room_type').value
    };

    fetch(`${API_URL}?action=add_room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            toggleRoomForm();
            loadRooms();
            event.target.reset();
        } else {
            alert("Erreur lors de l'ajout : " + (result.error || "Inconnu"));
        }
    });
}

function restoreRoom(id) {
    if (confirm("Voulez-vous réactiver cette salle ?")) {
        fetch(`${API_URL}?action=restore_room&id=${id}`)
            .then(res => res.json())
            .then(result => {
                if (result.success) loadRooms();
            });
    }
}

function deleteRoom(id) {
    if (confirm("Voulez-vous vraiment désactiver cette salle ?")) {
        fetch(`${API_URL}?action=delete_room&id=${id}`)
            .then(res => res.json())
            .then(result => {
                if (result.success) loadRooms();
            });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Si l'élément movie-list existe, on charge les films
    if (document.getElementById('movie-list')) {
        loadMovies();
    }
    // Si l'élément room-list existe, on charge les salles
    if (document.getElementById('room-list')) {
        loadRooms();
    }
});

function toggleRoomForm() {
    console.log("Clic sur le bouton salle !"); // Pour vérifier dans la console
    const form = document.getElementById('add-room-form');
    if (form) {
        form.classList.toggle('hidden');
    } else {
        console.error("Le formulaire 'add-room-form' n'existe pas dans le HTML");
    }
}


function toggleScreeningForm() {
    const form = document.getElementById('add-screening-form');
    if(form) {
        form.classList.toggle('hidden');
        if (!form.classList.contains('hidden')) {
            fillSelects(); // On remplit les listes quand on ouvre le formulaire
        }
    }
}

function fillSelects() {
    // Remplir les films
    fetch(`${API_URL}?action=list_movies`)
        .then(res => res.json())
        .then(movies => {
            const movieSelect = document.getElementById('movie_id');
            movieSelect.innerHTML = '<option value="">-- Sélectionner un film --</option>';
            movies.forEach(m => {
                movieSelect.innerHTML += `<option value="${m.id}">${m.title}</option>`;
            });
        });

    // Remplir les salles
    fetch(`${API_URL}?action=list_rooms`)
        .then(res => res.json())
        .then(rooms => {
            const roomSelect = document.getElementById('room_id');
            roomSelect.innerHTML = '<option value="">-- Sélectionner une salle --</option>';
            rooms.forEach(r => {
                roomSelect.innerHTML += `<option value="${r.id}">${r.name} (${r.capacity} places)</option>`;
            });
        });
}

function loadScreenings() {
    const container = document.getElementById('screening-list');
    if (!container) return;

    fetch(`${API_URL}?action=list_screenings`)
        .then(res => res.json())
        .then(screenings => {
            container.innerHTML = "";
            screenings.forEach(s => {
                // On formate la date pour qu'elle soit lisible
                const dateObj = new Date(s.start_time);
                const formattedDate = dateObj.toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                });

                container.innerHTML += `
                <div class="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                    <div class="flex flex-col">
                        <span class="text-xs font-bold uppercase text-indigo-500">${s.room_name}</span>
                        <h3 class="font-bold text-slate-900 text-lg">${s.movie_title}</h3>
                        <p class="text-sm text-slate-600 italic">${formattedDate}</p>
                    </div>
                    <button onclick="deleteScreening(${s.id})" class="text-red-400 hover:text-red-600">
                        Supprimer
                    </button>
        <button onclick="prepareEditScreening(${s.id})" class="text-blue-600 font-bold text-sm">Modifier</button>

                </div>
                `;

                
            });
        });
}

async function prepareEditScreening(id) {
    const form = document.getElementById('add-screening-form');
    form.classList.remove('hidden'); // On affiche le formulaire

    fetch(`${API_URL}?action=get_screening&id=${id}`)
        .then(res => res.json())
        .then(s => {
            document.getElementById('screening_id').value = s.id;
            document.getElementById('movie_id').value = s.movie_id;
            document.getElementById('room_id').value = s.room_id;
            
            // Formatage de la date pour l'input datetime-local
            if (s.start_time) {
                const date = new Date(s.start_time);
                const formattedDate = date.toISOString().slice(0, 16);
                document.getElementById('start_time').value = formattedDate;
            }

            // On change le titre visuel pour que le gérant sache qu'il modifie
            document.getElementById('screeningSubmitBtn').innerText = "Mettre à jour la séance";
            
            const h2 = form.querySelector('h2');
            if(h2) h2.innerText = "Modifier la séance";
        });
}

function editMovie(movie) {
    // On affiche le formulaire s'il était caché
    const formContainer = document.getElementById('add-movie-form');
    formContainer.classList.remove('hidden');

    // Remplissage des champs avec les données du film
    document.getElementById('movieId').value = movie.id;
    document.getElementById('title').value = movie.title;
    document.getElementById('director').value = movie.director;
    document.getElementById('genre').value = movie.genre;
    document.getElementById('release_year').value = movie.release_year;
    document.getElementById('duration').value = movie.duration;
    document.getElementById('description').value = movie.description;

    document.getElementById('formTitle').innerText = "Modifier le film : " + movie.title;
    document.getElementById('submitBtn').innerText = "Mettre à jour";
    document.getElementById('submitBtn').classList.replace('bg-green-500', 'bg-orange-500');

    // Remonte en haut de page pour que l'utilisateur voie le formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    // Vide tous les champs
    document.querySelector('form').reset();
    
    // Réinitialise l'ID caché et les textes
    document.getElementById('movieId').value = "";
    document.getElementById('formTitle').innerText = "Nouveau Film";
    document.getElementById('submitBtn').innerText = "Enregistrer";
    
    // Remet la couleur verte d'origine
    document.getElementById('submitBtn').classList.add('bg-green-500');
    document.getElementById('submitBtn').classList.remove('bg-orange-500');
}

function prepareEdit(id) {
    console.log("Tentative de modif pour l'ID :", id);
    
    const movie = allMovies.find(m => m.id == id);
    
    if (movie) {
        editMovie(movie);
    } else {
        console.error("Film non trouvé dans la liste locale");
    }
}

async function saveScreening(event) {
    event.preventDefault();

    const id = document.getElementById('screening_id').value;

    const screeningData = {
        movie_id: document.getElementById('movie_id').value,
        room_id: document.getElementById('room_id').value,
        start_time: document.getElementById('start_time').value
    };

    // Utilisation de l'ID pour déterminer l'action
    let action = id ? "update_screening" : "add_screening";
    if (id) screeningData.id = id;

    try {
        // CORRECTION : On utilise la variable action ici au lieu de "add_screening"
        const response = await fetch(`${API_URL}?action=${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(screeningData)
        });

        const result = await response.json();

        if (result.success === true) {
            alert(id ? "Séance mise à jour !" : "Séance créée avec succès !");
            event.target.reset();
            document.getElementById('screening_id').value = ""; // On vide l'ID caché
            toggleScreeningForm();
            loadScreenings();
        } else {
            alert("Erreur : " + (result.error || "La salle est peut-être déjà occupée."));
        }
    } catch (error) {
        console.error("Erreur lors de l'appel API :", error);
        alert("Erreur technique de connexion au serveur.");
    }
}

function deleteScreening(id) {
    if (confirm("Voulez-vous vraiment supprimer cette séance ?")) {
        fetch(`${API_URL}?action=delete_screening&id=${id}`, { method: 'POST' })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    alert("Séance supprimée");
                    loadScreenings();
                }
            });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // On vérifie si on est sur la page des séances grâce à l'ID du container
    if (document.getElementById('screening-list')) {
        console.log("Initialisation de la page séances...");
        loadScreenings(); // Affiche la liste immédiatement
        fillSelects();    // Remplit les menus Films et Salles
    }
});