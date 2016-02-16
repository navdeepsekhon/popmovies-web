/**
 * Created by Navdeep on 2/14/2016.
 */
import {Component, Input, Output, EventEmitter} from "angular2/core";

@Component({
    selector: 'movie',
    template: `<img  class="img-responsive image-center thumbnail-image" [src]="movie.getPosterUrl()" ><h3 class="text-center">{{movie.getTitle()}}</h3>
   `
})

export class MovieItemRender{
    @Input() movie;
}