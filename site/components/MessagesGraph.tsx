import { useLayoutEffect, useRef } from "react";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

import { dataProvider } from "../DataProvider";
import { Themes } from "./AmCharts5";

const MessagesGraph = () => {
    const chartDiv = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const root = am5.Root.new(chartDiv.current!);
        root.setThemes(Themes(root, true));

        const chartStep = root.container.children.push(am5xy.XYChart.new(root, {
            layout: root.verticalLayout
        }));
        chartStep.zoomOutButton.set("forceHidden", true);
        chartStep.set("cursor", am5xy.XYCursor.new(root, { }));
        //chartStep.get("cursor")!.lineX.set("visible", false);
        chartStep.get("cursor")!.lineY.set("visible", false);

        const createValueAxis = (chart: am5xy.XYChart) => {
            return chart.yAxes.push(am5xy.ValueAxis.new(root, {
                renderer: am5xy.AxisRendererY.new(root, {
                    inside: false
                }),
                min: 0,
                maxPrecision: 0
            }));
        };

        const createDateAxis = (chart: am5xy.XYChart, timeUnit: 'day' | 'month') => {
            return chart.xAxes.push(am5xy.DateAxis.new(root, {
                baseInterval: {
                    timeUnit,
                    count: 1
                },
                // makes sure axis of both graphs can be aligned
                extraMin: 0.1,
                extraMax: 0.1,
                periodChangeDateFormats: {
                    month: "[bold]yyyy[/]"
                },
                renderer: am5xy.AxisRendererX.new(root, {})
            }));
        };

        const setpSeries = chartStep.series.push(am5xy.StepLineSeries.new(root, {
            valueXField: "date",
            valueYField: "messages",
            xAxis: createDateAxis(chartStep, 'day'),
            yAxis: createValueAxis(chartStep),
            noRisers: true,
            stroke: am5.color(0x479ADB),
            fill: am5.color(0x479ADB),
            tooltipText: "[bold]{valueX.formatDate('EEEE, MMM dd yyyy')}:[/] {messages} messages sent",
            tooltip: am5.Tooltip.new(root, {
                pointerOrientation: "horizontal",
            })
        }));

        chartStep.yAxes.getIndex(0)!.children.unshift(
            am5.Label.new(root, {
                rotation: -90,
                text: "Messages sent",
                y: am5.p50,
                centerX: am5.p50
            })
        );
        setpSeries.strokes.template.setAll({
            visible: true,
            strokeWidth: 2,
            strokeOpacity: 0.8
        });
        setpSeries.fills.template.setAll({
            visible: true,
            fillOpacity: 0.2
        });

        const chartColumn = root.container.children.push(am5xy.XYChart.new(root, {
            layout: root.verticalLayout,
            height: 100
        }));
        chartColumn.zoomOutButton.set("forceHidden", true);
        chartColumn.set("cursor", am5xy.XYCursor.new(root, { }));
        chartColumn.get("cursor")!.lineX.set("visible", false);
        chartColumn.get("cursor")!.lineY.set("visible", false);

        const columnSeries = chartColumn.series.push(am5xy.ColumnSeries.new(root, {
            valueXField: "date",
            valueYField: "messages",
            xAxis: createDateAxis(chartColumn, 'month'),
            yAxis: createValueAxis(chartColumn),
            fill: am5.color(0x479ADB),
            tooltipText: "[bold]{valueX.formatDate('MMM yyyy')}:[/] {messages} messages sent",
            tooltip: am5.Tooltip.new(root, {
                pointerOrientation: "horizontal",
            })
        }));
        (chartColumn.xAxes.getIndex(0)! as am5xy.DateAxis<any>).set("gridIntervals", [
            { timeUnit: "month", count: 1 }
        ]);
        chartColumn.yAxes.getIndex(0)!.children.unshift(
            am5.Label.new(root, {
                rotation: -90,
                text: ".....",
                // invisible text to align with the other graph
                opacity: 0,
                y: am5.p50,
                centerX: am5.p50
            })
        );

        root.container.set("layout", root.verticalLayout);

        const charts = [chartStep, chartColumn];

        const onZoom = () => charts.forEach(c => (c.xAxes.getIndex(0) as am5xy.DateAxis<any>).zoomToDates(dataProvider.getStart(), dataProvider.getEnd()));

        // TODO: update efficient
        const onDataUpdated = () => {
            setpSeries.data.setAll(dataProvider.getPerDayData());
            columnSeries.data.setAll(dataProvider.getPerMonthData());
            onZoom();
        };
        dataProvider.on('updated-data', onDataUpdated);
        dataProvider.on('updated-zoom', onZoom);
        onZoom();

        return () => {
            dataProvider.off('updated-data', onDataUpdated);
            dataProvider.off('updated-zoom', onZoom);
            root.dispose();
        };
    }, []);
    /*
    useLayoutEffect(() => {
        let container = am4core.create(chartDiv.current!, am4core.Container);
        container.width = am4core.percent(100);
        container.height = am4core.percent(100);
        container.layout = "vertical";
        
        const createChart = (data: any[], ) => {
            let chart = container.createChild(am4charts.XYChart);
            chart.zoomOutButton.disabled = true;
            
            let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.dateFormats.setKey("day", "MMMM dt");
            dateAxis.periodChangeDateFormats.setKey("month", "[bold]yyyy[/]"); 

            let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.maxPrecision = 0;
            valueAxis.min = 0;
            valueAxis.cursorTooltipEnabled = false;

            valueAxis.marginTop = 10;
            valueAxis.marginBottom = 10;
            valueAxis.align = "right";
    
            let series = chart.series.push(new am4charts.StepLineSeries());
            series.xAxis = dateAxis;
            series.yAxis = valueAxis;
            series.data = data;
            series.dataFields.dateX = "date";
            series.dataFields.valueY = "messages";
            series.tooltipText = "{dateX}: [bold]{valueY}[/]";
            series.fill = am4core.color("#479ADB");
            series.stroke = am4core.color("#479ADB");
            series.noRisers = true;
            series.strokeWidth = 2;
            series.fillOpacity = 0.2;
            series.sequencedInterpolation = true;
            
            return chart;
        };

        let charts = [
            createChart(dataProvider.getPerDayData()),
            createChart(dataProvider.getPerMonthData())
        ];
        
        charts[0].yAxes.getIndex(0)!.title.text = "Messages sent";
        charts[1].height = 100;

        const onZoom = () => charts.forEach(c => (c.xAxes.getIndex(0) as am4charts.DateAxis).zoomToDates(dataProvider.getStart(), dataProvider.getEnd(), true, true));
        const onDataUpdated = () => {
            charts.forEach(c => c.invalidateRawData());
            onZoom();
        };

        dataProvider.on('updated-data', onDataUpdated);
        dataProvider.on('updated-zoom', onZoom);

        return () => {
            dataProvider.off('updated-data', onDataUpdated);
            dataProvider.off('updated-zoom', onZoom);
            container.dispose();
        };
    }, []);*/

    return <div ref={chartDiv} style={{ width: "100%", height: "90%" }}></div>;
};

export default MessagesGraph;

