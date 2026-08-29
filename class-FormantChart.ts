import { move, start, up } from "./drag-and-drop.js";
import tippy from "tippy.js";

type ConstructorParams = {
    figWidth: number;
    figHeight: number;
    figMargin: number;
    trapezoidRatio: number;
    horizontalLines: number;
    verticalLines: number;
    dotRadius: number;
    dotFillColor: string;
    fontSize: number;
    fontFamily: string;
    markType: "labeled-dot" | "label-only" | "dot-only";
    gridLineColor: string;
    gridLineWidth: number;
    trapezoidLineColor: string;
    trapezoidLineWidth: number;
};

type Range = {
    f1Min: number;
    f1Max: number;
    f2Min: number;
    f2Max: number;
} | undefined;

export class FormantChart {
    p: ConstructorParams;
    data: string[][];
    canvasElement: JQuery<HTMLElement>;
    paper: Paper;
    elementId: string;
    range: Range;

    constructor(parameters: ConstructorParams, elementId: string) {
        this.p = parameters;
        this.elementId = elementId;
        this.canvasElement = $('#' + this.elementId);
        this.range = undefined;
        this.data = [];
        this.paper = new Paper(this.elementId, this.p.figWidth, this.p.figHeight);
    }

    draw = () => {
        $('svg').remove();

        this.canvasElement.width(this.p.figWidth);
        this.canvasElement.height(this.p.figHeight);

        this.paper = new Paper(this.elementId, this.p.figWidth, this.p.figHeight);

        this.drawHorizontalLines();
        this.drawVerticalLines();
        this.drawTrapezoid();
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].length > 3) {
                this.plotPoint(this.data[i][1], this.data[i][2], this.data[i][0], i, this.data[i][3]);
            } else {
                this.plotPoint(this.data[i][1], this.data[i][2], this.data[i][0], i);
            }
        }

        const chart = this;
        this.canvasElement.on("mousemove", function (event: { clientX: number; clientY: number; }) {
            const bnds = document.getElementById(chart.elementId)?.getBoundingClientRect();
            const width = chart.canvasElement.width();
            const height = chart.canvasElement.height();
            if (bnds && width && height) {
                const fx = (event.clientX - bnds.left) / bnds.width * width;
                const fy = (event.clientY - bnds.top) / bnds.height * height;
                $('#coordinates').text('F1: ' + chart.f1(fy) + ', F2: ' + chart.f2(fx));
            }
        });

        this.canvasElement.on("mouseleave", function () {
            $('#coordinates').text("");
        });

        tippy('[data-tippy-content]', {
            allowHTML: true,
            theme: 'light-border',
        });

        this.updateHighlights();
    };

    drawTrapezoid = () => {
        const command = "M" + this.plotLeft() + "," + this.plotTop() + "H" + this.plotRight() + "V" + this.plotBottom() + "H" + (this.plotRight() - this.p.trapezoidRatio * this.plotWidth()) + "L" + this.plotLeft() + "," + this.plotTop();
        const p = this.paper.path(command);
        p.attr("stroke-width", this.p.trapezoidLineWidth);
        p.attr("stroke", this.p.trapezoidLineColor);
        p.attr("fill", "none");
    };

    drawHorizontalLines = () => {
        const intervalSize = this.plotHeight() / (1 + this.p.horizontalLines);
        for (let i = 1; i <= this.p.horizontalLines; i++) {
            const y = i * intervalSize;
            const right = this.plotRight();
            const left = this.plotLeft() + y * ((1 - this.p.trapezoidRatio) * this.plotWidth()) / this.plotHeight();
            const command = "M" + right + "," + (this.plotTop() + y) + "L" + left + "," + (this.plotTop() + y);
            const p = this.paper.path(command);
            p.attr("stroke-width", this.p.gridLineWidth);
            p.attr("stroke", this.p.gridLineColor);
        }
    };

    drawVerticalLines = () => {
        const intervalSize = this.plotWidth() / (1 + this.p.verticalLines);
        for (let i = 1; i <= this.p.verticalLines; i++) {
            const command = "M" + (this.plotRight() - i * intervalSize) + "," + this.plotTop() + "L" + (this.plotRight() - i * intervalSize * this.p.trapezoidRatio) + "," + this.plotBottom();
            const p = this.paper.path(command);
            p.attr("stroke-width", this.p.gridLineWidth);
            p.attr("stroke", this.p.gridLineColor);
        }
    };

    plotPoint = (f1: string, f2: string, label: string, index: string | number, title?: string) => {
        if (typeof index === "number") {
            index = index.toString();
        }
        title = typeof title !== 'undefined' ? title : '';
        const x = this.positionX(parseInt(f2));
        const y = this.positionY(parseInt(f1));
        let text, point;
        if (this.p.markType == "labeled-dot") {
            point = this.drawDot(x, y);
            text = this.drawText(x + 2 * this.p.dotRadius, y - 2 * this.p.dotRadius, label, true);
        } else if (this.p.markType == "label-only") {
            text = this.drawText(x + 2 * this.p.dotRadius, y - 2 * this.p.dotRadius, label, false);
        } else if (this.p.markType == "dot-only") {
            point = this.drawDot(x, y);
        }
        // TODO: This works, but it's a bit weird how there are identical tooltips on two different objects.
        //  Maybe make an invisible ellipse around everything that has the hover? Potential issue with overlap on nearby points, though.
        if (typeof text !== 'undefined') {
            text.node.setAttribute("data-tippy-content", this.formatToolTip(f1, f2, label, title));
            text.node.setAttribute("data-index", index);
        }
        if (typeof point !== 'undefined') {
            point.node.setAttribute("data-tippy-content", this.formatToolTip(f1, f2, label, title));
            point.node.setAttribute("data-index", index);
        }
    };

    drawDot = (x: number, y: number) => {
        const d = this.paper.circle(x, y, this.p.dotRadius);
        d.attr("fill", this.p.dotFillColor);
        d.attr("stroke-width", 0);
        return d;
    };

    drawText = (x: number, y: number, label: string, startAnchor: boolean) => {
        const t = this.paper.text(x, y, label);
        if (startAnchor) {
            t.attr("text-anchor", "start");
        }
        t.attr("font-family", this.p.fontFamily);
        t.attr("font-size", this.p.fontSize);
        t.node.setAttribute("class", "draggable");
        t.drag(move, start, up);
        return t;
    };

    formatToolTip = (x: string, y: string, label: string, title: string) => {
        return "<p>" + label + " (" + x + ", " + y + ")</p><p>" + title + "</p>";
    };

    positionY = (f1: number) => {
        if (!this.range) {
            return 0;
        }
        return this.plotTop() + this.plotHeight() * (f1 - this.range.f1Min) / (this.range.f1Max - this.range.f1Min);
    };

    positionX = (f2: number) => {
        if (!this.range) {
            return 0;
        }
        return this.plotRight() - this.plotWidth() * (f2 - this.range.f2Min) / (this.range.f2Max - this.range.f2Min);
    };

    f1(y: number) {
        if (!this.range) {
            return 0;
        }
        return Math.round(((y - this.plotTop()) / this.plotHeight()) * (this.range.f1Max - this.range.f1Min) + this.range.f1Min);
    };

    f2(x: number) {
        if (!this.range) {
            return 0;
        }
        return Math.round(((this.plotRight() - x) / this.plotWidth()) * (this.range.f2Max - this.range.f2Min) + this.range.f2Min);
    };

    plotLeft = () => {
        return this.p.figMargin;
    };

    plotRight = () => {
        return this.p.figWidth - this.p.figMargin;
    };

    plotTop = () => {
        return this.p.figMargin;
    };

    plotWidth = () => {
        return this.p.figWidth - 2 * this.p.figMargin;
    };

    plotHeight = () => {
        return this.p.figHeight - 2 * this.p.figMargin;
    };

    plotBottom = () => {
        return this.p.figHeight - this.p.figMargin;
    };

    removeFormantLimits = () => {
        this.range = undefined;
    };

    minimax = () => {
        if (!this.range) {
            const maxF1 = Math.max.apply(Math, this.data.map(function (v) {
                return parseInt(v[1]);
            }));

            const maxF2 = Math.max.apply(Math, this.data.map(function (v) {
                return parseInt(v[2]);
            }));

            const minF1 = Math.min.apply(Math, this.data.map(function (v) {
                return parseInt(v[1]);
            }));

            const minF2 = Math.min.apply(Math, this.data.map(function (v) {
                return parseInt(v[2]);
            }));

            const multiplier = 0.1;
            const F1range = maxF1 - minF1;
            const F2range = maxF2 - minF2;
            this.range = {
                f1Max: Math.round(maxF1 + multiplier * F1range),
                f2Max: Math.round(maxF2 + multiplier * F2range),
                f1Min: Math.round(minF1 - multiplier * F1range),
                f2Min: Math.round(minF2 - multiplier * F2range)
            };
        }
    };

    setData = (data: unknown) => {
        if (typeof data == "string") {
            this.data = this.parseStringTable(data);
        } else if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0]) && typeof data[0][0] === "string") {
            this.data = data;
        } else {
            console.error("Invalid data format. Expected a string or a 2D array of strings.");
            return;
        }
        this.minimax();
        this.draw();
    };

    // takes the passed formant table (TSV format + comments) and turns it into a 2D array
    parseStringTable = (plainText: string) => {
        let labels: string[] = [];
        const dataTable: string[][] = [];
        const lines = plainText.trim().split(/[\n\r]/);
        let commentPrefix = $("#ignore-lines").val();
        if (Array.isArray(commentPrefix)) {
            commentPrefix = commentPrefix[0];
        } else if (typeof commentPrefix !== "string") {
            commentPrefix = commentPrefix?.toString();
        }
        for (let i = 0; i < lines.length; i++) {
            if (!commentPrefix || commentPrefix.length === 0 || !lines[i].startsWith(commentPrefix)) {
                let line = lines[i].trim();
                if (commentPrefix && commentPrefix.length > 0)
                    line = line.split(commentPrefix)[0].trim(); // remove anything after a comment prefix
                const elements = line.split(/\t+/);
                if (elements.length >= 3) { // lines with less than 3 columns are invalid, so ignore them
                    dataTable.push(elements);
                    labels.push(elements[0]);
                }
            }
        }

        // Add the sound labels to the highlight dropdown menu
        labels = labels.filter(onlyUnique).sort();
        const $labels = $('#labels');
        const selectedLabel = $labels.val();
        $labels
            .find('option')
            .remove();
        $labels
            .append($("<option></option>"));
        $.each(labels, function (key, value) {
            $labels
                .append($("<option></option>")
                    .text(value));
        });
        if (selectedLabel && labels.includes(selectedLabel.toString())) {
            $labels.val(selectedLabel);
        }
        return dataTable;
    };

    updateHighlights = () => {
        const openAccordion = $("#highlight-accordion .ui-accordion-content-active");
        let isRegex = openAccordion.find("#highlightRE").length > 0;
        const highlightChoice = isRegex ? openAccordion.find("#highlightRE")[0] : openAccordion.find("#labels")[0];

        const chart: FormantChart = this;
        let label = $(highlightChoice).val();
        if (Array.isArray(label))
            label = label[0];
        if (typeof label === "number")
            label = label.toString();
        if (label && label.length > 0) {
            let condition: (text: string) => boolean;
            if (isRegex) {
                const re = new RegExp(label);
                condition = (text: string) => re.test(text);
            } else {
                condition = (text: string) => text === label;
            }
            $("text > tspan").each(function () {
                const $element = $(this);
                const text = $element.parent();
                const circle = $("circle[data-index=" + text.data('index') + "]");
                if (condition($(this).text())) {
                    let highlightColor = $('#highlightColor').val();
                    if (!highlightColor)
                        return;
                    if (Array.isArray(highlightColor))
                        highlightColor = highlightColor[0];
                    text.attr("fill", highlightColor);
                    circle.attr("fill", highlightColor);
                } else {
                    text.attr("fill", '#000');
                    circle.attr("fill", chart.p.dotFillColor);
                }
            });
        } else {
            $("text > tspan").each(function () {
                const text = $(this).parent();
                const circle = $("circle[data-index=" + text.data('index') + "]");
                text.attr("fill", '#000');
                circle.attr("fill", chart.p.dotFillColor);
            });
        }
    };
}

function onlyUnique(value: any, index: any, arr: any[]) {
    return arr.indexOf(value) === index;
}

export class SVGElementWrapper {
    node: SVGElement;
    tx = 0;
    ty = 0;
    odx = 0;
    ody = 0;

    constructor(node: SVGElement) {
        this.node = node;
    }

    attr(nameOrObj: string | Record<string, any>, value?: any): this {
        if (typeof nameOrObj === "string") {
            if (value !== undefined) {
                this.node.setAttribute(nameOrObj, String(value));
            }
        } else {
            for (const [key, val] of Object.entries(nameOrObj)) {
                this.node.setAttribute(key, String(val));
            }
        }
        return this;
    }

    translate(dx: number, dy: number) {
        this.tx += dx;
        this.ty += dy;
        this.node.setAttribute("transform", `translate(${this.tx}, ${this.ty})`);
    }

    animate(properties: Record<string, any>, duration: number) {
        const keyframes: Record<string, string>[] = [{}, {}];
        for (const [key, value] of Object.entries(properties)) {
            const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            keyframes[0][camelKey] = this.node.getAttribute(key) || "1";
            keyframes[1][camelKey] = String(value);
            this.node.setAttribute(key, String(value));
        }
        try {
            this.node.animate(keyframes, { duration, easing: "ease" });
        } catch (e) {
            // Fallback in case Web Animations API is not supported.
        }
    }

    drag(
        onmove: (this: SVGElementWrapper, dx: number, dy: number, x: number, y: number, event: PointerEvent) => void,
        onstart: (this: SVGElementWrapper, x: number, y: number, event: PointerEvent) => void,
        onup: (this: SVGElementWrapper, event: PointerEvent) => void
    ) {
        let dragging = false;
        let startX = 0;
        let startY = 0;

        const onPointerDown = (e: PointerEvent) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;

            this.node.style.cursor = "grabbing";

            this.node.setPointerCapture(e.pointerId);
            onstart.call(this, e.clientX, e.clientY, e);
            
            e.preventDefault();
            e.stopPropagation();
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!dragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            onmove.call(this, dx, dy, e.clientX, e.clientY, e);
            
            e.preventDefault();
            e.stopPropagation();
        };

        const onPointerUp = (e: PointerEvent) => {
            if (!dragging) return;
            dragging = false;
            this.node.style.cursor = "grab";
            try {
                this.node.releasePointerCapture(e.pointerId);
            } catch (err) {
                // Ignore capture release error
            }
            onup.call(this, e);
            
            e.preventDefault();
            e.stopPropagation();
        };

        this.node.addEventListener("pointerdown", onPointerDown as EventListener);
        this.node.addEventListener("pointermove", onPointerMove as EventListener);
        this.node.addEventListener("pointerup", onPointerUp as EventListener);
        this.node.addEventListener("pointercancel", onPointerUp as EventListener);
    }
}

export class Paper {
    svg: SVGSVGElement;

    constructor(elementId: string, width: number, height: number) {
        const container = document.getElementById(elementId);
        if (!container) {
            throw new Error(`Container element with id ${elementId} not found`);
        }
        // Create SVG element using SVG namespace
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("width", String(width));
        this.svg.setAttribute("height", String(height));
        // Append to container
        container.appendChild(this.svg);
    }

    path(d: string): SVGElementWrapper {
        const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathEl.setAttribute("d", d);
        pathEl.setAttribute("fill", "none");
        this.svg.appendChild(pathEl);
        return new SVGElementWrapper(pathEl);
    }

    circle(cx: number, cy: number, r: number): SVGElementWrapper {
        const circleEl = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circleEl.setAttribute("cx", String(cx));
        circleEl.setAttribute("cy", String(cy));
        circleEl.setAttribute("r", String(r));
        this.svg.appendChild(circleEl);
        return new SVGElementWrapper(circleEl);
    }

    text(x: number, y: number, textContent: string): SVGElementWrapper {
        const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textEl.setAttribute("x", String(x));
        textEl.setAttribute("y", String(y));
        
        // Wrap text content in a tspan to keep compatibility with jQuery selectors in gui-setup.ts
        const tspanEl = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspanEl.textContent = textContent;
        textEl.appendChild(tspanEl);
        
        this.svg.appendChild(textEl);
        return new SVGElementWrapper(textEl);
    }
}
