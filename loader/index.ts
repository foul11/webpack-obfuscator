"use strict";

import type { LoaderContext } from 'webpack';
import type { RawSourceMap } from 'source-map';
import { SourceMapConsumer, SourceMapGenerator } from 'source-map';
import JavaScriptObfuscator, { ObfuscatorOptions } from 'javascript-obfuscator';
import loaderUtils from 'loader-utils';
import * as path from 'path';

type WebpackObfuscatorOptions = Omit<
    ObfuscatorOptions,
    | 'inputFileName'
    | 'sourceMapBaseUrl'
    | 'sourceMapFileName'
    | 'sourceMapMode'
    | 'sourceMapSourcesMode'
>;

interface LoaderOptions {
    silent: boolean;
    logInfoToStdOut: boolean;
    instance: string;
    compiler: string;
    configFile: string;
    context: string;
    transpileOnly: boolean;
    ignoreDiagnostics: number[];
    reportFiles: string[];
    onlyCompileBundledFiles: boolean;
    colors: boolean;
    appendTsSuffixTo: (RegExp | string)[];
    appendTsxSuffixTo: (RegExp | string)[];
    happyPackMode: boolean;
    experimentalWatchApi: boolean;
    allowTsInNodeModules: boolean;
    experimentalFileCaching: boolean;
    projectReferences: boolean;
    useCaseSensitiveFileNames?: boolean;
};

/**
 * @see https://github.com/TypeStrong/ts-loader/blob/847a24936aa12fa18dab21ca8ec37595cadc72c6/src/index.ts#L699
 */
function mapToInputSourceMap(
    sourceMap: RawSourceMap,
    loaderContext: LoaderContext<LoaderOptions>,
    inputSourceMap: RawSourceMap
): Promise<RawSourceMap> {
    return new Promise<RawSourceMap>((resolve, reject) => {
        const inMap: RawSourceMap = {
            file: loaderContext.remainingRequest,
            mappings: inputSourceMap.mappings,
            names: inputSourceMap.names,
            sources: inputSourceMap.sources,
            sourceRoot: inputSourceMap.sourceRoot,
            sourcesContent: inputSourceMap.sourcesContent,
            version: inputSourceMap.version,
        };
        Promise.all([
            new SourceMapConsumer(inMap),
            new SourceMapConsumer(sourceMap),
        ])
            .then(sourceMapConsumers => {
                try {
                    const generator = SourceMapGenerator.fromSourceMap(
                        sourceMapConsumers[1]
                    );
                    generator.applySourceMap(sourceMapConsumers[0]);
                    const mappedSourceMap = generator.toJSON();

                    // before resolving, we free memory by calling destroy on the source map consumers
                    sourceMapConsumers.forEach(sourceMapConsumer =>
                        sourceMapConsumer.destroy()
                    );
                    resolve(mappedSourceMap);
                } catch (e) {
                    //before rejecting, we free memory by calling destroy on the source map consumers
                    sourceMapConsumers.forEach(sourceMapConsumer =>
                        sourceMapConsumer.destroy()
                    );
                    reject(e);
                }
            })
            .catch(reject);
    });
}

/**
 * JavaScript Obfuscator loader based on `obfuscator-loader` package
 */
function Loader(this: LoaderContext<LoaderOptions>, sourceCode: string, inputSourceMap?: Record<string, any>) {
    // @ts-ignore
    const context = this;

    const relativePathOfModule = path.relative(context.rootContext, context.resourcePath);
    const callback = this.async()

    // Obfuscates commented source code
    const options = loaderUtils.getOptions<WebpackObfuscatorOptions>(context as { query: string }) || {};
    const { obfuscatedSource, obfuscationSourceMap } = JavaScriptObfuscator.obfuscate(
        sourceCode,
        {
            ...options,
            ignoreRequireImports: true,
            inputFileName: relativePathOfModule,
            sourceMapMode: 'separate'
        }
    );

    if (obfuscationSourceMap === undefined || !inputSourceMap) {
        callback(null, obfuscatedSource, obfuscationSourceMap);
        return;
    }

    mapToInputSourceMap(obfuscationSourceMap, context, inputSourceMap as RawSourceMap)
        .then(mappedSourceMap => {
            callback(null, obfuscatedSource, mappedSourceMap);
        })
        .catch((e: Error) => {
            callback(e);
        });
}

export = Loader;
