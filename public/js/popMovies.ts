import {Component} from 'angular2/core';
import {MovieService} from "./service/movieService";
import {MoviesGrid} from "./movie/movies-grid";
import {MovieDetailsRender} from "./movie/movie-details-render";
import {Movie} from "./model/movie";


@Component({
    selector: 'pop-movies',
    directives: [MoviesGrid, MovieDetailsRender],
    template: `<main-view [hidden] = "!hideDetails" [movieSets]="movieService.movieSets" (movieClick)="onClick($event)"></main-view>
    <movie-details #details [movie]="movie" [hidden]="hideDetails" (back)="back()"></movie-details>`
})

export class PopMovies {
    hideDetails = true;
    movie = new Movie("", "", "", "","", "");
    constructor(public movieService:MovieService){};

    onClick(movie){
        this.movie = movie;
        this.hideDetails = false;
    }

    back(){
        this.hideDetails = true;
    }
}