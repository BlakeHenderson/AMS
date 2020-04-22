function CreateFundChart(target, fund_color, fund)
{
    var benchmark_color = "#DDDDDD";

    // override the default line chart to draw a hover line between the dots
    Chart.defaults.LineWithLine = Chart.defaults.line;
    Chart.controllers.LineWithLine = Chart.controllers.line.extend({
        draw: function(ease) {

            if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
                var activePoint = this.chart.tooltip._active[0],
                    ctx = this.chart.ctx,
                    x = activePoint.tooltipPosition().x,
                    topY = this.chart.scales['y-axis-0'].top,
                    bottomY = this.chart.scales['y-axis-0'].bottom;

                // draw line
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, topY);
                ctx.lineTo(x, bottomY);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#C7C7C7';
                ctx.stroke();
                ctx.restore();
            }
            
            Chart.controllers.line.prototype.draw.call(this, ease);
        }
    });
   
    // data arrays
    var count = 0;
    var fund_data = [];
    var benchmark_data = [];
    var label_data = [];
    
    // range values
    var maximum = 0.00;
    var minimum = 1000.00;

    var data_url = "https://newday-prod.edavine.com/feed/fund-prices/" + fund;

    var request = $.ajax({
        type: 'GET',
        url: data_url
    })
    .done(function(data) {
        $.each( JSON.parse(data), function( i, value ) {
            // get the 3 values from the JSON
            var trading_day = value.trading_day;
            var benchmark = value.benchmark;
            var cumulative = value.cumulative_return;

            // compare and update the range values
            if (benchmark > maximum) { maximum = benchmark; }
            if (cumulative > maximum) { maximum = cumulative; }
            if (benchmark < minimum) { minimum = benchmark; }
            if (cumulative < minimum) { minimum = cumulative; }

            // add the data to the arrays
            count++;
            label_data.push(trading_day.split("-").reverse().join("/"));
            benchmark_data.push(benchmark);
            fund_data.push(cumulative);
        });

        // set the labels with the last value
        var fundvalue = fund_data[fund_data.length - 1];
        var fundtext = ((fundvalue - 1) * 100).toFixed(2) + '%';
        $('.chart-label-performance .value').text(fundtext);
        
        var benchvalue = benchmark_data[benchmark_data.length - 1];
        var benchtext = ((benchvalue - 1) * 100).toFixed(2) + '%';
        $('.chart-label-benchmark .value').text(benchtext);                

        var options = {
            legend: { display: false },
            maintainAspectRatio: true,
            spanGaps: false,
            elements: {
                point: { radius: 0 },
                line: { tension: 0 } 
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                enabled: false, // disable the default tooltip
                
                // override the default tooltip to update the labels
                custom: function(tooltipModel) {

                    // if the tooltip is hidden, reset to the default label values
                    if (tooltipModel.opacity === 0) {
                        $('.chart-label-performance .value').text(fundtext);
                        $('.chart-label-benchmark .value').text(benchtext);
                        return;
                    }

                    // return the lines of the tooltipModel which contains the data values
                    function getBody(bodyItem) {
                        return bodyItem.lines;
                    }
                    var bodyLines = tooltipModel.body.map(getBody);

                    // loop through the two data values from the body
                    bodyLines.forEach(
                        function (body, i) {
                            // format the data value
                            var labeltext = ((body - 1) * 100).toFixed(2) + '%';
                            
                            // check which body line we're at and update the corresponding label
                            if (i == 0) { $('.chart-label-performance .value').text(labeltext); }
                            if (i == 1) { $('.chart-label-benchmark .value').text(labeltext); }
                        }
                    );
                }
            },
            hover: {
                mode: 'index',
                intersect: false
            },
            scales: {
                xAxes: [
                    {
                        display: true,
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: count
                        },
            gridLines: {
                            display:false
                    },
                    }
                ],
                yAxes: [
                    {
                        display: false,
                        ticks: {
                            display: false,
                            beginAtZero: true,
                            min: minimum - .02, // subtract to make room for hover dot
                            max: maximum + .02 // add to make room for hover dot
                        },
            gridLines: {
                    display:false
            },
                    }
                ]
            }
        };

        var data = {
            labels: label_data,
            datasets: [
                {
                    backgroundColor: fund_color,
                    borderColor: fund_color,
                    data: fund_data,
                    fill: false,
                    pointHoverRadius: 7
                },
                {
                    backgroundColor: benchmark_color,
                    borderColor: benchmark_color,
                    data: benchmark_data,
                    fill: false,
                    pointHoverRadius: 7
                }
            ]
        };

        var ctx = document.getElementById(target).getContext('2d');
        var myChart = new Chart
        (
            ctx,
            {
                type: 'LineWithLine',
                data: data,
                options: options
            }
        );
        myChart.update();
    });
}