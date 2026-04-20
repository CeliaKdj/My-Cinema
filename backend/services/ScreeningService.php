<?php
// FICHIER QUI GERE LA LOGIQUE LIÉE AUX SEANCES ET VERIFIE QU'IL N'Y A PAS DE CHEVAUCHEMENT ENTRE DEUX SÉANCES
// SALLES DISPONIBLE
$sql = "SELECT s.*, m.title as movie_title, r.name as room_name 
        FROM Screenings s
        INNER JOIN Movies m ON s.movie_id = movie.id
        INNER JOIN Rooms r ON s.room_id = room.id";
?>