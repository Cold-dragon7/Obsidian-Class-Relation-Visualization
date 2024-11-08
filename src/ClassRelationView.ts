import { ItemView, WorkspaceLeaf } from "obsidian";
import SVG from 'svg.js'

import MyPlugin from './main'
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
        return 'Class Relation View';
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
            //var mapSize = this.classRelationMap.getMapSize();
            SVGContainer.size(6000, 6000);
            
            this.classRelationMap.drawSVG();
        }
        // test용 코드
        // SVGContainer.circle(100).fill('blue').center(150, 150);
        // var text = SVGContainer.text("text").center(200, 200).fill('white');

        // const MDFiles = this.app.vault.getMarkdownFiles();
        // const fileName = MDFiles[0].name;
        // var fileStr = this.app.vault.cachedRead(MDFiles[0]);
        // var lines = (await fileStr).split('\n');
        // var line1 = lines[0].slice(0, 5);

        // text.text(line1);
        
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
        else {
            console.log("웨않되ㅣㅣㅣ");
        }
        return container;
    }

    async makeFile2Node() {
        var MDFiles = this.app.vault.getMarkdownFiles();
        //MDFiles = MDFiles.slice(0,50);
       // MDFiles.forEach(async file => {
       for(const file of MDFiles) {
            var className = file.basename;
            
            // 문자열 처리
            var fileStr = await this.app.vault.cachedRead(file);
            var lines =  fileStr.split('\n');
            var inheritance : string[] = [], composition : string[] = [], aggregation : string[] = [], comment : string = "", tag : string = "";
            
            lines.filter(line => line != "").forEach(line => {
                var char = line.charAt(0);
                var relationArr = ['상', '합', '집'];
                if(relationArr.includes(char)) {
                    var rawstr = line.slice(8);
                    var matches = rawstr.match(/\[\[(.*?)\]\]/g);       // 대괄호 안의 내용을 찾기
                    if(matches != null) {
                        var values = matches.map(match => match.replace(/\[\[|\]\]/g, ''));     // 대괄호 제거
                        if(char == '상')
                            inheritance = values;
                        else if(char == '합')
                            composition = values;
                        else
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
            
            if(this.classRelationMap != null)
                this.classRelationMap.createNode(className, inheritance, composition, aggregation, comment, tag);
        }
        if(this.classRelationMap != null) {
            this.classRelationMap.nodeContainer.sort((a, b)=> a.className.localeCompare(b.className));  // 사전순 정렬
            this.classRelationMap.calculParent();
            this.classRelationMap.calculOwner();
        }

        console.log(this.classRelationMap?.nodeContainer.length);
    }
}
