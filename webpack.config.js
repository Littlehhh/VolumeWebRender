var path = require('path');
var webpack = require('webpack');
var vtkRules = require('vtk.js/Utilities/config/dependency.js').webpack.core.rules;

// Optional if you want to load *.css and *.module.css files
// var cssRules = require('vtk.js/Utilities/config/dependency.js').webpack.css.rules;

var entry = path.join(__dirname, './src/index.js');
const sourcePath = path.join(__dirname, './src');
const outputPath = path.join(__dirname, './dist');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
    entry,
    output: {
        path: outputPath,
        filename: 'MyWebApp.js',
    },
    devtool: 'source-map',
    module: {
        rules: [
            { test: /\.html$/, loader: 'html-loader' },
        ].concat(vtkRules),
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'node_modules'),
            sourcePath,
        ],
    },
    plugins: [
        new CopyPlugin([
            {
                from: path.join(__dirname, 'node_modules', 'itk', 'WebWorkers'),
                to: path.join(__dirname, 'dist', 'itk', 'WebWorkers'),
            },
            {
                from: path.join(__dirname, 'node_modules', 'itk', 'ImageIOs'),
                to: path.join(__dirname, 'dist', 'itk', 'ImageIOs'),
            },
            {
                from: path.join(__dirname, 'node_modules', 'itk', 'MeshIOs'),
                to: path.join(__dirname, 'dist', 'itk', 'MeshIOs'),
            },
        ]),
    ],

};