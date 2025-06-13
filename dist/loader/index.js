"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const source_map_1 = require("source-map");
const javascript_obfuscator_1 = __importDefault(require("javascript-obfuscator"));
const loader_utils_1 = __importDefault(require("loader-utils"));
const path = __importStar(require("path"));
;
function mapToInputSourceMap(sourceMap, loaderContext, inputSourceMap) {
    return new Promise((resolve, reject) => {
        const inMap = {
            file: loaderContext.remainingRequest,
            mappings: inputSourceMap.mappings,
            names: inputSourceMap.names,
            sources: inputSourceMap.sources,
            sourceRoot: inputSourceMap.sourceRoot,
            sourcesContent: inputSourceMap.sourcesContent,
            version: inputSourceMap.version,
        };
        Promise.all([
            new source_map_1.SourceMapConsumer(inMap),
            new source_map_1.SourceMapConsumer(sourceMap),
        ])
            .then(sourceMapConsumers => {
            try {
                const generator = source_map_1.SourceMapGenerator.fromSourceMap(sourceMapConsumers[1]);
                generator.applySourceMap(sourceMapConsumers[0]);
                const mappedSourceMap = generator.toJSON();
                sourceMapConsumers.forEach(sourceMapConsumer => sourceMapConsumer.destroy());
                resolve(mappedSourceMap);
            }
            catch (e) {
                sourceMapConsumers.forEach(sourceMapConsumer => sourceMapConsumer.destroy());
                reject(e);
            }
        })
            .catch(reject);
    });
}
function Loader(sourceCode, inputSourceMap) {
    const context = this;
    const relativePathOfModule = path.relative(context.rootContext, context.resourcePath);
    const callback = this.async();
    const options = loader_utils_1.default.getOptions(context) || {};
    const { obfuscatedSource, obfuscationSourceMap } = javascript_obfuscator_1.default.obfuscate(sourceCode, Object.assign(Object.assign({}, options), { ignoreRequireImports: true, inputFileName: relativePathOfModule, sourceMapMode: 'separate' }));
    if (obfuscationSourceMap === undefined || !inputSourceMap) {
        callback(null, obfuscatedSource, obfuscationSourceMap);
        return;
    }
    mapToInputSourceMap(obfuscationSourceMap, context, inputSourceMap)
        .then(mappedSourceMap => {
        callback(null, obfuscatedSource, mappedSourceMap);
    })
        .catch((e) => {
        callback(e);
    });
}
module.exports = Loader;
