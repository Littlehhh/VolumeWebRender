import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import readImageFile      from 'itk/readImageFile'
import vtkActor           from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkCalculator      from 'vtk.js/Sources/Filters/General/Calculator';
import vtkConeSource      from 'vtk.js/Sources/Filters/Sources/ConeSource';
import vtkMapper          from 'vtk.js/Sources/Rendering/Core/Mapper';
import { AttributeTypes } from 'vtk.js/Sources/Common/DataModel/DataSetAttributes/Constants';
import { FieldDataTypes } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';
import vtkITKHelper       from 'vtk.js/Sources/Common/DataModel/ITKHelper'
import vtkVolume from 'vtk.js/Sources/Rendering/Core/Volume';
import vtkVolumeMapper from 'vtk.js/Sources/Rendering/Core/VolumeMapper';
import readImageDICOMFileSeries from 'itk/readImageDICOMFileSeries'
// import {ResizeSensor}     from 'css-element-queries'


import vtkImageData from 'vtk.js/Sources/Common/DataModel/ImageData';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
import vtkImageMapper from 'vtk.js/Sources/Rendering/Core/ImageMapper';
import vtkImageSlice from 'vtk.js/Sources/Rendering/Core/ImageSlice';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction';

import controlPanel from './controller.html';

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------
const file = '/Users/hui/Data/CC0120_siemens_15_58_F.nii.gz';
const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();

const renderWindow = fullScreenRenderer.getRenderWindow();

// ----------------------------------------------------------------------------
// Example code
// ----------------------------------------------------------------------------

function ImportVolume(files) {
    console.log("Volume Import Started");
    readImageFile(null, files).then(({ image, webWorker })=>{
        webWorker.terminate();
        console.log(image);
        return vtkITKHelper.convertItkToVtkImage(image);
    }).catch((err)=>{
        console.log(err);
    })
}

const Volume = ImportVolume(file);
const Mapper = vtkVolumeMapper.newInstance();
const Actor = vtkVolume.newInstance();
let ctf = vtkColorTransferFunction.newInstance();
let otf = vtkPiecewiseFunction.newInstance();
ctf.addRGBPoint(scalarRange[0], 0.0, 0.0, 0.0);
ctf.addRGBPoint(-16, 0.73, 0.25, 0.30);
ctf.addRGBPoint(641, 0.90, 0.82, 0.56);
ctf.addRGBPoint(scalarRange[1], 1.0, 1.0, 1.0);


// pipeline
Mapper.setInputConnection(Volume.getOutputPort());
Actor.setVolumeMapper(Mapper);
renderer.addActor(Actor);
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
renderer.resetCamera();
renderWindow.render();


// -----------------------------------------------------------
// UI control handling
// -----------------------------------------------------------

fullScreenRenderer.addController(controlPanel);
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