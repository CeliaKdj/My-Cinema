<?php
require_once __DIR__ . '/config/database.php';

require_once __DIR__ . '/models/Movie.php';
require_once __DIR__ . '/models/Room.php';
require_once __DIR__ . '/models/Screening.php';

require_once __DIR__ . '/repositories/MovieRepository.php';
require_once __DIR__ . '/repositories/RoomRepository.php';
require_once __DIR__ . '/repositories/ScreeningRepository.php';

require_once __DIR__ . '/controllers/MovieController.php';
require_once __DIR__ . '/controllers/RoomController.php';
require_once __DIR__ . '/controllers/ScreeningController.php';

// on recup une requete qui des quon va lancer lappel vers l'API va lancer la requette action
$request = $_GET ['action'] ?? ''; // Récupération du paramètre d'URL action indiquant la route API
$movieController = new MovieController() ;
$roomController = new RoomController();
$screeningController = new ScreeningController();

switch ($request) {

    case 'list_movies':
    $movieController -> list();
    break ;

    case 'list_rooms':
    $roomController->list();
    break;

    case 'list_screenings':
    $screeningController->list();
    break;

    case 'add_room':
    $roomController->add();
    break;

    case 'delete_room':
    $roomController->delete();
    break;

    case 'restore_room':
    $roomController->restore();
    break;
    
    case 'add_movie':
    $movieController->add();
    break;

    case 'delete_movie':
    $movieController->delete();
    break;

    case 'update_movie':
    $movieController->update();
    break;

    case 'add_screening':
    $screeningController->add();
    break;

    case 'delete_screening';
    $screeningController->delete();
    break;

    case 'get_screening':
        $screeningController->getOne();

    case 'update_screening':
        $screeningController->update();
        break;

    case 'list_movies_pagination':
    $movieController->listePage();
    break;

    

    default :
// retour de l'appel de l'API pour les erreurs
    header('Content-Type: application/json');
    echo json_encode (["error" => "Action not found"]) ;
    break;
}

?>