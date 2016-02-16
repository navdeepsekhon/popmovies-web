/**
 * Created by Navdeep on 2/14/2016.
 */

import {Injectable} from "angular2/core";
import {Movie} from "../model/movie";
import {Http} from "angular2/http";
import 'rxjs/add/operator/map';

@Injectable()
export class MovieService{
    movieSets = [];
    //http://placehold.it/300x350
    constructor(http:Http){
        http.get('/movies').map((res) => res.json()).map((res:Array<any>)=> {
            let result = [];
            if(res){
                res.forEach((movie) => {result.push(new Movie(movie.title, movie.overview, movie.releaseDate, movie.id, movie.rating, movie.posterUrl));})
            }
            return result;
        }).subscribe(movies => this.splitMovieListIntoSetsOfThree(movies));
    }

    splitMovieListIntoSetsOfThree(movies:Array){
        var i = 0;
        while(i < movies.length){
            if((i+3) < movies.length) {
                this.movieSets.push(movies.slice(i, i+3));
                i = i+3;
            } else {
                this.movieSets.push(movies.slice(i));
                i = movies.length + 1;
            }
        }
    }
}