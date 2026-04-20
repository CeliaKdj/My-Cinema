<?php
require_once __DIR__ . '/../models/Screening.php';
class ScreeningRepository {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function getAll() {
        // La requête SQL avec JOIN pour récupérer les noms
        $sql = "SELECT s.*, m.title as movie_title, r.name as room_name 
                FROM Screenings s
                JOIN Movies m ON s.movie_id = m.id
                JOIN Rooms r ON s.room_id = r.id
                ORDER BY s.start_time ASC";

        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_CLASS, 'Screening');
    }


public function add($data) {
    // On récupère la durée du film qu'on veut planifier
    $sqlDuration = "SELECT duration FROM Movies WHERE id = ?";
    $stmtDuration = $this->pdo->prepare($sqlDuration);
    $stmtDuration->execute([$data['movie_id']]);
    $newMovie = $stmtDuration->fetch(PDO::FETCH_ASSOC);
    $newDuration = $newMovie['duration'] ?? 120; // Par défaut 120 si non renseigné

    // On vérifie s'il y a un conflit dans la même salle
    // On regarde si une séance existante finit après le début de la nouvelle OU si la nouvelle séance finit après le début d'une existante
    $sqlCheck = "SELECT s.id FROM Screenings s 
                 JOIN Movies m ON s.movie_id = m.id
                 WHERE s.room_id = ? 
                 AND (
                    -- Cas A: La nouvelle séance commence pendant une séance existante OU
                    (? BETWEEN s.start_time AND DATE_ADD(s.start_time, INTERVAL m.duration MINUTE))
                    OR 
                    -- Cas B: Une séance existante commence pendant la nouvelle séance
                    (s.start_time BETWEEN ? AND DATE_ADD(?, INTERVAL ? MINUTE))
                 )";
    
    $stmtCheck = $this->pdo->prepare($sqlCheck);

    $stmtCheck->execute([
        $data['room_id'], 
        $data['start_time'], 
        $data['start_time'], 
        $data['start_time'], 
        $newDuration
    ]);
    
    if ($stmtCheck->fetch()) {
        return false; 
    }

    // Si C'EST LIBRE ON INSERT
    $sql = "INSERT INTO Screenings (movie_id, room_id, start_time) VALUES (?, ?, ?)";
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([
        $data['movie_id'],
        $data['room_id'],
        $data['start_time']
    ]);
}

public function delete($id){
    $sql = "DELETE FROM Screenings WHERE id = ?";
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([$id]);
}

public function findById($id) {
    $stmt = $this->pdo->prepare("SELECT * FROM Screenings WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

public function update($data) {
    // On récupère la durée du film
    $stmtDuration = $this->pdo->prepare("SELECT duration FROM Movies WHERE id = ?");
    $stmtDuration->execute([$data['movie_id']]);
    $newDuration = $stmtDuration->fetch(PDO::FETCH_ASSOC)['duration'] ?? 120;

    $sqlCheck = "SELECT s.id FROM Screenings s 
                 JOIN Movies m ON s.movie_id = m.id
                 WHERE s.room_id = ? 
                 AND s.id != ?
                 AND (
                    (? BETWEEN s.start_time AND DATE_ADD(s.start_time, INTERVAL m.duration MINUTE))
                    OR 
                    (s.start_time BETWEEN ? AND DATE_ADD(?, INTERVAL ? MINUTE))
                 )";
    
    $stmtCheck = $this->pdo->prepare($sqlCheck);
    $stmtCheck->execute([
        $data['room_id'], 
        $data['id'], // On exclut l'ID de la séance qu'on modifie
        $data['start_time'], 
        $data['start_time'], 
        $data['start_time'], 
        $newDuration
    ]);
    
    if ($stmtCheck->fetch()) {
        return false; 
    }

    // Si c'est libre, on met à jour
    $sql = "UPDATE Screenings SET movie_id = ?, room_id = ?, start_time = ? WHERE id = ?";
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([
        $data['movie_id'],
        $data['room_id'],
        $data['start_time'],
        $data['id']
    ]);
}

}
?>