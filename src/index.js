import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import readImageFile from 'itk/readImageFile'
import vtkITKHelper from 'vtk.js/Sources/Common/DataModel/ITKHelper'
import vtkVolume from 'vtk.js/Sources/Rendering/Core/Volume';
import vtkVolumeMapper from 'vtk.js/Sources/Rendering/Core/VolumeMapper';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';

import vtkPiecewiseFunction from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction';

import vtkImageData from 'vtk.js/Sources/Common/DataModel/ImageData';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
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

const Mapper = vtkVolumeMapper.newInstance();
const Actor = vtkVolume.newInstance();
// let Volume = vtkImageData.newInstance();
fullScreenRenderer.addController(controlPanel);

// function ImportVolume(files) {
//     console.log("Volume Import Started");
//     readImageFile(null, files).then(({ image, webWorker })=>{
//         webWorker.terminate();
//         console.log(image);
//         const vtkImage=vtkITKHelper.convertItkToVtkImage(image);
//         console.log(vtkImage);
//         return Promise.resolve(vtkImage);
//     }).catch((err)=>{
//         console.log(err);
//     })
// }

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
        console.log(itkImage);
        const Volume = vtkITKHelper.convertItkToVtkImage(itkImage);
        // Volume = convertItkToVtkImage(itkImage);
        console.log(Volume);
        // return vtkITKHelper.convertItkToVtkImage(itkImage);
        let ctf = vtkColorTransferFunction.newInstance();
        let otf = vtkPiecewiseFunction.newInstance();
        let gtf = vtkPiecewiseFunction.newInstance();
        const scalarRange = Volume.getPointData().getScalars().getRange();
        // ctf.addRGBPoint(-200, 0.0, 0.0, 0.0);
        ctf.addRGBPoint(-3024, 0, 0 ,0);
        ctf.addRGBPoint(143.556, 0.615686, 0.356863, 0.184314);
        ctf.addRGBPoint(166.222, 0.882353, 0.603922, 0.290196);
        ctf.addRGBPoint(214.389, 1, 1, 1);
        ctf.addRGBPoint(419.736, 1, 0.937033, 0.954531);
        ctf.addRGBPoint(3071, 0.827451, 0.658824, 1);


        otf.addPoint(-3024, 0);
        otf.addPoint(143.556, 0);
        otf.addPoint(166.222, 0.686275);
        otf.addPoint(214.389, 0.696078);
        otf.addPoint(419.736, 0.833333);
        otf.addPoint(3071, 0.803922);

        gtf.addPoint(0, 1);
        gtf.addPoint(255, 1);

        // pipeline
        Mapper.setInputData(Volume);
        Actor.setMapper(Mapper);
        renderer.addActor(Actor);
        Actor.getProperty().setRGBTransferFunction(0, ctf);
        Actor.getProperty().setScalarOpacity(0, otf);
        // Actor.getProperty().set(0, gtf);



        // Actor.getProperty().setScalarOpacity(0, otf);
        // Actor.getProperty().setScalarOpacity(0, 4.5);
        Actor.getProperty().setInterpolationTypeToFastLinear();
        Actor.getProperty().setShade(true);
        Actor.getProperty().setAmbient(0.1);
        Actor.getProperty().setDiffuse(0.9);
        Actor.getProperty().setSpecular(0.2);
        // Actor.getProperty().setSpecularPower(8.0);
        // render
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


function convertItkToVtkImage(itkImage, options = {}) {
    // Make sure we can handle input pixel type
    // Refer to itk-js/src/PixelTypes.js for numerical values
    switch (itkImage.imageType.pixelType) {
        case 1: // Scalar
        case 2: // RGB
        case 3: // RGBA
            break;
        default:
            vtkErrorMacro(
                `Cannot handle ITK.js pixel type ${itkImage.imageType.pixelType}`
            );
            return null;
    }

    const vtkImage = {
        origin: [0, 0, 0],
        spacing: [1, 1, 1],
    };

    const dimensions = [1, 1, 1];
    const direction = [1, 0, 0, 0, 1, 0, 0, 0, 1];

    for (let idx = 0; idx < itkImage.imageType.dimension; ++idx) {
        vtkImage.origin[idx] = itkImage.origin[idx];
        vtkImage.spacing[idx] = itkImage.spacing[idx];
        dimensions[idx] = itkImage.size[idx];
        for (let col = 0; col < itkImage.imageType.dimension; ++col) {
            // ITK (and VTKMath) use a row-major index axis, but the direction
            // matrix on the vtkImageData is a webGL matrix, which uses a
            // column-major data layout. Transpose the direction matrix from
            // itkImage when instantiating that vtkImageData direction matrix.
            direction[col + idx * 3] =
                itkImage.direction.data[idx + col * itkImage.imageType.dimension];
        }
    }

    // Create VTK Image Data
    const imageData = vtkImageData.newInstance(vtkImage);

    // create VTK image data
    const scalars = vtkDataArray.newInstance({
        name: options.scalarArrayName || 'Scalars',
        values: itkImage.data,
        numberOfComponents: itkImage.imageType.components,
    });

    imageData.setDirection(direction);
    imageData.setDimensions(...dimensions);
    imageData.getPointData().setScalars(scalars);
    console.log(imageData);
    return imageData;
}
