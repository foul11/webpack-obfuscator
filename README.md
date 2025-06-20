# javascript-obfuscator plugin and loader for Webpack@5

### Installation

This plugin requires Webpack@5.

Install the plugin with NPM and add it to your devDependencies:

`npm install --save-dev javascript-obfuscator https://github.com/foul11/webpack-obfuscator.git#semver:^v3.5.2`

### Plugin usage:

```javascript
var WebpackObfuscator = require('webpack-obfuscator');

// ...

// webpack plugins array
plugins: [
    new WebpackObfuscator ({
        rotateStringArray: true
    }, ['excluded_bundle_name.js'])
]
```

### Loader usage:

Define a rule in your webpack config and use the obfuscator-loader as the last of your loaders for your modules. You can add the **enforce: 'post'** flag to ensure the loader will be called after normal loaders:

```javascript
var WebpackObfuscator = require('webpack-obfuscator');

// webpack loader rules array
rules: [
    {
        test: /\.js$/,
        exclude: [ 
            path.resolve(__dirname, 'excluded_file_name.js') 
        ],
        enforce: 'post',
        use: { 
            loader: WebpackObfuscator.loader, 
            options: {
                rotateStringArray: true
            }
        }
    }
]
```

### obfuscatorOptions
Type: `Object` Default: `null`

Options for [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator). Should be passed exactly like described on their page.

### excludes (plugin only)
Type: `Array` or `String` Default: `[]`

Bundle name is output file name after webpack compilation. With multiple webpack entries you can set bundle name in `output` object with aliases `[name]` or `[id]`.

Syntax for excludes array is syntax for [multimatch](https://github.com/sindresorhus/multimatch) package. You can see examples on package page.

Few syntax examples: `['excluded_bundle_name.js', '**_bundle_name.js'] or 'excluded_bundle_name.js'`


Example:
```
// webpack.config.js
'use strict';

const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
    entry: {
        'abc': './test/input/index.js',
        'cde': './test/input/index1.js'
    },
    output: {
        path: 'dist',
        filename: '[name].js' // output: abc.js, cde.js
    },
    plugins: [
        new JavaScriptObfuscator({
            rotateStringArray: true
        }, ['abc.js'])
    ]
};
```

Can be used to bypass obfuscation of some files.

### License
Copyright (C) 2022 [Timofey Kachalov](http://github.com/sanex3339).

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
