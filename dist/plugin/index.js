"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpackObfuscatorPlugin = void 0;
const webpack_1 = require("webpack");
const javascript_obfuscator_1 = __importDefault(require("javascript-obfuscator"));
const multimatch_1 = __importDefault(require("multimatch"));
const transferSourceMap = require("multi-stage-sourcemap").transfer;
class WebpackObfuscatorPlugin {
    constructor(options = {}, excludes) {
        this.options = options;
        this.excludes = [];
        this.excludes = this.excludes.concat(excludes || []);
    }
    apply(compiler) {
        const isDevServer = process.argv.find(v => v.includes('webpack-dev-server'));
        if (isDevServer) {
            console.info('JavascriptObfuscator is disabled on webpack-dev-server as the reloading scripts ', 'and the obfuscator can interfere with each other and break the build');
            return;
        }
        const pluginName = this.constructor.name;
        compiler.hooks.compilation.tap(pluginName, (compilation) => {
            compilation.hooks.processAssets.tap({
                name: 'WebpackObfuscator',
                stage: webpack_1.Compilation.PROCESS_ASSETS_STAGE_DEV_TOOLING
            }, (assets) => {
                let identifiersPrefixCounter = 0;
                const sourcemapOutput = {};
                compilation.chunks.forEach(chunk => {
                    chunk.files.forEach((fileName) => {
                        if (this.options.sourceMap && fileName.toLowerCase().endsWith('.map')) {
                            let srcName = fileName.toLowerCase().substr(0, fileName.length - 4);
                            if (!this.shouldExclude(srcName)) {
                                const transferredSourceMap = transferSourceMap({
                                    fromSourceMap: sourcemapOutput[srcName],
                                    toSourceMap: compilation.assets[fileName].source()
                                });
                                const finalSourcemap = JSON.parse(transferredSourceMap);
                                finalSourcemap['sourcesContent'] = JSON.parse(assets[fileName].source().toString())['sourcesContent'];
                                assets[fileName] = new webpack_1.sources.RawSource(JSON.stringify(finalSourcemap), false);
                            }
                            return;
                        }
                        const isValidExtension = WebpackObfuscatorPlugin
                            .allowedExtensions
                            .some((extension) => fileName.toLowerCase().endsWith(extension));
                        if (!isValidExtension || this.shouldExclude(fileName)) {
                            return;
                        }
                        const asset = compilation.assets[fileName];
                        const { inputSource, inputSourceMap } = this.extractSourceAndSourceMap(asset);
                        const { obfuscatedSource, obfuscationSourceMap } = this.obfuscate(inputSource, fileName, identifiersPrefixCounter);
                        if (this.options.sourceMap && inputSourceMap) {
                            sourcemapOutput[fileName] = obfuscationSourceMap;
                            const transferredSourceMap = transferSourceMap({
                                fromSourceMap: obfuscationSourceMap,
                                toSourceMap: inputSourceMap
                            });
                            const finalSourcemap = JSON.parse(transferredSourceMap);
                            finalSourcemap['sourcesContent'] = inputSourceMap['sourcesContent'];
                            assets[fileName] = new webpack_1.sources.SourceMapSource(obfuscatedSource, fileName, finalSourcemap);
                        }
                        else {
                            assets[fileName] = new webpack_1.sources.RawSource(obfuscatedSource, false);
                        }
                        identifiersPrefixCounter++;
                    });
                });
            });
        });
    }
    shouldExclude(filePath) {
        return multimatch_1.default(filePath, this.excludes).length > 0;
    }
    extractSourceAndSourceMap(asset) {
        if (asset.sourceAndMap) {
            const { source, map } = asset.sourceAndMap();
            return { inputSource: source, inputSourceMap: map };
        }
        else {
            return {
                inputSource: asset.source(),
                inputSourceMap: asset.map()
            };
        }
    }
    obfuscate(javascript, fileName, identifiersPrefixCounter) {
        const obfuscationResult = javascript_obfuscator_1.default.obfuscate(javascript, Object.assign({ identifiersPrefix: `${WebpackObfuscatorPlugin.baseIdentifiersPrefix}${identifiersPrefixCounter}`, inputFileName: fileName, sourceMapMode: 'separate', sourceMapFileName: fileName + '.map' }, this.options));
        return {
            obfuscatedSource: obfuscationResult.getObfuscatedCode(),
            obfuscationSourceMap: obfuscationResult.getSourceMap()
        };
    }
}
exports.WebpackObfuscatorPlugin = WebpackObfuscatorPlugin;
WebpackObfuscatorPlugin.loader = require.resolve('../loader');
WebpackObfuscatorPlugin.allowedExtensions = [
    '.js',
    '.mjs'
];
WebpackObfuscatorPlugin.baseIdentifiersPrefix = 'a';
