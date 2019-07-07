import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import readImageFile from 'itk/readImageFile'
import vtkITKHelper from 'vtk.js/Sources/Common/DataModel/ITKHelper'
import vtkVolume from 'vtk.js/Sources/Rendering/Core/Volume';
import vtkVolumeMapper from 'vtk.js/Sources/Rendering/Core/VolumeMapper';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction';
import vtkImageData from 'vtk.js/Sources/Common/DataModel/ImageData';

import controlPanel from './controller.html';
// import {ResizeSensor}     from 'css-element-queries'

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

// let file = '/Users/hui/Data/CC0120_siemens_15_58_F.nii.gz';
const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
     background: [0,0,0],
});
const renderer = fullScreenRenderer.getRenderer();

const renderWindow = fullScreenRenderer.getRenderWindow();
fullScreenRenderer.addController(controlPanel);
let Volume;
function ImportVolume(files) {
    console.log("Volume Import Started");
    readImageFile(null, files).then(({ image, webWorker })=>{
        webWorker.terminate();
        console.log(image);
        const vtkImage=vtkITKHelper.convertItkToVtkImage(image);
        console.log(vtkImage);
        return Promise.resolve(vtkImage);
    }).catch((err)=>{
        console.log(err);
    })
}

let fileDialog = document.createElement("input");
fileDialog.setAttribute("type", "file");
fileDialog.setAttribute("accept", ".");
// Multiple:True will let dialog be able to select multiple files
fileDialog.setAttribute("multiple", false);
fileDialog.click();
fileDialog.addEventListener("change", function(event){
    //If no file selected
    if(event.target.files.length < 1) return;

    //http file element
    let file = event.target.files[0];
    console.log(file);
    // let Volume = ImportVolume(file);
    console.log("Volume Import Started");

    readImageFile(null, file).then(({ image: itkImage, webWorker })=>{
        webWorker.terminate();

        Volume = vtkITKHelper.convertItkToVtkImage(itkImage);
        console.log(itkImage);
        console.log(Volume);
        console.log(vtkITKHelper.convertItkToVtkImage(itkImage));
        const Mapper = vtkVolumeMapper.newInstance();
        const Actor = vtkVolume.newInstance();
        let ctf = vtkColorTransferFunction.newInstance();
        let otf = vtkPiecewiseFunction.newInstance();
        // const scalarRange = Volume.getPointData().getScalars().getRange();
        ctf.addRGBPoint(-200, 0.0, 0.0, 0.0);
        // ctf.addRGBPoint(scalarRange[0], 0.0, 0.0, 0.0);
        ctf.addRGBPoint(-16, 0.73, 0.25, 0.30);
        ctf.addRGBPoint(641, 0.90, 0.82, 0.56);
        ctf.addRGBPoint(800, 1.0, 1.0, 1.0);
        // ctf.addRGBPoint(scalarRange[1], 1.0, 1.0, 1.0);


        // pipeline

        Actor.getProperty().setRGBTransferFunction(0, ctf);
        Actor.getProperty().setScalarOpacity(0, otf);
        Actor.getProperty().setScalarOpacity(0, 4.5);
        Actor.getProperty().setInterpolationTypeToFastLinear();
        Actor.getProperty().setShade(true);
        Actor.getProperty().setAmbient(0.2);
        Actor.getProperty().setDiffuse(0.7);
        Actor.getProperty().setSpecular(0.3);
        Actor.getProperty().setSpecularPower(8.0);
        // render
        Mapper.setInputData(Volume);
        Actor.setMapper(Mapper);
        renderer.addActor(Actor);

        renderer.resetCamera();
        renderWindow.render();

    }).catch((err)=>{
        console.log(err);
    });
});


// -----------------------------------------------------------
// UI control handling
// -----------------------------------------------------------

const representationSelector = document.querySelector('.representations');
const resolutionChange = document.querySelector('.resolution');

representationSelector.addEventListener('change', (e) => {
    const newRepValue = Number(e.target.value);
    // actor.getProperty().setRepresentation(newRepValue);
    renderWindow.render();
});

resolutionChange.addEventListener('input', (e) => {
    const resolution = Number(e.target.value);
    // coneSource.setResolution(resolution);
    renderWindow.render();
});