import { FormantChart } from "./class-FormantChart.js";

export function setGuiElementsFromData(chart: FormantChart) {
    $('#trapezoid-slider').val(chart.p.trapezoidRatio);
    $('#trapezoid-number').val(chart.p.trapezoidRatio);
    $('#trapezoidLineColor').val(chart.p.trapezoidLineColor);
    $('#trapezoidLineWidth-slider').val(chart.p.trapezoidLineWidth);
    $('#trapezoidLineWidth-number').val(chart.p.trapezoidLineWidth);
    $('#hlines-slider').val(chart.p.horizontalLines);
    $('#hlines-number').val(chart.p.horizontalLines);
    $('#vlines-slider').val(chart.p.verticalLines);
    $('#vlines-number').val(chart.p.verticalLines);
    $('#intermediateLineColor').val(chart.p.gridLineColor);
    $('#intermediateLineWidth-slider').val(chart.p.gridLineWidth);
    $('#intermediateLineWidth-number').val(chart.p.gridLineWidth);
    $('#waWidth-slider').val(chart.p.figWidth);
    $('#waWidth-number').val(chart.p.figWidth);
    $('#waAspect-slider').val(Math.round(chart.p.figHeight / chart.p.figWidth * 100) / 100);
    $('#waAspect-number').val(Math.round(chart.p.figHeight / chart.p.figWidth * 100) / 100);
    $('#absWidth-slider').val(chart.p.figWidth);
    $('#absWidth-number').val(chart.p.figWidth);
    $('#absHeight-slider').val(chart.p.figHeight);
    $('#absHeight-number').val(chart.p.figHeight);
    $('#margin-slider').val(chart.p.figMargin);
    $('#margin-number').val(chart.p.figMargin);
    $('#f1min').val(chart.range.f1Min);
    $('#f1max').val(chart.range.f1Max);
    $('#f2min').val(chart.range.f2Min);
    $('#f2max').val(chart.range.f2Max);
    $('#markType').val(chart.p.markType);
    $('#fontFamily').val(chart.p.fontFamily);
    $('#fontSize').val(chart.p.fontSize);
    $('#dotColor').val(chart.p.dotFillColor.replace('#', ''))
    $('#dotRadius-slider').val(chart.p.dotRadius);
    $('#dotRadius-number').val(chart.p.dotRadius);
}

export function bindDataControls(chart) {
    function reciprocalBind(first: string, second: string) {
        $(first).on("change", function () {
            $(second).val($(this).val());
        });

        $(second).on("change", function () {
            $(first).val($(this).val());
        });
    }
    reciprocalBind("#hlines-slider", "#hlines-number");
    reciprocalBind("#vlines-slider", "#vlines-number");
    reciprocalBind("#trapezoid-slider", "#trapezoid-number");
    reciprocalBind("#intermediateLineWidth-slider", "#intermediateLineWidth-number");
    reciprocalBind("#trapezoidLineWidth-slider", "#trapezoidLineWidth-number");
    reciprocalBind("#dotRadius-slider", "#dotRadius-number");
    reciprocalBind("#waWidth-slider", "#waWidth-number");
    reciprocalBind("#waAspect-slider", "#waAspect-number");
    reciprocalBind("#absWidth-slider", "#absWidth-number");
    reciprocalBind("#absHeight-slider", "#absHeight-number");
    reciprocalBind("#margin-slider", "#margin-number");

    function toInt(val: string | number | string[]) {
        if (typeof val === "string") {
            return parseInt(val);
        } else if (typeof val === "number") {
            return val;
        } else if (Array.isArray(val)) {
            return parseInt(val[0]);
        }
    }
    function toFloat(val: string | number | string[]) {
        if (typeof val === "string") {
            return parseFloat(val);
        } else if (typeof val === "number") {
            return val;
        } else if (Array.isArray(val)) {
            return parseFloat(val[0]);
        }
    }

    $("#hlines-slider, #hlines-number").on("change", function () {
        chart.p.horizontalLines = toInt($(this).val());
        chart.draw();
    });

    $("#vlines-slider, #vlines-number").on("change", function () {
        chart.p.verticalLines = toInt($(this).val());
        chart.draw();
    });

    $("#trapezoid-slider, #trapezoid-number").on("change", function () {
        chart.p.trapezoidRatio = toFloat($(this).val());
        chart.draw();
    });

    $("#intermediateLineWidth-slider, #intermediateLineWidth-number").on("change", function () {
        chart.p.gridLineWidth = toFloat($(this).val());
        chart.draw();
    });

    $("#trapezoidLineWidth-slider, #trapezoidLineWidth-number").on("change", function () {
        chart.p.trapezoidLineWidth = toFloat($(this).val());
        chart.draw();
    });

    $("#fontFamily").on("change", function () {
        chart.p.fontFamily = $(this).val();
        chart.draw();
    });

    $("#fontSize").on("change", function () {
        chart.p.fontSize = toInt($(this).val());
        chart.draw();
    });

    $("#markType").on("change", function () {
        chart.p.markType = $(this).val();
        chart.draw();
    });

    $("#dotRadius-slider, #dotRadius-number").on("change", function () {
        chart.p.dotRadius = toFloat($(this).val());
        chart.draw();
    });

    $("#margin-slider, #margin-number").on("change", function () {
        chart.p.figMargin = toFloat($(this).val());
        chart.draw();
    });


    function updateChartDimensions(width: number, aspect: number) {
        chart.p.figWidth = width;
        chart.p.figHeight = width * aspect;
        $("#absWidth-slider, #absWidth-number").val(Math.round(width));
        $("#absHeight-slider, #absHeight-number").val(Math.round(width * aspect));
        chart.draw();
    }

    $("#waWidth-slider, #waWidth-number").on("change", function () {
        var width = toFloat($(this).val());
        var aspect = toFloat($("#waAspect-number").val());
        updateChartDimensions(width, aspect);
    });
    $("#waAspect-slider, #waAspect-number").on("change", function () {
        const width = toFloat($("#waWidth-number").val());
        const aspect = toFloat($(this).val());
        updateChartDimensions(width, aspect);
    });

    function updateDimensionInputs() {
        $("#waWidth-slider, #waWidth-number").val(chart.p.figWidth);
        let aspect = chart.p.figHeight / chart.p.figWidth;
        aspect = Math.round(aspect * 100) / 100;
        $("#waAspect-slider, #waAspect-number").val(aspect);
        chart.draw();
    }

    $("#absWidth-slider, #absWidth-number").on("change", function () {
        chart.p.figWidth = toFloat($(this).val());
        updateDimensionInputs();
    });
    $("#absHeight-slider, #absHeight-number").on("change", function () {
        chart.p.figHeight = toFloat($(this).val());
        updateDimensionInputs();
    });


    $("#formant-values").on("change", function () {
        chart.removeFormantLimits();
        chart.setData($(this).val());
    });


    $("#f1min").on("change", function () {
        chart.range.f1Min = $(this).val();
        chart.draw();
    });

    $("#f1max").on("change", function () {
        chart.range.f1Max = $(this).val();
        chart.draw();
    });

    $("#f2min").on("change", function () {
        chart.range.f2Min = $(this).val();
        chart.draw();
    });

    $("#f2max").on("change", function () {
        chart.range.f2Max = $(this).val();
        chart.draw();
    });

    setGuiElementsFromData(chart);
}