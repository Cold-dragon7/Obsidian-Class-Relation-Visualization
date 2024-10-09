
import { Notice, Platform } from 'obsidian'
import SVG from 'svg.js'
import { ClassRelationView } from './ClassRelationView'

interface Setting {
    theme?: string;
    canvasSize?: number;
    background?: string;
    fontSize?: number;
    color?: string,
    exportMdModel?: string,
    headLevel: number,
    layoutDirect: string,
    strokeArray?:any[],
    focusOnMove?: boolean
}

export default class ClassRelationMap {
    
    appEl: HTMLElement;
    contentEL: HTMLElement;
    containerEL: HTMLElement;

    setting: Setting;
    draw: any;

    _indicateDom:HTMLElement;
    _menuDom:HTMLElement;

    constructor(containerEL: HTMLElement, setting?: Setting) {
        this.setting = Object.assign({
            theme: 'default',
            canvasSize: 36000,
            fontSize: 16,
            background: 'transparent',
            color: 'inherit',
            exportMdModel: 'default',
            headLevel: 2,
            layoutDirect: ''
        }, setting || {});

        this.appEl = document.createElement('div');

        this.appEl.classList.add('mm-mindmap');
        this.appEl.classList.add(`mm-theme-${this.setting.theme}`);
        this.appEl.style.overflow = "auto";


        this.contentEL = document.createElement('div');
        this.contentEL.style.position = "relative";
        this.contentEL.style.width = "100%";
        this.contentEL.style.height = "100%";
        this.appEl.appendChild(this.contentEL);
        this.draw = SVG(this.contentEL).size('100%', '100%');

        this.setAppSetting();
        containerEL.appendChild(this.appEl);
        this.containerEL = containerEL;


        console.log(containerEL.className);
        console.log(this.appEl.className);
        console.log(this.contentEL.className);
        console.log(this.draw.className);
        this.drawSVG();
    }

    setAppSetting() {
        this.appEl.style.width = `${this.setting.canvasSize}px`;
        this.appEl.style.height = `${this.setting.canvasSize}px`;
        this.contentEL.style.width = `100%`;
        this.contentEL.style.height = `100%`;
        //  this.contentEL.style.color=`${this.setting.color};`;
        this.contentEL.style.background = `${this.setting.background}`;
        this.contentEL.style.fontSize = `${this.setting.fontSize}px`;
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
        this.contentEL.appendChild(svg);

		console.log("drawSVG() end");
    }
}