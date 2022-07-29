import React from "react";
import * as Cesium from "cesium";
import { CesiumMap } from "./map";

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
    }

    render(): React.ReactNode {
        return <CesiumMap onViewerLoaded={this.handleViewerLoaded} />
    }

}