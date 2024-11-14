import SVG, { svgjs } from 'svg.js'
import { Node } from './elements'

const nodeWidth : number = 150;
const nodeHeight : number = 40;
const intervalWidth : number = 90;
const intervalHeight : number = 70;

// 포함 관계 노드 배치 시 우상단부터 시작하여 아래 순서대로 방향 설정
const directions = [
    { dx: -1, dy: 0 },  // 좌
    { dx: 0, dy: -1 },  // 상
    { dx: 1, dy: 0 },   // 우
    { dx: 0, dy: 1 },   // 하
];

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
    remainNodeContainer : Node[] = [];
    parentNodes : string[] = [];
    ownerNodes : string[] = [];

    rows : number = 0;
    columns : number = 0;

    forDebug : boolean = false;

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
    }

    calculParent() {
        this.nodeContainer.filter(node=> node.inheritance.length > 0).forEach(node=> {
            node.inheritance.filter(parentName=> !this.parentNodes.includes(parentName)).    // 이미 등록된 노드인지 검사
            forEach(parentName=> {
                let parentNode = this.findNode(parentName);
                if(parentNode)  this.researchParent(parentNode);
            })
        })
    }

    researchParent(parentNode:Node) {
        // 더 상위의 부모 노드가 있는지 검사
        if(parentNode.inheritance.length > 0) {
            parentNode.inheritance.forEach(grandName=>{
                let grandNode = this.findNode(grandName);
                if(grandNode) this.researchParent(grandNode);   // 재귀함수
            })
        }

        // 이미 등록된 노드인지 검사 22
        if(!this.parentNodes.includes(parentNode.className)) {
            this.parentNodes.push(parentNode.className); 
        }
    }

    calculOwner() {     // 정상 작동하는지 확인 필요
        // let sum = 0;
        // this.nodeContainer.filter(node => node.composition.length + node.aggregation.length != 0)
        // .forEach(node => {
        //     sum += node.composition.length + node.aggregation.length;
        // });

        this.nodeContainer.filter(node => (node.composition.length + node.aggregation.length) > 5/*(sum / this.nodeContainer.length)*/)
        .forEach(node => {
            this.ownerNodes.push(node.className);
        });
    }

    findNode(name:string) : Node|null {
        for(let i=0; i<this.nodeContainer.length; i++) {
            if(this.nodeContainer[i].className === name) {
                return this.nodeContainer[i];
            }
        }
        return null;
    }

    positionNode() {
        // index (map 크기) 설정
        [this.rows, this.columns] = this.calculGrid(this.nodeContainer.length);

        let Xindex = 1;
        let Yindex = 1;

        // 1. 부모-자식 노드 배치
        if(this.parentNodes.length > 0) {
            
            this.parentNodes.forEach(parentName => {

                let useInterval = false;        // 새로운 트리가 생성될 때만 간격을 넣도록
                let parentNode = this.findNode(parentName);
                if(parentNode != null) {
                    if(parentNode.x == -1 && parentNode.y == -1) {       // 이미 무언가의 자식으로 배치된 노드인지 검사
                        this.positionCentralNode(parentNode, Xindex, Yindex);
                        useInterval = true;
                    }
                    this.positionChildNode(parentNode);
                }
                if(useInterval) Xindex += 3;
                if(Xindex >= this.rows) {Xindex = 1; Yindex += 4;}
            });
        }
        
        // 2. Owner 노드 배치
        if(this.ownerNodes.length > 0) {
            // 1번 과정에서 사용하던 X/Yindex를 이어서 사용

            this.ownerNodes.forEach(ownerName => {
                let useInterval = false;        // 1번 과정과 동일하게 새로운 묶음이 생성될 때만 간격 넣기
                let ownerNode = this.findNode(ownerName);

                if(ownerNode != null) {
                    if(ownerNode.x == -1 && ownerNode.y == -1) {     // 1번 과정이나 무언가의 member로 이미 배치된 노드인지 검사
                        this.positionCentralNode(ownerNode, Xindex, Yindex);
                        useInterval = true;
                    }
                    this.positionMemberNode(ownerNode);
                }
                if(useInterval) Xindex += 3;
                if(Xindex >= this.rows) {Xindex = 1; Yindex += 4;}
            })
        }

        // 3. 이미 배치된 노드가 포함하는 노드 배치
        for(const node of this.nodeContainer) {
            if(node.x == -1 && node.y == -1)        // 남은 노드 검사
            this.remainNodeContainer.push(node);
        }

        this.nodeContainer.filter(node=> node.x != -1 && node.y != -1).forEach(node => {
            if(this.remainNodeContainer.some(remainNode=> [...node.composition, ...node.aggregation].includes(remainNode.className))) {
                let remainMemberNodes = this.remainNodeContainer.filter(remainNode=> [...node.composition, ...node.aggregation].includes(remainNode.className));
                this.positionMemberNode(node, remainMemberNodes);       // 이미 배치된 노드와 그것이 가지고 있는 미배치 노드들을 전달
            }
        });

        // 4. 어디에도 포함되지 않는 노드 배치 (그렇다고 꼭 사용하지 않는 건 아님)
        this.forDebug = true;//debug
        let Ybegin = Yindex;
        this.remainNodeContainer.forEach(targetNode=> {
            this.positionCentralNode(targetNode, Xindex, Yindex);
            this.remainNodeContainer = this.remainNodeContainer.filter(node=> node !== targetNode);
            
            // 마지막은 X/Y 증감을 반대로 하고 싶었음..
            Yindex += 1;
            if(Yindex >= this.columns) {Yindex = Ybegin; Xindex += 1;}
        })
    }

    positionCentralNode(parentNode:Node, Xindex:number, Yindex:number) {
        let posResult = false;

        while(!posResult) {
            posResult = this.tryPosition(parentNode, Xindex, Yindex);
            Xindex += 1;
            if(Xindex >= this.rows) {Xindex = 1; Yindex += 1;}
            if(Yindex >= this.columns) break;
        }
    }

    positionChildNode(parentNode:Node) {
        let Xband = [parentNode.x-1, parentNode.x+1];
        let Xindex = Xband[0]; 
        let Yindex = parentNode.y+1;
        
        this.nodeContainer.filter(node => node.inheritance.includes(parentNode.className))
        .forEach(childNode => {
            let posResult = false;

            while(!posResult) {
                posResult = this.tryPosition(childNode, Xindex, Yindex);
                Xindex += 1;
                if(Xindex > Xband[1]) {Xindex = Xband[0]; Yindex += 1;}
                if(Yindex > parentNode.y+5) break;
            }
        })
    }

    positionMemberNode(ownerNode:Node) : void;
    positionMemberNode(ownerNode:Node, remainNodes:Node[]) : void;
    positionMemberNode(ownerNode:Node, remainNodes?:Node[]) {
        let centerX = ownerNode.x;
        let centerY = ownerNode.y;
        let radius = 1;
        let currentMemberCount = 0;

        if(remainNodes === undefined) {
            let members = [...ownerNode.composition, ...ownerNode.aggregation];
            while (currentMemberCount < members.length) {
                // center의 우상단부터 시작
                let x = centerX + radius;
                let y = centerY + radius;
            
                for (const { dx, dy } of directions) {
                    for (let i = 0; i < radius * 2 && currentMemberCount < members.length; i++) {
                        x += dx;    y += dy;    // 증감이 앞에 있어야 함
                        let posResult = false;
                        while(!posResult && currentMemberCount < members.length) {

                            let memberNode = this.findNode(members[currentMemberCount]);
                            if(memberNode && memberNode.x == -1 && memberNode.y == -1) {    // 새롭게 배치해야 하는 경우
                                posResult = this.tryPosition(memberNode, x, y);
                                if(posResult) currentMemberCount++;
                                else break;                     // 배치해야 하는데 tryPosition 실패한 경우 x, y만 증감
                            }
                            else currentMemberCount++;          // 이미 배치된 노드라 건너뛰어야 하는 경우 count만 증가
                        }
                    }
                }
                radius++;
            }
        }
        else {          // remainNodes의 포함 관계에 remain이 또 있는지 계속 파고 들어감 (재귀함수)
            while (currentMemberCount < remainNodes.length) {
                // center의 우상단부터 시작
                let x = centerX + radius;
                let y = centerY + radius;
            
                for (const { dx, dy } of directions) {
                    for (let i = 0; i < radius * 2 && currentMemberCount < remainNodes.length; i++) {
                        x += dx;    y += dy;    // 증감이 앞에 있어야 함
                        let posResult = false;
                        while(!posResult && currentMemberCount < remainNodes.length) {

                            let targetNode = remainNodes[currentMemberCount];
                            if(targetNode.x == -1 && targetNode.y == -1) {    // 새롭게 배치해야 하는 경우
                                
                                posResult = this.tryPosition(targetNode, x, y);
                                if(posResult) {
                                    currentMemberCount++;
                                    this.remainNodeContainer = this.remainNodeContainer.filter(node=> node !== targetNode);     // 배치한 노드 제거
                                    if(this.remainNodeContainer.some(remainNode=> [...targetNode.composition, ...targetNode.aggregation].includes(remainNode.className)))
                                        this.positionMemberNode(targetNode, this.remainNodeContainer.filter(remainNode=> [...targetNode.composition, ...targetNode.aggregation].includes(remainNode.className)));
                                }
                                else break;                     // 배치해야 하는데 tryPosition 실패한 경우 x, y만 증감
                            }
                            else currentMemberCount++;          // 이미 배치된 노드라 건너뛰어야 하는 경우 count만 증가
                        }
                    }
                }
                radius++;
            }
        }
    }

    tryPosition(node:Node, x:number, y:number) : boolean{
        // index 범위 검사
        if(x < (y%2==1? 1:0) || x > this.rows || y < 0 || y > this.columns) {
            return false;
        }
        
        // 다른 노드가 존재하는지 검사
        for(const refNode of this.nodeContainer) {
            if(refNode.x == x && refNode.y == y) {
                return false;
            }
        }
        
        node.x = x; node.y = y;
        return true;
    }

    calculGrid(n:number) : [number, number] {
        const target = 4 * n;           // 목표 값: 입력 숫자의 두 배
        const sqrt = Math.sqrt(target); // 근사 제곱근을 기준으로 분배
        
        // x와 y를 제곱근에 가장 가까운 정수로 설정
        let x = Math.floor(sqrt);
        let y = Math.ceil(target / x);
        
        // x * y가 target보다 작으면 조정
        while (x * y < target) {
            x++;
            y = Math.floor(target / x);
        }
        
        return [x, y];
    }

    // getMapSize() : [number, number] {
    //     return [this.mapWidth, this.mapHeight]
    // }

    drawSVG() {
        this.nodeContainer.forEach(node => {
            this.drawNode(node);

            node.inheritance.forEach(dstName=> {
                let dstNode = this.findNode(dstName);
                if(dstNode) {
                    this.drawInheritance(node, dstNode);
                }
            })

            node.composition.forEach(dstName=> {
                let dstNode = this.findNode(dstName);
                if(dstNode) {
                    this.drawContainment(node, dstNode, 1);
                }
            })

            node.aggregation.forEach(dstName=> {
                let dstNode = this.findNode(dstName);
                if(dstNode) {
                    this.drawContainment(node, dstNode, 2);
                }
            })
        });
    }

    calCoordinates(x:number, y:number) : [number, number] {
        let coordX;
        let coordY = y * (nodeHeight + intervalHeight) - nodeHeight/2 - intervalHeight;
        if(y % 2 == 0) {
            coordX = x * (nodeWidth + intervalWidth) + intervalWidth/2;
        } else {
            coordX = (x * (nodeWidth + intervalWidth)) - ((nodeWidth + intervalWidth) / 2) + intervalWidth/2;
        }

        return [coordX, coordY];
    }

    drawNode(node:Node) {
        let [x, y] = this.calCoordinates(node.x, node.y);

        const nodeGroup: SVG.G = this.SVGContainer.group();

        const rect = nodeGroup.rect(nodeWidth, nodeHeight)
            .move(x, y)
            .fill('#87CEEB')
            .stroke({ color: 'black', width: 2 })
            .radius(10);

        let nameStr = node.className;
        
        if(nameStr.length >= 20) {           // 이름이 너무 길면 2줄로
            let tempStr = nameStr.slice(5);
            let index = 5;
            for(const char of tempStr) {
                if(/[A-Z]/.test(char))
                    break;
                index++;
            }

            nameStr = nameStr.slice(0, index) + '\n' + nameStr.slice(index);
        }

        const text = nodeGroup.text(nameStr)
            .font({size: 12, family: 'Arial'})
            .fill('blue')
            .attr({ 'text-anchor': 'start', 'alignment-baseline': 'middle' });
            
        text.cx(rect.cx()).cy(rect.cy());
        nodeGroup;
    }

    drawInheritance(srcNode: Node, dstNode: Node) {
        let [srcX, srcY] = this.calCoordinates(srcNode.x, srcNode.y);
        let [dstX, dstY] = this.calCoordinates(dstNode.x, dstNode.y);

        // 1. 각 노드의 중심 좌표 계산
        const centerX1 = srcX + nodeWidth / 2;
        const centerY1 = srcY + nodeHeight / 2;
        const centerX2 = dstX + nodeWidth / 2;
        const centerY2 = dstY + nodeHeight / 2;
      
        // 2. 상속관계는 수직적인 관계로 표현
        const angle = -Math.PI / 2;
      
        // 3. 목적지 노드의 경계 좌표 계산
        const destinationX = centerX2 - (nodeWidth / 2) * Math.cos(angle);
        const destinationY = centerY2 - (nodeHeight / 2) * Math.sin(angle);
      
        // 4. 중간 경유점 계산
        const points : [number, number][] = [[centerX1, centerY1]];

        if(centerY1 < destinationY + nodeHeight + intervalHeight) {     // depth 1이면
            points.push([centerX1, centerY1 - nodeHeight/2 - intervalHeight/2]);
        } else {       // depth 1 이상이면
            points.push([centerX1, centerY1 - nodeHeight*1.5 - intervalHeight*1.5]);
        }

        while(points[points.length-1][1] > destinationY + nodeHeight + intervalHeight) {    // 마지막 경유점이 depth 1 이상이면 반복
            let leftPoint : [number, number] = [...points[points.length-1]];     // 값 복사
            leftPoint[0] -= nodeWidth/2 + intervalWidth/2;
            let upPoint : [number, number] = [...leftPoint];
            upPoint[1] -= nodeHeight + intervalHeight;
            points.push(leftPoint);     points.push(upPoint);
        }

        points.push([destinationX, destinationY + intervalHeight/2]);
        points.push([destinationX, destinationY]);

      
        // 6. 화살표 그리기
        const arrowLength = 15;  // 화살표의 길이
        const arrowAngle = Math.PI / 6;  // 화살표 각도 (30도)
      
        // 화살표 왼쪽 날개 좌표 계산
        const arrowLeftX = destinationX - arrowLength * Math.cos(angle - arrowAngle);
        const arrowLeftY = destinationY - arrowLength * Math.sin(angle - arrowAngle);
      
        // 화살표 오른쪽 날개 좌표 계산
        const arrowRightX = destinationX - arrowLength * Math.cos(angle + arrowAngle);
        const arrowRightY = destinationY - arrowLength * Math.sin(angle + arrowAngle);
      
        // 화살표 모양을 polygon으로 그리기
        this.SVGContainer.polygon(`${destinationX},${destinationY} ${arrowLeftX},${arrowLeftY} ${arrowRightX},${arrowRightY}`)
            .stroke('gray').fill('white').back();
            
        // 5. 꺾은선 그리기 (출발점 중심에서 목적지 노드 경계까지)
        this.SVGContainer.polyline(points).fill('none').stroke({ width: 2, color: 'gray' }).back();
    }

    drawContainment(srcNode: Node, dstNode: Node, type: number) {
        let [srcX, srcY] = this.calCoordinates(srcNode.x, srcNode.y);
        let [dstX, dstY] = this.calCoordinates(dstNode.x, dstNode.y);

        // 1. 각 노드의 중심 좌표 계산
        const centerX1 = srcX + nodeWidth / 2;
        const centerY1 = srcY + nodeHeight / 2;
        const centerX2 = dstX + nodeWidth / 2;
        const centerY2 = dstY + nodeHeight / 2;
      
        // 2. 두 점 사이의 각도 계산
        const angle = Math.atan2(centerY1 - centerY2, centerX1 - centerX2);
      
        // 3. 목적지 노드의 경계 좌표 계산
        const destinationX = centerX1 - (nodeWidth / 2) * Math.cos(angle);
        const destinationY = centerY1 - (nodeHeight / 2) * Math.sin(angle);
      
        // 4. 선 그리기 (출발점 중심에서 목적지 노드 경계까지)
        this.SVGContainer.line(destinationX, destinationY, centerX2, centerY2).stroke({ width: 1, color: 'gray' }).back();
      
        // 5. 마름모 그리기
        const edgeLength = 15;  // 한 변의 길이
        const diamondAngle = Math.PI / 6;  // 마름모의 각도 (30도)

        // 마름모의 꼭짓점 좌표 계산
        const topX = destinationX - edgeLength * Math.cos(angle + diamondAngle);
        const topY = destinationY - edgeLength * Math.sin(angle + diamondAngle);

        const bottomX = destinationX - edgeLength * Math.cos(angle - diamondAngle);
        const bottomY = destinationY - edgeLength * Math.sin(angle - diamondAngle);

        const diffX = destinationX - bottomX;
        const diffY = destinationY - bottomY;

        // 마름모 모양을 polygon으로 그리기
        this.SVGContainer.polygon(`${topX},${topY} ${destinationX},${destinationY} ${bottomX},${bottomY} ${topX - diffX},${topY - diffY}`)
            .fill((type == 1)? 'white' : 'gray').back();
    }
}