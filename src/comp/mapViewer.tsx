import React from "react";
import * as Cesium from "cesium";
import { CesiumMap } from "./map";
import { store } from "../data/store";
import { EventEmitter } from "@mtgoo/ctool";

export class MapViewer extends React.Component {
    private handleViewerLoaded(viewer: Cesium.Viewer) {
        let modelPath = Cesium.IonResource.fromAssetId(17732);
        let tileset = viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
                url: modelPath,
                maximumScreenSpaceError: 0.8,
            })
        ) as Cesium.Cesium3DTileset;
        viewer.zoomTo(tileset);
        document.oncontextmenu = (e) => {
            //左键--button属性=1，右键button属性=2
            if (e.button == 2) {
                e.preventDefault();
            }
        }
        store.viewer = viewer;
        let edit = new MapEdit();
    }

    render(): React.ReactNode {
        return <CesiumMap onViewerLoaded={this.handleViewerLoaded} />
    }

}

export class MapEdit {
    lines: Line3d[] = [];
    currentLine: Line3d;
    private _currentNode: Node3d;
    set currentNode(newNode: Node3d) {
        if (this._currentNode) {
            this._currentNode.ins.ellipsoid.material = Cesium.Color.RED as any;
        }
        newNode.ins.ellipsoid.material = Cesium.Color.YELLOW as any;
        this._currentNode = newNode;

        if (this._currentNode.beLast == false) {
            //在node节点周边添加tempt node


        }
    }
    get currentNode() { return this._currentNode }
    constructor() {
        this.currentLine = new Line3d();

        let viewer = store.viewer;
        let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        let canCreate = true;
        let downTime: number;
        let pickedEntity: Cesium.Entity;
        handler.setInputAction((event) => {
            if (this.currentLine) {
                let feature = viewer.scene.pick(event.position);
                console.log(feature);
                if (feature?.id != null && feature.id instanceof Cesium.Entity) {
                    let newPick = feature.id;
                    viewer.scene.screenSpaceCameraController.enableInputs = false;
                    canCreate = false;
                    pickedEntity = newPick;
                    if ((newPick as SphereEntity).__node != null) {
                        this.currentLine = (newPick as SphereEntity).__line;
                        this.currentNode = (newPick as SphereEntity).__node as any;
                    }
                } else {
                    canCreate = true;
                    downTime = Date.now();
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        handler.setInputAction((event) => {
            if (this.currentLine) {
                if (canCreate && (Date.now() - downTime) < 500) {
                    let ray = viewer.camera.getPickRay(event.position);
                    let picked = (viewer.scene as any).pickFromRay(ray, viewer.entities.values);
                    if (picked?.position) {
                        this.currentNode = this.currentLine.addNode(picked.position);
                    }
                }
            }
            pickedEntity = null;
            viewer.scene.screenSpaceCameraController.enableInputs = true;
            canCreate = true;
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        handler.setInputAction((event) => {
            canCreate = false;
            if (pickedEntity) {
                let ray = viewer.camera.getPickRay(event.endPosition);
                let picked = (viewer.scene as any).pickFromRay(ray, viewer.entities.values);
                if (picked?.position) {
                    pickedEntity.position = picked.position
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    addLine() {
        this.lines.push(new Line3d());
    }
}

export class Line3d {
    nodes: Node3d[] = [];
    ins: Cesium.Entity;
    constructor() {
        let viewer = store.viewer;
        this.ins = viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(() => this.nodes.map(el => el.ins.position.getValue(Cesium.JulianDate.now())), false),
                material: Cesium.Color.BLUE,
                width: 5,
                depthFailMaterial: Cesium.Color.BLUE,
            }
        })
    }

    addNode(pos: Cesium.Cartesian3) {
        let node = new Node3d(pos, this);
        this.nodes.push(node);
        return node;
    }
}

type SphereEntity = Cesium.Entity & { __line: Line3d, __node: Node3d | TemptNode3d }

export class Node3d {
    readonly ins: SphereEntity;
    private line: Line3d;
    constructor(pos: Cesium.Cartesian3, line: Line3d) {
        this.line = line;
        let viewer = store.viewer;
        this.ins = viewer.entities.add({
            position: pos,
            ellipsoid: {
                radii: new Cesium.Cartesian3(1.0, 1.0, 1.0),
                material: Cesium.Color.RED,
            },
        }) as any;
        this.ins.__line = line;
        this.ins.__node = this;
    }

    get beLast() {
        return this.line.nodes[this.line.nodes.length - 1] == this;
    }

}

export class TemptNode3d {
    readonly ins: SphereEntity;
    private line: Line3d;
    constructor(pos: Cesium.Cartesian3) {
        let viewer = store.viewer;
        this.ins = viewer.entities.add({
            position: pos,
            ellipsoid: {
                radii: new Cesium.Cartesian3(1.0, 1.0, 1.0),
                material: Cesium.Color.RED,
                outline: true
            },
        }) as any;
        this.ins.__node = this;
    }
}

// let sphere = new Cesium.SphereGeometry({ radius: 0.5 });
// const geometry = Cesium.SphereGeometry.createGeometry(sphere);
// let modelToWorldMatrix = Cesium.Matrix4.fromTranslationQuaternionRotationScale(pos, Cesium.Quaternion.IDENTITY, new Cesium.Cartesian3(1, 1, 1));
// this.ins = viewer.scene.primitives.add(new Cesium.Primitive({
//     geometryInstances: new Cesium.GeometryInstance({
//         geometry: geometry,
//         modelMatrix: modelToWorldMatrix,
//     }),
//     appearance: new Cesium.EllipsoidSurfaceAppearance({
//         aboveGround: false,
//         renderState: {
//             cull: {
//                 enabled: false,
//             }
//         },
//         material: new Cesium.Material({
//             fabric: {
//                 type: 'Color',
//                 uniforms: {
//                     color: new Cesium.Color(1.0, 1.0, 0.0, 1.0)
//                 }
//             }
//         })
//     }),
//     asynchronous: false,
// }));