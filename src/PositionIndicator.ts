


export class PositionIndicator {
    mapWidth : number = 0;
    mapHeight : number = 0;
    nodeWidth : number = 0;
    nodeHeight : number = 0;



    constructor(mapWidth:number, mapHeight:number, nodeWidth:number, nodeHeight:number) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.nodeWidth = nodeWidth;
        this.nodeHeight = nodeHeight;
    }

    // getPosition(x:number, y:number, radius:number) : number[] {
    //     const mapCenterX = this.mapWidth / 2;
    //     const mapCenterY = this.mapHeight / 2;
    //     const intervalX = this.nodeWidth;
    //     const intervalY = this.nodeHeight * 2;
    //     var Yindex = 0;

    //     if(radius <= 0) {
    //         return [];
    //     }

        
    // }
}