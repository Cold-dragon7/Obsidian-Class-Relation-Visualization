import SVG from 'svg.js'
import { Node, Connection } from './elements'

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
    parentNodes : string[] = [];
    ownerNodes : string[] = [];

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

    drawSVG() {
		console.log("drawSVG() start");

        const svgNamespace = 'http://www.w3.org/2000/svg';
        
        // SVG 요소 생성
        const svg = document.createElementNS(svgNamespace, 'svg');
        svg.setAttribute('width', '200');
        svg.setAttribute('height', '200');

        // 도형 추가 (예: 원)
        const circle = document.createElementNS(svgNamespace, 'circle');
        circle.setAttribute('cx', '100');
        circle.setAttribute('cy', '100');
        circle.setAttribute('r', '80');
        circle.setAttribute('fill', 'blue');

        // SVG에 도형 추가
        svg.appendChild(circle);

        // Obsidian의 특정 DOM 요소에 SVG 추가
        // this.contentEL.appendChild(svg);

		console.log("drawSVG() end");
    }
}