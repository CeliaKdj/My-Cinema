<?php
require_once __DIR__ . '/../repositories/ScreeningRepository.php';

class ScreeningController {
    private $repository;

    public function __construct() {
        $this->repository = new ScreeningRepository();
    }

    public function list() {
        $screenings = $this->repository->getAll();
        echo json_encode($screenings);
    }

    public function add() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!empty($data['movie_id']) && !empty($data['room_id']) && !empty($data['start_time'])) {
            $success = $this->repository->add($data);
            echo json_encode(["success" => $success]);
        } else {
            echo json_encode(["success" => false, "error" => "Données incomplètes"]);
        }
    }

    public function delete(){
        $id= $_GET['id'] ?? null;
        if ($id){
            $success = $this->repository->delete($id);
            echo json_encode(["success" => $success]);
        } else {
            echo json_encode(["success" => false, "error" => "ID manquant"]);
        }
    }

    public function getOne() {
    $id = $_GET['id'] ?? null;
    if ($id) {
        
        $screening = $this->repository->findById($id);
        header('Content-Type: application/json');
        echo json_encode($screening);
    }
}
public function update() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!empty($data['id']) && !empty($data['movie_id']) && !empty($data['room_id']) && !empty($data['start_time'])) {
            $success = $this->repository->update($data);
            echo json_encode(["success" => $success]);
        } else {
            echo json_encode(["success" => false, "error" => "Données incomplètes pour la modification"]);
        }
    }
}
