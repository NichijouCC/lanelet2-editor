import React from "react";
import { Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import "./app.less";
import { MapData } from "./data/mapData";
import { TreeComp } from "./comp/tree";
import { Inspector } from "./comp/inspector";

import { PartitionOutlined, FlagOutlined } from "@ant-design/icons"
import { MapViewer } from "./comp/mapViewer";

export class App extends React.Component<{}, { map: MapData, maps: MapData[] }> {
    constructor(props) {
        super(props);
        this.state = {
            map: null,
            maps: []
        }
    }

    render() {
        let { map, maps } = this.state;
        return (
            <React.Fragment>
                {/* <MapViewer /> */}
                <div className="left-ui">
                    <div className="top-ui">
                        <div className="row-title">当前地图</div>
                        <Select size="small" className="select" value={map?.id} onSelect={(el, opt) => {
                            this.setState({ map: (opt as any).bind });
                        }}>
                            {maps.map(el => <Select.Option key={el.id} value={el.id} bind={el}>{el.name}</Select.Option>)}
                        </Select>
                        <PlusOutlined onClick={() => {
                            let map = new MapData();
                            map.changeName.addEventListener(() => this.forceUpdate());
                            this.setState({ map, maps: maps.concat(map) })
                        }} />
                    </div>
                    <MapViewer />
                </div>
                <div className="right-ui">
                    <div className="tree-viewer">
                        <div className="flex-center">
                            <PartitionOutlined />
                            <div>节点树</div>
                        </div>
                        <TreeComp data={map} />
                    </div>
                    <div className="inspector-viewer">
                        <div className="flex-center">
                            <FlagOutlined />
                            <div>节点详情</div>
                        </div>
                        <Inspector />
                    </div>
                </div>
            </React.Fragment >
        )
    }
}

export function Row(props: { title: string, children: React.ReactNode | React.ReactNode[] }) {
    return <div className="row">
        <div className="row-title">{props.title}</div>
        {props.children}
    </div>
}



