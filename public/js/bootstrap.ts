import {bootstrap} from "angular2/platform/browser";
import {PopMovies} from "./popMovies";
import {MovieService} from "./service/movieService";
import {HTTP_PROVIDERS} from "angular2/http";

bootstrap(PopMovies, [MovieService, HTTP_PROVIDERS]);