<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Movie.php';


class MovieRepository {
    private $pdo;

    public function __construct () {
        global $pdo;
        $this -> pdo = $pdo;
    }


    public function getAll(): array {
        $stmt = $this -> pdo -> query ("SELECT * FROM Movies" );
        return $stmt -> fetchAll ( PDO::FETCH_CLASS , "Movie" );
    }

// AJOUTER UN FILM
    public function add($data) { 
    $sql = "INSERT INTO Movies (title, duration, genre, release_year, director, description) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([
        $data['title'],
        $data['duration'],
        $data['genre'],
        $data['release_year'],
        $data['director'],
        $data['description']
    ]);
}


// SUPPRIMER UN FILM
    public function delete($id){
    $sql = "DELETE FROM Movies WHERE id = :id";
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([':id' => $id]);
 }

// MODIFIER UN FILM 
    public function update($data){
    $sql = "UPDATE Movies SET title = ?, duration = ?, genre = ?,release_year = ?, director = ?, description = ? WHERE id = ?";
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([$data['title'], $data['duration'], $data['genre'], $data['release_year'], $data['director'], $data['description'], $data['id']]);
    }

// PAGINATION
    public function pagination($page, $parPage){
        $offset = ($page - 1) * $parPage;
        $sql = "SELECT * FROM Movies ORDER BY title ASC LIMIT ? OFFSET ?";
        $stmt = $this->pdo->prepare($sql);

        $stmt->bindValue(1, (int)$parPage, PDO::PARAM_INT);
        $stmt->bindValue(2, (int)$offset, PDO::PARAM_INT);

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);

    }

    public function countAll(){
        $sql = "SELECT COUNT(*) FROM Movies";
        return $this->pdo->query($sql)->fetchColumn();
    }
}


?>