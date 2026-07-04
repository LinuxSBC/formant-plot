import { SVGElementWrapper } from "./class-FormantChart.js";

export function start(this: SVGElementWrapper) {
    this.odx = 0;
    this.ody = 0;
    this.animate({ "fill-opacity": 0.2 }, 500);
}

export function move(this: SVGElementWrapper, dx: number, dy: number) {
    this.translate(dx - this.odx, dy - this.ody);
    this.odx = dx;
    this.ody = dy;
}

export function up(this: SVGElementWrapper) {
    this.animate({ "fill-opacity": 1 }, 500);
}
