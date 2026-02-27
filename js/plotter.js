/*
	Plotter module
	bruno.fanini_AT_cnr.it

===============================================*/

let Plotter = {};

Plotter.init = ()=>{
    //Chart.defaults.backgroundColor = '#FFFFFF';
    Plotter.color = "#007387";
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
		for (let r in d){
            let R = d[r];
            for (let a in R){
                //console.log(R[a])
                if (Plotter.isNumber(R[a])) R[a] = parseFloat(R[a]).toFixed(2);
            }
            D.push(d[r]);
        }

		console.log(D);

        let elPlot = Plotter.generateFromData(fname, D);

        if (onLoaded) onLoaded(elPlot);
	});
};

Plotter.generateFromData = (plotname, data, col)=>{
    let D = {};

    let xfield,yfield;

    xfield = Object.keys(data[0])[0];
    yfield = Object.keys(data[0])[1];

/*
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
*/
    D.labels = data.map(row => row[xfield]), //dataclean.map(row => row.Option);
    D.datasets = [
          {
            label: plotname,
            borderColor: Plotter.color,
            backgroundColor: Plotter.color + "33",
            data: data.map(row => row[yfield]) //dataclean.map(row => row.Value)
          }
    ];

    console.log(D)

    const plugin = {
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart, args, options) => {
            const {ctx} = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = options.color || '#ffffff';
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
                        text: xfield
                    }
                },
                y:{
                    title: {
                        display: true,
                        text: yfield
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