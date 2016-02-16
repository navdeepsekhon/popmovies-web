/**
 * Created by Navdeep on 2/14/2016.
 */
import {Component, Input, Output, EventEmitter} from "angular2/core";

@Component({
    selector: 'movie-details',
    template: `<div class="row"><div class="col-md-12"><button class="btn btn-primary" (click)="back.emit()">Back</button></div></div>
    <div class="row">
    <div class="col-md-6">
        <img  class="img-responsive image-center detail-image" [src]="movie.getPosterUrl()" >
    </div>
        <div class="col-md-6 details-right">
            <p><strong>Release Date: </strong><span class="text-grey">{{movie.getReleaseDate()}}</span></p>
            <hr/>
            <p><strong>Rating: </strong><span class="text-grey">{{movie.getRating()}}</span></p>
            <hr/>
            <p><strong>Running Time: </strong><span class="text-grey">coming soon...</span></p>
            <hr/>
            <p class="text-grey">{{movie.getOverview()}}</p>
            <hr/>
            <h3>Videos:</h3>
        </div>
</div>
`
})

export class MovieDetailsRender{
    @Input() movie;
    @Output() back = new EventEmitter();
}