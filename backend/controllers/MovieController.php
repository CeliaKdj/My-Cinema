<?php
// C'EST ICI QUE LES DONNÉES ENVOYÉES PAR LE SITE, ELLES SONT RECEPTIONNÉES ET TRAITÉES AVANT D'ÊTRE ENVOYÉES AU REPOSITORY
require_once __DIR__ . '/../models/Movie.php';
require_once __DIR__ . '/../repositories/MovieRepository.php';

class MovieController {
    private $repository;

    public function __construct() {
        $this->repository = new MovieRepository() ; // repository créé par la suite
    }

    public function list(){ // Méthode appelée par le fichier index.php
        echo json_encode($this->repository -> getAll());
}
// FONCTION AJOUT
    public function add() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!empty($data['title'])) {
            $this->repository->add($data);
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["error" => "Titre requis"]);
        }
    }

    // FONCTION SUPPRIMER
    public function delete(){
        // ON RECUPÈRE L'ID
        $id = $_GET['id'] ?? null;
        if($id){
            $success = $this->repository->delete($id);
            echo json_encode(["success" => $success]);

        } else {
            echo json_encode(["success" => false, "error" => "ID manquant"]);
        }
    }

    // MODIFIER
    public function update(){
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!empty($data['id']) && !empty($data['title'])){
            $success = $this->repository->update($data);
            echo json_encode(['success' => $success]);
        } else {
            echo json_encode(['success' => false, 'error' => "Données incomplètes"]);
        }
    }

    // PAGINATION
    public function listePage(){
        $page = $_GET['page'] ?? 1;
        $parPage = 5;
        $movies = $this->repository->pagination($page, $parPage);
        $totalMovies = $this->repository->countAll();
        $totalPages = ceil($totalMovies / $parPage);

        echo json_encode([
            "success" => true,
            "movies" => $movies,
            "totalPages" => $totalPages,
            "currentPage" => (int)$page
        ]);
    }

}
?>