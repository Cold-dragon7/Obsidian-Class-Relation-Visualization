import { Rect } from "svg.js";

type ConnectorArray = [string, string, string, string, string, string, string, string, string, string];
enum ConnectionType {None = 0, Inheritance, Composition, Aggregation}

export class Node {

    className : string = "";
    inheritance : string[] = [];
    composition : string[] = [];
    aggregation : string[] = [];
    comment : string = "";
    tag : string = "";

    rect : Rect;
    connector : ConnectorArray = ["", "", "", "", "", "", "", "", "", ""];     // 위 5, 아래 5개씩. 연결되는 노드 이름 저장
    
    constructor(className : string, inheritance : string[], composition : string[], 
        aggregation : string[], comment : string, tag : string) {
        this.className = className;
        this.inheritance = inheritance;
        this.composition = composition;
        this.aggregation = aggregation;
        this.comment = comment;
        this.tag = tag;
    }

    tryConnect(index : number, refNodeName : string) : boolean {
        if(this.connector[index] != "") {
            return false;
        }
        else {
            // 양쪽 노드 모두 가능할 때 연결해야 하는데 그 로직 고민해야함
            // 매개변수 하나 더 받아서 상대 노드의 점검이 완료됐는지 확인해도 괜찮을듯
            return true;
        }
    }
}

export class Connection {
    startNode : string = "";
    endNode : string = "";
    type : ConnectionType = 0;
}