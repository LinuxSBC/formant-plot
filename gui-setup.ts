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
        markType: "labeled-dot", //    markType: "label-only",
//    markType: "dot-only",
        gridLineColor: "#aaaaaa",
        gridLineWidth: 1,
        trapezoidLineColor: "#000000",
        trapezoidLineWidth: 2,
    }, "canvas");
    chart.setData($("#formant-values").val());

    bindDataControls(chart);

    let shifted = false;
    $(document).on('keyup keydown', function (e) {
        shifted = e.shiftKey;
        if (shifted) {
            $('#canvas').addClass('crosshairs');
        } else {
            $('#canvas').removeClass('crosshairs');
            $('#coordinates').text("");
        }
        if (e.key === "p") {
            praatInput();
        }
    });

    $("#tabs").tabs();

    $("#generate-button")
        .button()
        .click(function () {
            chart.setData($("#formant-values").val());
            return false;
        });

// http://stackoverflow.com/a/18197341/1447002
    function download(filename: string, text: string) {
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
        .click(function () {
            download('chart.svg', chart.paper.toSVG());
        });

    $("#min-max")
        .button()
        .click(function () {
            chart.removeFormantLimits();
            chart.minimax();
            setGuiElementsFromData(chart);
            chart.draw();
        });

    const intermediateLineColor = document.getElementById("intermediateLineColor");
    intermediateLineColor.addEventListener("input", function (event) {
        chart.p.gridLineColor = event.target.value;
        chart.draw();
    });
    intermediateLineColor.addEventListener("change", function (event) {
        chart.p.gridLineColor = event.target.value;
        chart.draw();
    });

    $("#update-highlight")
        .button()
        .click(function () {
            let highlightRE = $('#highlightRE').val();
            if (Array.isArray(highlightRE))
                highlightRE = highlightRE[0];
            if (typeof highlightRE === "number")
                highlightRE = highlightRE.toString();
            if (highlightRE.length > 0) {
                const re = new RegExp(highlightRE);
                $("text > tspan").each(function () {
                    const text = $(this).parent();
                    const circle = $("circle[data-index=" + text.data('index') + "]");
                    if (re.test($(this).text())) {
                        let highlightColor = $('#highlightColor').val();
                        if (Array.isArray(highlightColor))
                            highlightColor = highlightColor[0];
                        text.attr("fill", highlightColor);
                        circle.attr("fill", highlightColor);
                    } else {
                        text.attr("fill", '#000');
                        circle.attr("fill", chart.p.dotFillColor);
                    }
                });
            }
        });

    $('#labels').on("change", function () {
        let label = $(this).val();
        if (Array.isArray(label))
            label = label[0];
        if (typeof label === "number")
            label = label.toString();
        if (label.length > 0) {
            $("text > tspan").each(function () {
                const text = $(this).parent();
                const circle = $("circle[data-index=" + text.data('index') + "]");
                if ($(this).text() === label) {
                    let highlightColor = $('#highlightColor').val();
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
    });

    const trapezoidLineColor = document.getElementById("trapezoidLineColor");
    trapezoidLineColor.addEventListener("input", function (event) {
        chart.p.trapezoidLineColor = event.target.value;
        chart.draw();
    });
    trapezoidLineColor.addEventListener("change", function (event) {
        chart.p.trapezoidLineColor = event.target.value;
        chart.draw();
    });

    const dotColor = document.getElementById("dotColor");
    dotColor.addEventListener("input", function (event) {
        chart.p.dotFillColor = event.target.value;
        chart.draw();
    });
    dotColor.addEventListener("change", function (event) {
        chart.p.dotFillColor = event.target.value;
        chart.draw();
    });

    $("#accordion").accordion({ autoHeight: false });
    $("#highlight-accordion").accordion({ autoHeight: false });

    function praatInput() {
        const input = prompt("Copy line from the Praat's “Formant listing” command.", "");
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