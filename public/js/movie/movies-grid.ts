import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {MovieService} from "./../service/movieService";
import {MovieItemRender} from "./movie-item-render";
import {MovieRowRender} from "./movie-row-render";


@Component({
    selector: 'main-view',
    directives: [MovieRowRender],
    template: `<div class="row text-center">
    <div class="col-md-6 infoAlert">
        <div class="alert alert-info text-name" role="alert">Click on a movie for more details.</div>
    </div>
</div>
<span *ngFor="#movieSet of movieSets">
    <movie-row [movies]="movieSet" (movieClick) = "movieClick.emit($event)"></movie-row>
</span>`
})

export class MoviesGrid {
    @Input() movieSets;
    @Output() movieClick = new EventEmitter();
}