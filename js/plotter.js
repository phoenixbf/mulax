/*
	Plotter module
	bruno.fanini_AT_cnr.it

===============================================*/

let Plotter = {};

Plotter.init = ()=>{
    //Chart.defaults.backgroundColor = '#FFFFFF';
};

Plotter.isNumber = (value)=>{
    //return !isNaN(parseFloat(value)) && isFinite(value);
    return /^-?\d+(\.\d+)?$/.test(value);
};

Plotter.generateFromCSV = (fname, onLoaded)=>{
    if (!fname.endsWith(".csv")) fname += ".csv";

    let path = APP.pathAssetsFolder + APP._currItem + "/plots/" + fname;

	ATON.ASCII.loadCSV(path, undefined, (d)=>{
		let D = []
		for (let r in d) D.push(d[r]);

		console.log(D);

        let elPlot = Plotter.generateFromData(fname, D);

        if (onLoaded) onLoaded(elPlot);
	});
};

Plotter.generateFromData = (plotname, data)=>{
    let D = {};

    let xlabel,ylabel;
    let dataclean = [];

    for (let i=0; i<data.length; i++){
        let r = data[i];

        if (r.Option === "xLabel"){
            xlabel = r.Value;
        }
        if (r.Option === "yLabel"){
            ylabel = r.Value;
        }
        if (Plotter.isNumber(r.Option)){
            dataclean.push(r);
        }
    }

    console.log(dataclean)

    D.labels = dataclean.map(row => row.Option);
    D.datasets = [
          {
            label: plotname,
            data: dataclean.map(row => row.Value)
          }
    ];

    console.log(D)

    const plugin = {
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart, args, options) => {
            const {ctx} = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = options.color || '#99ffff';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    };

    let config = {
        type: 'line',
        data: D,
        options: {
            responsive: true,
            scales:{
                x:{
                    title: {
                        display: true,
                        text: xlabel
                    }
                },
                y:{
                    title: {
                        display: true,
                        text: ylabel
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                customCanvasBackgroundColor: {
                    color: 'white',
                }
/*
                title: {
                    display: true,
                    text: "Graph"
                }
*/
            }
        },
        plugins: [plugin],
    };

    let elPlot = document.createElement("canvas");
    new Chart( elPlot, config );

    //ATON.UI.showModal({ header: "Test", body: elPlot });

    return elPlot;
};


export default Plotter;