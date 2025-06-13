import type { LoaderContext } from 'webpack';
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
}
declare function Loader(this: LoaderContext<LoaderOptions>, sourceCode: string, inputSourceMap?: Record<string, any>): void;
export = Loader;
