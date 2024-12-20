import { ItemView, WorkspaceLeaf } from "obsidian";
import SVG from 'svg.js'

import ClassRelationMap from "./ClassRelationMap";

//import domtoimage from './domtoimage.js' 아직 용도를 몰라서 주석처리함

export const VIEW_TYPE_CRV = 'class-relation-view';

export class ClassRelationView extends ItemView {

    private divID : string = 'SVG-container';
    private classRelationMap : ClassRelationMap | null = null;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }
  
    getViewType(): string {
        return VIEW_TYPE_CRV;
    }
  
    getDisplayText(): string {
        return 'Class relation view';
    }
  
    async onOpen() {
        super.onOpen();

        this.contentEl.empty(); // 이전 내용 제거
        let temp = this.createSVGContainer(this.divID);
        if(temp) {
            const SVGContainer = temp;
            this.classRelationMap = new ClassRelationMap(SVGContainer);

            await this.makeFile2Node();

            this.classRelationMap.positionNode();
            //let mapSize = this.classRelationMap.getMapSize();
            SVGContainer.size(6000, 6000);
            
            requestAnimationFrame(() => {
                if(this.classRelationMap instanceof ClassRelationMap)
                    this.classRelationMap.drawSVG();
            })
        }
    }
  
    async onClose() {
        // 뷰가 닫힐 때 실행할 작업이 있으면 여기서 처리합니다.
    }

    createSVGContainer(divId : string) : SVG.Doc|null {
        let container : SVG.Doc|null = null;
        this.contentEl.createDiv({ attr: { id: divId } });
        const targetDiv = this.contentEl.querySelector(`#${divId}`) as HTMLElement;  // DOM 요소가 정상적으로 등록되었는지 확인
        if(targetDiv) {
            container = SVG(targetDiv).size(6000, 6000);
        }
        return container;
    }

    async makeFile2Node() {
        let MDFiles = this.app.vault.getMarkdownFiles();
        //MDFiles = MDFiles.slice(0,50);
       // MDFiles.forEach(async file => {
       for(const file of MDFiles) {
            let className = file.basename;
            let checkIsClass = 0;
            
            // 문자열 처리
            let fileStr = await this.app.vault.cachedRead(file);
            let lines =  fileStr.split('\n');
            let inheritance : string[] = [], composition : string[] = [], aggregation : string[] = [], comment : string = "", tag : string = "";
            
            lines.filter(line => line != "").forEach(line => {
                let char = line.charAt(0).toLowerCase();
                let relationCharArr = ['상', 'i', '합', 'c', '집', 'a'];
                if(relationCharArr.includes(char)) {

                    let word = line.split(' ')[0].toLowerCase();
                    let relationWordArr = ['상속', 'inheritance', '합성', 'composition', '집약', 'aggregation'];
                    if(relationWordArr.includes(word))          // 단어로 검사해서 클래스 정보 파일인지 판별
                        checkIsClass++;
                    
                    let rawstr = line.slice(8);
                    let matches = rawstr.match(/\[\[(.*?)\]\]/g);       // 대괄호 안의 내용을 찾기
                    if(matches != null) {
                        let values = matches.map(match => match.replace(/\[\[|\]\]/g, ''));     // 대괄호 제거
                        if(relationWordArr.slice(0, 2).includes(word)) 
                            inheritance = values;
                        else if(relationWordArr.slice(2, 4).includes(word))
                            composition = values;
                        else if(relationWordArr.slice(4).includes(word))
                            aggregation = values;
                    }
                }
                else if (char == '-') {     // comment
                    if(comment != "")
                        comment += '\n';
                    comment += line.slice(2);
                }
                else if (char == '#') {     // tag
                    tag = (line.split(' '))[0].slice(1);
                }
                else {
                    // 예외 처리
                }
            });
            // 문자열 처리 end
            
            if(this.classRelationMap != null && checkIsClass == 3)
                this.classRelationMap.createNode(className, inheritance, composition, aggregation, comment, tag);
        }
        if(this.classRelationMap != null) {
            this.classRelationMap.nodeContainer.sort((a, b)=> a.className.localeCompare(b.className));  // 사전순 정렬
            this.classRelationMap.calculParent();
            this.classRelationMap.calculOwner();
        }
    }
}
