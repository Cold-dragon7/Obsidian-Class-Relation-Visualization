import { ItemView, WorkspaceLeaf } from "obsidian";
import SVG from 'svg.js'

import MyPlugin from './main'
import ClassRelationMap from "./ClassRelationMap";

//import domtoimage from './domtoimage.js' 아직 용도를 몰라서 주석처리함

export const VIEW_TYPE_CRV = 'class-relation-view';

export class ClassRelationView extends ItemView {
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
      this.renderSVG();
  }
  
  async onClose() {
      // 뷰가 닫힐 때 실행할 작업이 있으면 여기서 처리합니다.
  }
  
  renderSVG() {
    // contentEl은 이 뷰의 루트 엘리먼트입니다.
    this.contentEl.empty(); // 이전 내용 제거
  
    // SVG 컨테이너 생성
    const container = this.contentEl.createDiv({ attr: { id: 'CRV-container' } });
  
    // svg.js 2.7.1 버전을 이용한 원 그리기
    const draw = SVG('CRV-container').size(1000, 1000); // SVG('id') 사용
    draw.circle(100).fill('blue').center(150, 150);
  }
}
