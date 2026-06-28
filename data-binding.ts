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
    if (chart.range) {
        $('#f1min').val(chart.range.f1Min);
        $('#f1max').val(chart.range.f1Max);
        $('#f2min').val(chart.range.f2Min);
        $('#f2max').val(chart.range.f2Max);
    }
    $('#markType').val(chart.p.markType);
    $('#fontFamily').val(chart.p.fontFamily);
    $('#fontSize').val(chart.p.fontSize);
    $('#dotColor').val(chart.p.dotFillColor);
    $('#dotRadius-slider').val(chart.p.dotRadius);
    $('#dotRadius-number').val(chart.p.dotRadius);
}

function toInt(val: string | number | string[]): number {
    if (typeof val === "string") {
        return parseInt(val);
    } else if (typeof val === "number") {
        return val;
    } else if (Array.isArray(val)) {
        return parseInt(val[0]);
    } else {
        return 0;
    }
}
function toFloat(val: string | number | string[]): number {
    if (typeof val === "string") {
        return parseFloat(val);
    } else if (typeof val === "number") {
        return val;
    } else if (Array.isArray(val)) {
        return parseFloat(val[0]);
    } else {
        return 0;
    }
}

function toString(val: string | number | string[]) {
    if (Array.isArray(val))
        val = val[0];
    if (typeof val === "number")
        val = val.toString();
    return val;
}

export function bindDataControls(chart: FormantChart) {
    const $f1min = $("#f1min");
    const $f1max = $("#f1max");
    const $f2min = $("#f2min");
    const $f2max = $("#f2max");
    const $formantValues = $("#formant-values");
    const $absWidth = $("#absWidth-slider, #absWidth-number");
    const $absHeight = $("#absHeight-slider, #absHeight-number");
    const $waWidth = $("#waWidth-slider, #waWidth-number");
    const $waAspect = $("#waAspect-slider, #waAspect-number");
    const $autoMiniMax = $("#auto-minimax");

    function reciprocalBind(first: string, second: string) {
        $(first).on("change", function () {
            const secondVal = $(this).val();
            if (!secondVal)
                return;
            $(second).val(secondVal);
        });

        $(second).on("change", function () {
            const firstVal = $(this).val();
            if (!firstVal)
                return;
            $(first).val(firstVal);
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

    $("#hlines-slider, #hlines-number").on("change", function () {
        const horizontalLines = $(this).val();
        if (!horizontalLines)
            return;
        chart.p.horizontalLines = toInt(horizontalLines);
        chart.draw();
    });

    $("#vlines-slider, #vlines-number").on("change", function () {
        const verticalLines = $(this).val();
        if (!verticalLines)
            return;
        chart.p.verticalLines = toInt(verticalLines);
        chart.draw();
    });

    $("#trapezoid-slider, #trapezoid-number").on("change", function () {
        const trapezoidRatio = $(this).val();
        if (!trapezoidRatio)
            return;
        chart.p.trapezoidRatio = toFloat(trapezoidRatio);
        chart.draw();
    });

    $("#intermediateLineWidth-slider, #intermediateLineWidth-number").on("change", function () {
        const gridLineWidth = $(this).val();
        if (!gridLineWidth)
            return;
        chart.p.gridLineWidth = toFloat(gridLineWidth);
        chart.draw();
    });

    $("#trapezoidLineWidth-slider, #trapezoidLineWidth-number").on("change", function () {
        const trapezoidLineWidth = $(this).val();
        if (!trapezoidLineWidth)
            return;
        chart.p.trapezoidLineWidth = toFloat(trapezoidLineWidth);
        chart.draw();
    });

    $("#fontFamily").on("change", function () {
        let fontFamily = $(this).val();
        if (!fontFamily)
            return;
        chart.p.fontFamily = toString(fontFamily);
        chart.draw();
    });

    $("#fontSize").on("change", function () {
        let fontSize = $(this).val();
        if (!fontSize)
            return;
        chart.p.fontSize = toInt(fontSize);
        chart.draw();
    });

    $("#markType").on("change", function () {
        let markType = $(this).val();
        if (!markType)
            return;
        chart.p.markType = toString(markType) as typeof chart.p.markType;
        chart.draw();
    });

    $("#dotRadius-slider, #dotRadius-number").on("change", function () {
        let dotRadius = $(this).val();
        if (!dotRadius)
            return;
        chart.p.dotRadius = toFloat(dotRadius);
        chart.draw();
    });

    $("#margin-slider, #margin-number").on("change", function () {
        let figMargin = $(this).val();
        if (!figMargin)
            return;
        chart.p.figMargin = toFloat(figMargin);
        chart.draw();
    });

    function updateChartDimensions(width: number, aspect: number) {
        chart.p.figWidth = width;
        chart.p.figHeight = width * aspect;
        $absWidth.val(Math.round(width));
        $absHeight.val(Math.round(width * aspect));
        chart.draw();
    }

    $waWidth.on("change", function () {
        let width = $(this).val();
        if (!width)
            return;
        const waAspect = $("#waAspect-number").val();
        if (!waAspect)
            return;
        updateChartDimensions(toFloat(width), toFloat(waAspect));
    });
    $waAspect.on("change", function () {
        const waWidth = $("#waWidth-number").val();
        if (!waWidth)
            return;
        const aspect = $(this).val();
        if (!aspect)
            return;
        updateChartDimensions(toFloat(waWidth), toFloat(aspect));
    });

    function updateDimensionInputs() {
        $waWidth.val(chart.p.figWidth);
        let aspect = chart.p.figHeight / chart.p.figWidth;
        aspect = Math.round(aspect * 100) / 100;
        $waAspect.val(aspect);
        chart.draw();
    }

    $absWidth.on("change", function () {
        const figWidth = $(this).val();
        if (!figWidth)
            return;
        chart.p.figWidth = toFloat(figWidth);
        updateDimensionInputs();
    });
    $absHeight.on("change", function () {
        const figHeight = $(this).val();
        if (!figHeight)
            return;
        chart.p.figHeight = toFloat(figHeight);
        updateDimensionInputs();
    });


    function updateChartData() {
        if ($autoMiniMax.prop("checked"))
            chart.removeFormantLimits();
        chart.setData($formantValues.val());
        updateFormantRangeInputs();
    }
    $formantValues.on("change", updateChartData);

    function updateFormantRangeInputs() {
        if (chart.range) {
            $f1min.val(chart.range.f1Min);
            $f1max.val(chart.range.f1Max);
            $f2min.val(chart.range.f2Min);
            $f2max.val(chart.range.f2Max);
        }
    }

    // When auto-minimax is checked, disable manual range inputs
    function syncAutoMinimaxControls() {
        const autoMinimax = $autoMiniMax.prop("checked");
        $("#f1min, #f1max, #f2min, #f2max, #min-max").prop("disabled", autoMinimax);
        updateChartData();
        updateFormantRangeInputs();
    }

    $autoMiniMax.on("change", syncAutoMinimaxControls);
    syncAutoMinimaxControls();

    function updateChartRange() {
        const f1Min = $f1min.val();
        const f2Min = $f2min.val();
        const f1Max = $f1max.val();
        const f2Max = $f2max.val();
        if (!f1Min || !f2Min || !f1Max || !f2Max)
            return;
        chart.range = {
            f1Min: toFloat(f1Min),
            f2Min: toFloat(f2Min),
            f1Max: toFloat(f1Max),
            f2Max: toFloat(f2Max)
        };
        chart.draw();
    }

    $f1min.on("change", function () {
        if (chart.range) {
            const f1Min = $(this).val();
            if (!f1Min)
                return;
            chart.range.f1Min = toFloat(f1Min);
            chart.draw();
        } else {
            updateChartRange();
        }
    });

    $f1max.on("change", function () {
        if (chart.range) {
            const f1Max = $(this).val();
            if (!f1Max)
                return;
            chart.range.f1Max = toFloat(f1Max);
            chart.draw();
        } else {
            updateChartRange();
        }
    });

    $f2min.on("change", function () {
        if (chart.range) {
            const f2Min = $(this).val();
            if (!f2Min)
                return;
            chart.range.f2Min = toFloat(f2Min);
            chart.draw();
        } else {
            updateChartRange();
        }
    });

    $f2max.on("change", function () {
        if (chart.range) {
            const f2Max = $(this).val();
            if (!f2Max)
                return;
            chart.range.f2Max = toFloat(f2Max);
            chart.draw();
        } else {
            updateChartRange();
        }
    });

    setGuiElementsFromData(chart);
}