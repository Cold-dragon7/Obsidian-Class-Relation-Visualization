import SVG, { svgjs } from 'svg.js'
import { Node, Connection } from './elements'

const nodeWidth : number = 300;
const nodeHeight : number = 50;

// interface Setting {
//     theme?: string;
//     canvasSize?: number;
//     background?: string;
//     fontSize?: number;
//     color?: string,
//     exportMdModel?: string,
//     headLevel: number,
//     layoutDirect: string,
//     strokeArray?:any[],
//     focusOnMove?: boolean
// }

export default class ClassRelationMap {
    SVGContainer : SVG.Doc;
    nodeContainer : Node[] = [];
    connectionContainer : Connection[] = [];
    parentNodes : string[] = [];
    ownerNodes : string[] = [];

    mapWidth : number = 0;
    mapHeight : number = 0;

    constructor(SVGContainer : SVG.Doc) {
        this.SVGContainer = SVGContainer;
    }

    // setAppSetting() {
    //     this.appEl.style.width = `${this.setting.canvasSize}px`;
    //     this.appEl.style.height = `${this.setting.canvasSize}px`;
    //     this.contentEL.style.width = `100%`;
    //     this.contentEL.style.height = `100%`;
    //     //  this.contentEL.style.color=`${this.setting.color};`;
    //     this.contentEL.style.background = `${this.setting.background}`;
    //     this.contentEL.style.fontSize = `${this.setting.fontSize}px`;
    // }

    createNode(className : string, inheritance : string[], composition : string[], 
        aggregation : string[], comment : string, tag : string) {
        this.nodeContainer.push(new Node(className, inheritance, composition, aggregation, comment, tag));
        
        // parent 검사
        if(inheritance.length > 0) {
            inheritance.filter(name => !this.parentNodes.includes(name)).forEach(parentName => {
                this.parentNodes.includes(parentName); 
            });
        }
    }

    calculOwner() {     // 정상 작동하는지 확인 필요
        var sum = 0;
        this.nodeContainer.filter(node => node.composition.length + node.aggregation.length != 0)
        .forEach(node => {
            sum += node.composition.length + node.aggregation.length;
        });

        this.nodeContainer.filter(node => (node.composition.length + node.aggregation.length) > (sum / this.nodeContainer.length))
        .forEach(node => {
            this.ownerNodes.push(node.className);
        });
    }

    positionNode() {
        // map 크기 설정
        this.mapWidth = this.nodeContainer.length * 1000;
        this.mapHeight = this.nodeContainer.length * 800;

        // 1. 부모-자식 노드 배치
        if(this.parentNodes.length > 0) {
            const parentBand = this.mapHeight / 3;

        }

        // 2. Owner 노드 배치
        if(this.ownerNodes.length > 0) {
            const ownerBand = this.mapHeight / 3 * 2;

        }

        // 3. 일반 노드 배치
        var Xindex = 200;
        var Yindex = 200;

        this.nodeContainer.forEach(node => {
            if(Xindex > 1200) {
                Xindex = 200;
                Yindex += 200;
            }
            this.tryPosition(node, Xindex, Yindex);
            Xindex += 400;
        });


    }

    tryPosition(node : Node, x : number, y : number) : boolean{
        // Y축 지그재그 검사 할까 말까
        
        // map 안에 들어오는지 검사
        if(x < nodeWidth || x > this.mapWidth - nodeWidth || 
            y < nodeHeight || y > this.mapHeight - nodeHeight) {
            return false;
        }

        // 다른 노드가 존재하는지 검사
        this.nodeContainer.forEach(node => {
            if(node.x == x || node.y == y)
                return false;
        });

        node.x = x; node.y = y;
        return true;
    }

    getMapSize() : [number, number] {
        return [this.mapWidth, this.mapHeight]
    }

    drawSVG() {
		console.log("drawSVG() start");

        this.nodeContainer.forEach(node => {
            this.drawNode(node.className, node.x, node.y);
        });
        





		console.log("drawSVG() end");
    }

    drawNode(className : string, x : number, y : number) {
        const nodeGroup: SVG.G = this.SVGContainer.group();

        const rect = nodeGroup.rect(nodeWidth, nodeHeight)
            .move(x, y)
            .fill('#87CEEB')
            .stroke({ color: 'black', width: 2 })
            .radius(10);

        const text = nodeGroup.text(className)
            .font({size: 18, family: 'Arial'})
            .fill('blue')
            .attr({ 'text-anchor': 'start', 'alignment-baseline': 'middle' });
            
        text.cx(rect.cx()).cy(rect.cy());
    }
}