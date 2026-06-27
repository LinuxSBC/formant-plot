// http://stackoverflow.com/questions/4224359/making-paths-and-images-dragable-in-raphael-js

import { RaphaelElement } from "raphael";
interface DraggableElement extends RaphaelElement {
    odx: number;
    ody: number;
}

export function start(this: DraggableElement) {
    this.odx = 0;
    this.ody = 0;
    this.animate({ "fill-opacity": 0.2 }, 500);
}

export function move(this: DraggableElement, dx: number, dy: number) {
    this.translate(dx - this.odx, dy - this.ody);
    this.odx = dx;
    this.ody = dy;
}

export function up(this: DraggableElement) {
    this.animate({ "fill-opacity": 1 }, 500);
}
