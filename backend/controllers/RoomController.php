<?php
require_once __DIR__ . '/../repositories/RoomRepository.php';

class RoomController{
    private $repository;

    public function __construct(){
        $this->repository = new RoomRepository();
    }

    // LISTER TOUTES LES SALLES ACTIVES APPELÉES PAR INDEX.PHP?ACTION=LIST_ROOMS
    public function list(){
        $rooms = $this->repository->getAll();
        header('Content-Type: application/json');
        echo json_encode($rooms);
    }

    // SUPPRIMER (MASQUER) UNE SALLE APPELÉE PAR INDEX.PHP?ACTION=LIST_ROOMS
    public function delete(){
        // RECUPERATION DE L'ID PASSÉ DANS L'URL
        $id = $_GET['id'] ?? null;

        if($id){
            $this->repository->softDelete($id);
            echo json_encode(["success" => "Salle désactivée"]);

        } else {
            echo json_encode(["error" => "ID manquant"]);
        }
    }

    public function add() {
    // On récupère les données envoyées en JSON
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!empty($data['name'])) {
        // On passe le tableau $data au repository
        $success = $this->repository->add($data);
        echo json_encode(["success" => $success]);
    } else {
        echo json_encode(["success" => false, "error" => "Nom de salle manquant"]);
    }
    }

    public function restore(){
    $id = $_GET['id'] ?? null;
    if ($id){
        $success = $this->repository->restore($id);
        echo json_encode(["success" => $success]);
    }
    }
}
?>