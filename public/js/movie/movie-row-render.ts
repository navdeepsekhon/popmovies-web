/**
 * Created by Navdeep on 2/14/2016.
 */
import {Component, Input, Output, EventEmitter} from "angular2/core";
import {MovieItemRender} from "./movie-item-render";

@Component({
    selector: 'movie-row',
    directives: [MovieItemRender],
    template: `<div class="row" id="main" >
    <div class="col-md-4" *ngFor="#movie of movies">
    <movie [movie]="movie" (click) ="movieClick.emit(movie)"></movie></div>
</div>
   `
})

export class MovieRowRender{
    @Input() movies;
    @Output() movieClick = new EventEmitter();
}