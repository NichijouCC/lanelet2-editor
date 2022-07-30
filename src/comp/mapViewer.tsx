import React from "react";
import * as Cesium from "cesium";
import { CesiumMap } from "./map";
import { store } from "../data/store";

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
    private currentState: IState
    constructor() {
        this.currentState = new EdgeState();
        this.initPicker();
    }

    initPicker() {
        let viewer = store.viewer;
        let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        handler.setInputAction((event) => {
            if (this.currentState.enableLeftClick) {
                let ray = viewer.camera.getPickRay(event.position);
                let picked = (viewer.scene as any).pickFromRay(ray, viewer.entities.values);
                if (picked?.position) {
                    this.currentState?.onLeftClick(picked.position);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction((event) => {
            if (this.currentState.enableMouseMove) {
                let ray = viewer.camera.getPickRay(event.endPosition);
                let picked = (viewer.scene as any).pickFromRay(ray, viewer.entities.values);
                if (picked?.position) {
                    this.currentState?.onMouseMove(picked.position);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction((event) => {

        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    }
}



interface IState {
    enableLeftClick: boolean
    enableMouseMove: boolean
    //pick 3dtiles
    onLeftClick(pos: Cesium.Cartesian3)
    //鼠标移动，pick 3dtiles
    onMouseMove(pos: Cesium.Cartesian3)
}

export class EdgeState implements IState {
    enableMouseMove: boolean;
    enableLeftClick: boolean = true;
    onLeftClick(pos: Cesium.Cartesian3) {
        CreateNode3d(pos, store.viewer);
    }
    onMouseMove(pos: Cesium.Cartesian3) {
        throw new Error("Method not implemented.");
    }
}

export function CreateNode3d(pos: Cesium.Cartesian3, viewer: Cesium.Viewer) {
    let sphere = new Cesium.SphereGeometry({ radius: 0.5 });
    const geometry = Cesium.SphereGeometry.createGeometry(sphere);
    let modelToWorldMatrix = Cesium.Matrix4.fromTranslationQuaternionRotationScale(pos, Cesium.Quaternion.IDENTITY, new Cesium.Cartesian3(1, 1, 1));
    let node = viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: geometry,
            modelMatrix: modelToWorldMatrix,
        }),
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround: false,
            renderState: {
                cull: {
                    enabled: false,
                }
            },
            material: new Cesium.Material({
                fabric: {
                    type: 'Color',
                    uniforms: {
                        color: new Cesium.Color(1.0, 1.0, 0.0, 1.0)
                    }
                }
            })
        }),
        asynchronous: false,
    }));
    return node
}