import React, { useEffect, useRef } from "react";
import { TreeMenu, IMenuOption } from "./treeMenu";
import { store, useStore } from "../data/store";
import { MapData, IRoadData, RoadData, AreaData, IRoadBorderData, EdgeData } from "../data/mapData";
import { RightOutlined, DownOutlined } from "@ant-design/icons"
import { Input } from "antd";

export class TreeComp extends React.Component<{ data: MapData; }> {
    private ref_container = React.createRef<HTMLDivElement>();
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data,
        };
    }

    componentDidMount(): void {
        this.ref_container.current.addEventListener("click", (ev) => {
            if (ev.button == 0) {
                if (store.menu.beActive) {
                    store.menu = { beActive: false } as any;
                    store.chooseNodeId = null;
                }
                if (store.editingNodeId) {
                    store.editingNodeId = null;
                }
            }
        });
        this.ref_container.current.addEventListener("contextmenu", (ev) => {
            if (ev.button == 0) {
                if (store.menu.beActive) {
                    store.menu = { beActive: false } as any;
                    store.chooseNodeId = null;
                }
                if (store.editingNodeId) {
                    store.editingNodeId = null;
                }
            }
        });

        document.onkeydown = (ev) => {
            if (ev.key.toUpperCase() == "F2" && store.chooseNodeId) {
                store.editingNodeId = store.chooseNodeId;
            }
        }
    }

    render(): React.ReactNode {
        let { data } = this.props;
        return <div id="tree-container" ref={this.ref_container}>
            <TreeMenu />
            {data && <NodeComp show={true} layer={0} target={data} />}
        </div >;
    }
}

export interface INodeData {
    id: string;
    name: string;
}


function getMenuOptions(target: object): IMenuOption[] {
    if (target instanceof MapData) {
        return [
            {
                name: "重命名", action: () => {
                    store.chooseNodeId = target.id;
                    store.editingNodeId = target.id;
                }
            },
            {
                name: "添加车道", action: () => {
                    let road = target.createRoad();
                    store.chooseNodeId = road.id;
                }
            },
            {
                name: "添加区域", action: () => {
                    let area = target.createArea();
                    store.chooseNodeId = area.id;
                }
            }
        ]
    } else if (target instanceof RoadData) {
        return [
            {
                name: "重命名", action: () => {
                    store.chooseNodeId = target.id;
                    store.editingNodeId = target.id;
                }
            },
            {
                name: "删除", action: () => {
                    store.chooseNodeId = target.id;
                    target.dispose();
                }
            },
            {
                name: "左边界", action: () => {
                    let edge = target.createEdge("left");
                    store.chooseNodeId = edge.id;
                }
            }, {
                name: "右边界", action: () => {
                    let edge = target.createEdge("right");
                    store.chooseNodeId = edge.id;
                }
            }
        ]
    } else if (target instanceof AreaData || target instanceof EdgeData) {
        return [
            {
                name: "重命名", action: () => {
                    store.chooseNodeId = target.id;
                    store.editingNodeId = target.id;
                }
            },
            {
                name: "删除", action: () => {
                    store.chooseNodeId = target.id;
                    target.dispose();
                }
            },
        ]
    }
    return null;
}

function getChildren(target: object) {
    if (target instanceof MapData) {
        return [...target.roads, ...target.areas]
    } else if (target instanceof RoadData) {
        return [...target.edges]
    }
    return []
}


export class NodeComp extends React.Component<{ show: boolean, layer: number, target: INodeData }, { beExpand: boolean }>{
    private _ref_input = React.createRef<Input>();
    constructor(props) {
        super(props);
        store.on("setAtt", () => this.forceUpdate())
        this.state = {
            beExpand: false,
        }
    }

    render(): React.ReactNode {
        let { layer, target, show } = this.props;
        let { beExpand } = this.state;
        let children = getChildren(target);
        return <div className="node" style={{ display: show ? "block" : "none" }}>
            <div
                className={`node-raw ${store.chooseNodeId == target.id ? "beChoose" : ""}  ${store.hoverNodeId == target.id ? "beHover" : ""}`}
                style={{ paddingLeft: `${layer * 15}px` }}
                onMouseEnter={(ev) => { store.hoverNodeId = target.id; }}
                onMouseOut={(ev) => { store.hoverNodeId = null; }}
                onClick={(ev) => { store.chooseNodeId = target.id; }}
                onContextMenu={(ev) => {
                    let options = getMenuOptions(target);
                    if (options != null) {
                        let container = document.getElementById("tree-container")
                        let bound = container.getBoundingClientRect();
                        let pos = [ev.clientX - bound.left, ev.clientY - bound.top];
                        store.menu = {
                            beActive: true,
                            pos,
                            options: options.map(el => {
                                let action = el.action
                                el.action = () => {
                                    action?.();
                                    if (!this.state.beExpand) {
                                        this.setState({ beExpand: true });
                                    }
                                    this.forceUpdate();
                                };
                                return el;
                            })
                        }
                    }
                    store.chooseNodeId = target.id;
                    ev.stopPropagation();
                    ev.preventDefault();
                }}
            >
                <div style={{ width: "14px" }} >
                    {children?.length > 0 && (beExpand ? <DownOutlined onClick={(ev) => {
                        this.setState({ beExpand: false });
                        ev.stopPropagation();
                    }} /> : <RightOutlined onClick={(ev) => {
                        this.setState({ beExpand: true })
                        ev.stopPropagation();
                    }} />)}
                </div>
                <Input ref={this._ref_input} value={target.name}
                    onChange={(ev) => {
                        target.name = ev.target.value;
                        this.forceUpdate();
                        ev.stopPropagation();
                    }}
                    onClickCapture={(ev) => ev.stopPropagation()}
                    style={{ display: store.editingNodeId == target.id ? "block" : "none" }} />
                {store.editingNodeId != target.id && <div>{target.name}</div>}
            </div>
            {children?.length > 0 && children.map((el, index) => {
                return <NodeComp show={beExpand} layer={layer + 1} target={el} key={index} />
            })}
        </div>;
    }
}
