import QRS from "./deps/qr-scanner.min.js";

let QRController = {};

QRController.init = ()=>{

    QRController._strcode = undefined;

	const video = document.getElementById('qr-video');

	QRController._scanner = new QRS(video, result => {
			//console.log(result.data)
            QRController.onQRCode(result.data);
		},
		{
        	onDecodeError: error => {
				//console.log("ERROR: ",error);
			},
        	
			highlightScanRegion: true,
        	highlightCodeOutline: true,
    	}
	);

	QRController._scanner.start().then(() => {
        // List cameras after the scanner started to avoid listCamera's stream and the scanner's stream being requested
        // at the same time which can result in listCamera's unconstrained stream also being offered to the scanner.
        // Note that we can also start the scanner after listCameras, we just have it this way around in the demo to
        // start the scanner earlier.

        QRS.listCameras(true).then(cameras =>{
			console.log(cameras)
        });

    });

	//QRS.hasCamera().then(hasCamera => camHasCamera.textContent = hasCamera);
};

QRController.onQRCode = (str)=>{
    if (!str) return;

    if (str === QRController._strcode) return;
    QRController._strcode = str;
    
    console.log(str);

    let values = str.split(":");
    if (values.length !== 2) return;

    let cmd = values[0];
    let arg = values[1];

    if (cmd==="layer") APP.DSC.setDiscoveryLayer(arg);
    if (cmd==="shape") APP.DSC.shape = arg;
};

export default QRController;