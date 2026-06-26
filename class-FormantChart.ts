import { move, start, up } from "./drag-and-drop.js";
import { RaphaelPaper } from "raphael";

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
    markType: string;
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
    data: any;
    canvasElement: JQuery<HTMLElement>;
    paper: RaphaelPaper;
    elementId: string;
    range: Range;

    constructor(parameters: ConstructorParams, elementId: string) {
        this.p = parameters;
        this.elementId = elementId;
        this.canvasElement = $('#' + this.elementId);
        this.range = undefined;
    }

    draw() {
        $('svg').remove();

        this.canvasElement.width(this.p.figWidth);

        this.paper = Raphael(this.elementId, this.p.figWidth, this.p.figHeight);

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

        window.chart.canvasElement.mousemove(function (event: { clientX: number; clientY: number; }) {
            if (window.shifted) {
                const bnds = document.getElementById(window.chart.elementId).getBoundingClientRect();
                const fx = (event.clientX - bnds.left) / bnds.width * window.chart.canvasElement.width();
                const fy = (event.clientY - bnds.top) / bnds.height * window.chart.canvasElement.height();
                $('#coordinates').text('F1: ' + window.chart.f1(fy) + ', F2: ' + window.chart.f2(fx));
            }
        });

        $('#' + this.elementId).on("mouseleave", function () {
            $('#coordinates').text("");
        });

        $('[title!=""]').qtip({ style: { classes: 'qtip-shadow custom-qtip' } });
    };

    toSvg() {
        const svgCode = this.paper.toSVG();
        const a = document.createElement('a');
        a.download = 'mySvg.svg';
        a.type = 'image/svg+xml';
        const blob = new Blob([svgCode], { "type": "image/svg+xml" });
        a.href = (window.URL || webkitURL).createObjectURL(blob);
        a.click();
    };

    drawTrapezoid() {
        const command = "M" + this.plotLeft() + "," + this.plotTop() + "H" + this.plotRight() + "V" + this.plotBottom() + "H" + (this.plotRight() - this.p.trapezoidRatio * this.plotWidth()) + "L" + this.plotLeft() + "," + this.plotTop();
        const p = this.paper.path(command);
        p.attr("stroke-width", this.p.trapezoidLineWidth);
        p.attr("stroke", this.p.trapezoidLineColor);
    };

    drawHorizontalLines() {
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

    drawVerticalLines() {
        const intervalSize = this.plotWidth() / (1 + this.p.verticalLines);
        for (let i = 1; i <= this.p.verticalLines; i++) {
            const command = "M" + (this.plotRight() - i * intervalSize) + "," + this.plotTop() + "L" + (this.plotRight() - i * intervalSize * this.p.trapezoidRatio) + "," + this.plotBottom();
            const p = this.paper.path(command);
            p.attr("stroke-width", this.p.gridLineWidth);
            p.attr("stroke", this.p.gridLineColor);
        }
    };

    plotPoint(f1: string, f2: string, label: string, index: string | number, title?: string) {
        title = typeof title !== 'undefined' ? title : '';
        const x = this.positionX(parseInt(f2));
        const y = this.positionY(parseInt(f1));
        let t, d;
        if (this.p.markType == "labeled-dot") {
            d = this.drawDot(x, y);
            t = this.drawText(x + 2 * this.p.dotRadius, y - 2 * this.p.dotRadius, label, true);
        } else if (this.p.markType == "label-only") {
            t = this.drawText(x + 2 * this.p.dotRadius, y - 2 * this.p.dotRadius, label, false);
        } else if (this.p.markType == "dot-only") {
            d = this.drawDot(x, y);
        }
        if (typeof t !== 'undefined') {
            t.node.setAttribute("title", this.formatToolTip(f1, f2, label, title));
            t.node.setAttribute("data-index", index);
        }
        if (typeof d !== 'undefined') {
            d.node.setAttribute("title", this.formatToolTip(f1, f2, label, title));
            d.node.setAttribute("data-index", index);
        }
    };

    drawDot(x, y) {
        const d = this.paper.circle(x, y, this.p.dotRadius);
        d.attr("fill", this.p.dotFillColor);
        d.attr("stroke-width", 0);
        return d;
    };

    drawText(x: number, y: number, label: string, startAnchor: boolean) {
        const t = this.paper.text(x, y, label);
        if (startAnchor === true) {
            t.attr("text-anchor", "start");
        }
        t.attr("font-family", this.p.fontFamily);
        t.attr("font-size", this.p.fontSize);
        t.node.setAttribute("class", "draggable");
        t.drag(move, start, up);
        return t;
    };

    formatToolTip(x, y, label, title) {
        return "<p>" + label + " (" + x + ", " + y + ")</p><p>" + title + "</p>";
    };

    positionY(f1: number) {
        return this.plotTop() + this.plotHeight() * (f1 - this.range.f1Min) / (this.range.f1Max - this.range.f1Min);
    };

    positionX(f2: number) {
        return this.plotRight() - this.plotWidth() * (f2 - this.range.f2Min) / (this.range.f2Max - this.range.f2Min);
    };

    f1(y: number) {
        return Math.round(((y - this.plotTop()) / this.plotHeight()) * (this.range.f1Max - this.range.f1Min) + this.range.f1Min);
    };

    f2(x: number) {
        return Math.round(((this.plotRight() - x) / this.plotWidth()) * (this.range.f2Max - this.range.f2Min) + this.range.f2Min);
    };

    plotLeft() {
        return this.p.figMargin;
    };

    plotRight() {
        return this.p.figWidth - this.p.figMargin;
    };

    plotTop() {
        return this.p.figMargin;
    };

    plotWidth() {
        return this.p.figWidth - 2 * this.p.figMargin;
    };

    plotHeight() {
        return this.p.figHeight - 2 * this.p.figMargin;
    };

    plotBottom() {
        return this.p.figHeight - this.p.figMargin;
    };

    removeFormantLimits() {
        this.range = undefined;
    };

    minimax() {
        if (!this.range) {
            const maxF1 = Math.max.apply(Math, this.data.map(function (v) {
                return v[1];
            }));

            const maxF2 = Math.max.apply(Math, this.data.map(function (v) {
                return v[2];
            }));

            const minF1 = Math.min.apply(Math, this.data.map(function (v) {
                return v[1];
            }));

            const minF2 = Math.min.apply(Math, this.data.map(function (v) {
                return v[2];
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

    setData(data) {
        if (this.toType(data) == "string") {
            this.data = this.parseStringTable(data);
        } else {
            this.data = data;
        }
        this.minimax();
        this.draw();
    };

    parseStringTable(plainText: string) {
        let labels = [];
        const dataTable = [];
        const lines = plainText.trim().split(/[\n\r]/);
        const commentPrefix = $("#ignore-lines").val();
        for (let i = 0; i < lines.length; i++) {
            if (commentPrefix.length === 0 || commentPrefix != lines[i].substr(0, commentPrefix.length)) {
                const elements = lines[i].trim().split(/\t+/);
                dataTable.push(elements);
                labels.push(elements[0]);
            }
        }
        labels = labels.filter(onlyUnique).sort();
        const labelsElement = $('#labels');
        labelsElement
            .find('option')
            .remove();
        labelsElement
            .append($("<option></option>"));
        $.each(labels, function (key, value) {
            labelsElement
                .append($("<option></option>")
                    .text(value));
        });
        return dataTable;
    };

    /// utility functions
    toType(obj: object) {
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)?.[1].toLowerCase();
    };
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
