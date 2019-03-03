'use strict'
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
    mode: 'development',
    entry: [
        './src/app.js'
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader'
            }, {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            }, {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]', 
                        emitFile: true 
                    }
                }]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ]
}
