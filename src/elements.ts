export class Node {

    className : string = "";
    inheritance : string[] = [];
    composition : string[] = [];
    aggregation : string[] = [];
    comment : string = "";
    tag : string = "";

    x : number = -1;
    y : number = -1;
    
    constructor(className : string, inheritance : string[], composition : string[], 
        aggregation : string[], comment : string, tag : string) {
        this.className = className;
        this.inheritance = inheritance;
        this.composition = composition;
        this.aggregation = aggregation;
        this.comment = comment;
        this.tag = tag;
    }
}