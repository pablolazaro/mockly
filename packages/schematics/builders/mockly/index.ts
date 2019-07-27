import {
  BuilderOutput,
  createBuilder,
  BuilderContext,
  Target
} from '@angular-devkit/architect';
import { JsonObject, workspaces } from '@angular-devkit/core';
import { NodeJsSyncHost } from '@angular-devkit/core/node';
import {
  createAndHydrateJsonDatabase,
  createAndHydrateResourcesDatabases,
  createAndHydrateResponsesConfigDatabase,
  getConfiguration,
  getConfigurationValidationErrors,
  getControllers,
  getCustomControllers,
  getResourcesAndDataDefinitions,
  getResponsesConfiguration,
  getResponsesConfigurationErrors,
  getRewrites,
  getRewritesConfigurationErrors,
  MocklyConfig,
  ResourceDefinition,
  ResourceType,
  ResponseConfig,
  RewriteConfig,
  start
} from '@mockly/server';

import { join } from 'path';

import * as tsNode from 'ts-node';

export default createBuilder(_commandBuilder);
async function _commandBuilder(
  options: JsonObject,
  context: BuilderContext
): Promise<BuilderOutput> {
  context.reportStatus(`Executing Mockly...`);

  const sourceRoot = await getSourceRoot(context);
  const targetOptions = await context.getTargetOptions(
    context.target as Target
  );
  const appDirectory = join(context.workspaceRoot, sourceRoot as string);

  const tsconfig = join(
    context.workspaceRoot,
    targetOptions.tsConfig as string
  );

  tsNode.register({
    project: join(context.workspaceRoot, targetOptions.tsConfig as string)
  });

  context.reportProgress(0, 8, 'Reading configuration');
  const config = await getAndValidateConfiguration();

  context.reportProgress(1, 8, 'Reading resource files');
  const definitions = await getResourcesAndDataDefinitions(
    config.resourceFilesGlob,
    appDirectory
  );

  context.logger.debug('definitions', definitions as any);

  context.reportProgress(2, 8, 'Reading rewrites files');
  const rewrites = await getAndValidateRewritesConfiguration(
    config.rewritesFilesGlob,
    appDirectory
  );

  context.logger.debug('rewrites', rewrites as any);

  context.reportProgress(3, 8, 'Reading responses configuration files');
  const responsesConfig = await getAndValidateResponsesConfiguration(
    config.responsesConfigGlob,
    appDirectory
  );

  context.logger.debug('responsesConfig', responsesConfig as any);

  context.reportProgress(4, 8, 'Reading custom controller files');
  const customControllers = await getCustomControllers(
    config.customControllersGlob,
    appDirectory
  );

  context.logger.debug('customControllers', customControllers as any);

  context.reportProgress(5, 8, 'Creating and hydrating databases');
  const dbsMap = await getDatabasesMap(definitions, responsesConfig);

  context.reportProgress(6, 8, 'Creating controllers');
  const controllers = getControllers(definitions, config.prefix);

  context.reportProgress(7, 8, 'Starting the server');
  await start([...customControllers, ...controllers], dbsMap, config, rewrites);

  context.reportProgress(8, 8, 'Mockly started');
  context.reportStatus('DONE!');
  return new Promise(() => {});
}

async function getAndValidateConfiguration(): Promise<MocklyConfig> {
  const config = await getConfiguration();
  const errors = await getConfigurationValidationErrors(config);

  if (errors.length === 0) {
    return config;
  } else {
    // this.error('Invalid configuration file!');
    return config;
  }
}

async function getAndValidateResponsesConfiguration(
  glob: string,
  currentWorkingDirectory: string
): Promise<ResponseConfig[]> {
  const config = await getResponsesConfiguration(glob, currentWorkingDirectory);
  const errors = await getResponsesConfigurationErrors(config);

  if (errors.length === 0 || errors.every(arr => arr.length === 0)) {
    return config;
  } else {
    // this.error('Invalid responses configuration file!');
    return config;
  }
}

async function getAndValidateRewritesConfiguration(
  glob: string,
  currentWorkingDirectory: string
): Promise<RewriteConfig[]> {
  const rewrites = await await getRewrites(glob, currentWorkingDirectory);
  const errors = await getRewritesConfigurationErrors(rewrites);

  if (errors.length === 0 || errors.every(arr => arr.length === 0)) {
    return rewrites;
  } else {
    // this.error('Invalid rewrites configurations!');
    return rewrites;
  }
}

async function getDatabasesMap(
  definitions: ResourceDefinition[],
  responsesConfig: ResponseConfig[]
): Promise<Map<string, PouchDB.Database>> {
  const restResourcesDefinitions = definitions.filter(
    def => def.type === ResourceType.REST_RESOURCE
  );

  const jsonDataDefinitions = definitions.filter(
    def => def.type === ResourceType.JSON_DATA
  );
  const resourcesDbsMap = await createAndHydrateResourcesDatabases(
    restResourcesDefinitions
  );
  const jsonDataDb = await createAndHydrateJsonDatabase(jsonDataDefinitions);
  const responsesConfigDb = await createAndHydrateResponsesConfigDatabase(
    responsesConfig
  );

  resourcesDbsMap.set('data', jsonDataDb);
  resourcesDbsMap.set('responses', responsesConfigDb);

  return resourcesDbsMap;
}

async function getSourceRoot(context: BuilderContext) {
  const workspaceHost = workspaces.createWorkspaceHost(new NodeJsSyncHost());
  const { workspace } = await workspaces.readWorkspace(
    context.workspaceRoot,
    workspaceHost
  );
  // @ts-ignore
  if (workspace.projects.get(context.target.project).sourceRoot) {
    // @ts-ignore
    return workspace.projects.get(context.target.project).sourceRoot;
  } else {
    context.reportStatus('Error');

    const message = `${
      // @ts-ignore
      context.target.project
    } does not have a sourceRoot. Please define one.`;
    context.logger.error(message);
    throw new Error(message);
  }
}
