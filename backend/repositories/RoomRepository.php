<?php
class RoomRepository{
    private $pdo;

    public function __construct(){
        // RECUPERATION DE L'INSTANCE PDC CRÉEE DANS DATABASE :
        global $pdo;
        $this->pdo = $pdo;
    }
 public function getAll() {
    // IL NE FAUT PAS DE "WHERE active = 1" ICI
    $sql = "SELECT * FROM Rooms ORDER BY name ASC"; 
    $stmt = $this->pdo->query($sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

    // POUR RECUPEPER LES SALLES ACTIVES
    public function getAllActive(){
        // ON SELECTIONNE UNIQUEMENT LES SALLES OU ACTIVE = 1 :
        $stmt = $this->pdo->query("SELECT * FROM Rooms WHERE active = 1 ORDER BY name ASC");
        // PDO VA TRANSFORMER CHAQUE LIGNE SQL EN OBJECT DE LA CLASSE ROOM :
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // FONCTION SOFT DELETE POUR NE PAS SUPPRIMER MAIS UNIQUEMENT MASQUER UNE ÉLÉMENT DE LA BASE DE DONNÉE
    public function softDelete($id){
        $stmt = $this->pdo->prepare("UPDATE Rooms SET active = 0 WHERE id = ?");
        $stmt->execute([$id]);
    }

    public function add($data) {
    $sql = "INSERT INTO Rooms (name, capacity, type, active, created_at) 
            VALUES (?, ?, ?, 1, NOW())"; // NOW() remplit la date automatiquement
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([$data['name'], $data['capacity'], $data['type']]);
}

public function restore($id){
    $stmt = $this->pdo->prepare("UPDATE Rooms SET active = 1 WHERE id = ?");
    return $stmt->execute([(int)$id]);
}
}
?>