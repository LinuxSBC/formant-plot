// CSS imports
// Vite will automatically bundle these into a single optimized stylesheet
import 'jquery-ui/dist/themes/base/jquery-ui.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import 'tippy.js/animations/shift-away.css';
import './formant-chart.css';

// JS imports
import $ from './jquery-setup.js';
import 'jquery-ui/dist/jquery-ui.js';

import { FormantChart } from "./class-FormantChart.js";
import { bindDataControls, setGuiElementsFromData } from "./data-binding.js";

jQuery(function() {
    $('#control-panel > h1').on("click", function () {
        $(this).next().toggle();
    });

    const chart = new FormantChart({
        figWidth: 600,
        figHeight: 400,
        figMargin: 10,
        trapezoidRatio: 0.7,
        horizontalLines: 2,
        verticalLines: 1,
        dotRadius: 2,
        dotFillColor: "#000000",
        fontSize: 15,
        fontFamily: "Charis SIL",
        markType: "labeled-dot",
        gridLineColor: "#aaaaaa",
        gridLineWidth: 1,
        trapezoidLineColor: "#000000",
        trapezoidLineWidth: 2,
    }, "canvas");
    chart.setData($("#formant-values").val());

    bindDataControls(chart);

    $(document).on('keyup keydown', function (e) {
        if (e.key === "p") {
            praatInput();
        }
    });

    $("#tabs").tabs();

    $("#generate-button")
        .button()
        .on("click", function () {
            chart.setData($("#formant-values").val());
            return false;
        });

    // http://stackoverflow.com/a/18197341/1447002
    function download(filename: string, text?: string) {
        if (!text) {
            return;
        }
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    $("#download-button")
        .button()
        .on("click", function () {
            download('chart.svg', document.getElementById(chart.elementId)?.innerHTML);
        });

    $("#min-max")
        .button()
        .on("click", function () {
            chart.removeFormantLimits();
            chart.minimax();
            setGuiElementsFromData(chart);
            chart.draw();
        });

    const intermediateLineColor = document.getElementById("intermediateLineColor") as HTMLInputElement;
    intermediateLineColor.addEventListener("input", function () {
        chart.p.gridLineColor = intermediateLineColor.value;
        chart.draw();
    });
    intermediateLineColor.addEventListener("change", function () {
        chart.p.gridLineColor = intermediateLineColor.value;
        chart.draw();
    });

    const trapezoidLineColor = document.getElementById("trapezoidLineColor") as HTMLInputElement;
    trapezoidLineColor.addEventListener("input", function () {
        chart.p.trapezoidLineColor = trapezoidLineColor.value;
        chart.draw();
    });
    trapezoidLineColor.addEventListener("change", function () {
        chart.p.trapezoidLineColor = trapezoidLineColor.value;
        chart.draw();
    });

    const dotColor = document.getElementById("dotColor") as HTMLInputElement;
    dotColor.addEventListener("input", function () {
        chart.p.dotFillColor = dotColor.value;
        chart.draw();
    });
    dotColor.addEventListener("change", function () {
        chart.p.dotFillColor = dotColor.value;
        chart.draw();
    });

    $("#accordion").accordion({ heightStyle: "content" });
    $("#highlight-accordion").accordion({ heightStyle: "content" });

    function praatInput() {
        const input = prompt("Copy line from the Praat's “Formant listing” command.", "");
        if (!input)
            return;
        if (input.length > 0) {
            const regexp = /^[0-9]+\.[0-9]+\s+([0-9]+\.[0-9]+)\s+([0-9]+\.[0-9]+)/;
            const match = regexp.exec(input);
            if (match !== null && match.length === 3) {
                $("text[data-index='-999']").remove();
                $("circle[data-index='-999']").remove();
                chart.plotPoint(match[1], match[2], "Praat", "-999", "Praat");
            }
        }
    }

// end of onReady
});