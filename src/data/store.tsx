import { useEffect, useState } from "react";
import { DebuffAction, EventEmitter, IProxyEvents } from "@mtgoo/ctool";
import { IMenu } from "../comp/treeMenu";
import React from "react";


export interface IStore {
    chooseNodeId: string;
    hoverNodeId: string;
    editingNodeId: string;
    menu: IMenu;
}

export function useStore<T extends IStore, P extends keyof T>(attName: P): T[P] {
    let [att, setAtt] = useState(store[attName as any]);
    useEffect(() => {
        let handler = (ev: { att: string; newValue: any; oldValue: any; }) => setAtt(ev.newValue);
        store.on(attName as any, handler);
        return () => {
            store.off(attName as any, handler);
        };
    }, []);
    return att;
}


export function mapStoreToProps(atts: string[]) {
    return (Comp: Function) => {
        return class extends React.Component {
            private _debuffAction: DebuffAction;
            componentDidMount() {
                this._debuffAction = DebuffAction.create();
                atts.forEach(item => {
                    let handler = (ev: { newValue: any, oldValue: any }) => {
                        let attState = {};
                        attState[item] = ev.newValue;
                        this.setState(attState);
                    };
                    store.on(item as any, handler);
                    this._debuffAction.appendDebuff(() => {
                        store.off(item as any, handler);
                    })
                });
            }
            componentWillUnmount() {
                this._debuffAction.dispose();
            }
            render() {
                let newProps = { ...this.props, ...this.state };
                return (<Comp {...newProps} />)
            }
        } as any
    }
}


export class ObservableData<T extends object = {}, K extends object = {}> extends EventEmitter<IProxyEvents<T, K>> {
    private _target: object;
    private constructor(target: object) {
        super();
        this._target = target;
    }
    /**
     * 创建可监听对象，可设置对象自定义的事件类型
     * @param data
     */
    static create<T extends object, K extends object = {}>(data: T): T & ObservableData<T, K> {
        let container = new ObservableData<T>(data);
        let proxy = new Proxy(container, {
            set: function (obj, prop: string, value: any) {
                if (obj._target) {
                    let oldValue = (obj._target as any)[prop];
                    (obj._target as any)[prop] = value;
                    container.emit("setAtt", { att: prop, newValue: value, oldValue });
                    (container as any).emit(prop, { newValue: value, oldValue });
                    return true;
                }
            },
            get: function (obj, prop: string) {
                return (obj._target as any)?.[prop] ?? obj?.[prop];
            }
        });
        return proxy as any;
    }
}

export const store = ObservableData.create<IStore>(
    {
        chooseNodeId: null,
        hoverNodeId: null,
        editingNodeId: null,
        menu: {
            beActive: false,
            options: [],
            pos: []
        }
    });
