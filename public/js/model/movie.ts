/**
 * Created by Navdeep on 2/14/2016.
 */
export class Movie{

    constructor(public title:string, public overview:string, public releaseDate:string, public id:string, public rating:string, public url:string){}

    getTitle(){
        return this.title;
    }

    getReleaseDate(){
        return this.releaseDate;
    }

    getPosterUrl(){
        return this.url;
    }

    getOverview(){
        return this.overview;
    }

    getRating(){
        return this.rating;
    }

    getId(){
        return this.id;
    }
}