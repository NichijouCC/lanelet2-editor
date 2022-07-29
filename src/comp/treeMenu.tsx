import React, { useState } from "react";
import { store, useStore } from "../data/store";


export interface IMenu {
    beActive: boolean;
    options?: IMenuOption[];
    pos?: number[];
}

export interface IMenuOption {
    name: string;
    action?: () => void;
}

export function TreeMenu() {
    let menu = useStore("menu");
    let [hover, setHover] = useState<number>(null);

    return menu.beActive ?
        <div className="menu" style={{
            left: `${menu.pos?.[0] ?? 0}px`,
            top: `${menu.pos?.[1] ?? 0}px`
        }}>
            {menu.options?.map((el, index) => <div
                className={`${hover == index ? "beHover" : ""}`}
                key={index}
                onClickCapture={(ev) => {
                    store.menu = { beActive: false };
                    setHover(null);
                    el.action?.();
                    ev.stopPropagation();
                }}
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(null)}
            >{el.name}
            </div>)}
        </div> : null;
}
