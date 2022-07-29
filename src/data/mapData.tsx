import { EventTarget, UUID } from "@mtgoo/ctool";
import * as Cesium from "cesium";

interface IMapData {
    id: string;
    name: string;
    roads: IRoadData[];
    areas: IAreaData[];
}
export interface IRoadData {
    id: string;
    name: string;
    edges: EdgeData[];
    points: Cesium.Cartesian3[];
}

export interface IAreaData {
    id: string;
    name: string;
}


export interface IRoadBorderData {
    id: string;
    name: string;
    type: string;
    beLeft: boolean;
    points: Cesium.Cartesian3[];
}

export class MapData implements IMapData {
    id: string;
    private _name: string;
    set name(value: string) { this._name = value; this.changeName.raiseEvent() }
    get name() { return this._name }
    changeName = new EventTarget();
    roads: RoadData[];
    areas: AreaData[];

    constructor() {
        this.id = UUID.create_v4();
        this.name = "新地图";
        this.roads = [];
        this.areas = [];
    }

    createRoad(): RoadData {
        let road = new RoadData(this);
        this.roads.push(road);
        return road;
    }
    createArea(): AreaData {
        let area = new AreaData(this);
        this.areas.push(area);
        return area;
    }
}

export class RoadData implements IRoadData {
    id: string;
    name: string;
    edges: EdgeData[];
    points: Cesium.Cartesian3[];
    private _map: MapData;
    constructor(map: MapData) {
        this._map = map;
        this.id = UUID.create_v4();
        this.name = "新车道";
        this.edges = [];
        this.points = [];
    }

    createEdge(type: "left" | "right") {
        let edge = new EdgeData(type, this);
        this.edges.push(edge);
        return edge;
    }

    dispose() {
        let index = this._map.roads.indexOf(this);
        this._map.roads.splice(index, 1);
    }
}


export class EdgeData {
    type: "left" | "right";
    id: string;
    name: string;
    private _road: RoadData;

    constructor(type: "left" | "right", road: RoadData) {
        this._road = road;
        this.type = type;
        this.name = "新边界";
        this.id = UUID.create_v4()
    }

    dispose() {
        let index = this._road.edges.indexOf(this);
        this._road.edges.splice(index, 1);
    }
}

export class AreaData implements IAreaData {
    id: string;
    name: string;
    private _map: MapData;
    constructor(map: MapData) {
        this._map = map;
        this.id = UUID.create_v4();
        this.name = "新区域";
    }

    dispose() {
        let index = this._map.areas.indexOf(this);
        this._map.areas.splice(index, 1);
    }
}
