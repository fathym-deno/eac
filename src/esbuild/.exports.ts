import * as esbuild from "npm:esbuild@0.23.1";
export { esbuild };

export {
  denoLoaderPlugin,
  denoPlugins,
  urlToEsbuildResolution,
} from "jsr:@luca/esbuild-deno-loader@0.10.3";

export type ESBuild = {
  context: typeof esbuild.context;
  build: typeof esbuild.build;
  buildSync: typeof esbuild.buildSync;
  transform: typeof esbuild.transform;
  transformSync: typeof esbuild.transformSync;
  formatMessages: typeof esbuild.formatMessages;
  formatMessagesSync: typeof esbuild.formatMessagesSync;
  analyzeMetafile: typeof esbuild.analyzeMetafile;
  analyzeMetafileSync: typeof esbuild.analyzeMetafileSync;
  initialize: typeof esbuild.initialize;
  stop: typeof esbuild.stop;
  version: typeof esbuild.version;
};

export type ESBuildOptions = esbuild.BuildOptions;

export type ESBuildContext<
  ProvidedOptions extends ESBuildOptions = ESBuildOptions,
> = esbuild.BuildContext<ProvidedOptions>;
