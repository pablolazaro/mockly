import { Command, flags } from '@oclif/command';
import cli from 'cli-ux';
// tslint:disable-next-line:nx-enforce-module-boundaries
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
} from '@mockly/core';
import { join } from 'path';
import * as tsNode from 'ts-node';
import { cwd } from 'process';

const CFonts = require('cfonts');

export class MocklyCli extends Command {
  static description = 'starts Mockly server';

  static flags = {
    tsConfig: flags.string({
      description: 'path to TS config file',
      dependsOn: ['controllers'],
      helpValue: '**/*.my-controller.ts'
    }),
    controllers: flags.string({
      description: 'glob to retrieve custom controllers files',
      default: '**/*.custom-controller.ts',
      helpValue: '**/*.my-controller.ts'
    }),
    resources: flags.string({
      description: 'glob to retrieve resource files',
      default: '**/*.resource.json',
      helpValue: '**/*.db.json'
    }),
    rewrites: flags.string({
      description: 'glob to retrieve rewrites files',
      default: '**/*.rewrites.json',
      helpValue: '**/*.proxy.json'
    }),
    responses: flags.string({
      description: 'glob to retrieve responses files',
      default: '**/*.responses.json',
      helpValue: '**/*.responses.json'
    }),
    prefix: flags.string({
      description: 'prefix',
      helpValue: '/api'
    }),
    delay: flags.integer({
      description: 'sets a delay for all responses',
      default: 0,
      helpValue: '500'
    }),
    port: flags.integer({
      description: 'server port',
      default: 3100,
      helpValue: '3200'
    })
  };

  async run() {
    this.printTitle('Mockly');

    this.log(
      'Welcome to Mockly! You will have your favourite mock server running soon!\n'
    );

    cli.action.start('Fetching Mockly configuration');
    const options = this.parse(MocklyCli).flags;
    const configFromOptions = this.getConfigFromOptions(options);
    const config = await this.getAndValidateConfiguration(configFromOptions);
    cli.action.stop();

    cli.action.start('Fetching responses configuration');
    const responsesConfig = await this.getAndValidateResponsesConfiguration(
      config.responsesConfigGlob
    );
    cli.action.stop();

    cli.action.start('Fetching rewrites');
    const rewrites = await this.getAndValidateRewritesConfiguration(
      config.rewritesFilesGlob
    );
    cli.action.stop();

    cli.action.start('Fetching resources and data');
    const definitions = await getResourcesAndDataDefinitions(
      config.resourceFilesGlob
    );
    cli.action.stop();

    cli.action.start('Fetching custom controllers');

    let customControllers = [];

    try {
      const tsConfigPath = options.tsConfig;

      if (tsConfigPath) {
        tsNode.register({
          project: join(cwd(), tsConfigPath)
        });
      }

      customControllers = await getCustomControllers(
        config.customControllersGlob
      );
    } catch (error) {
      this.warn(
        'An error occurred importing a custom controller. If you are creating custom controllers you should pass a tsconfig file!'
      );
      this.error(error);
    }

    cli.action.stop();

    cli.action.start('Creating databases');
    const dbsMap = await this.getDatabasesMap(definitions, responsesConfig);
    cli.action.stop();

    cli.action.start('Creating resources and data controllers');
    const controllers = getControllers(definitions, config.prefix);
    cli.action.stop();

    cli.action.start('Starting the server');

    const app = await start(
      [...customControllers, ...controllers],
      dbsMap,
      config,
      rewrites
    );

    cli.action.stop();

    return app;
  }

  printTitle(title: string) {
    CFonts.say(title, {
      font: 'block', // define the font face
      align: 'left', // define text alignment
      colors: ['system'], // define all colors
      background: 'transparent', // define the background color, you can also use `backgroundColor` here as key
      letterSpacing: 1, // define letter spacing
      lineHeight: 1, // define the line height
      space: true, // define if the output text should have empty lines on top and on the bottom
      maxLength: '0' // define how many character can be on one line
    });
  }

  getConfigFromOptions(options: any): MocklyConfig {
    return new MocklyConfig(
      options.controllers,
      options.delay,
      options.port,
      options.prefix,
      options.resources,
      options.rewrites,
      options.responses
    );
  }

  async getAndValidateConfiguration(
    configFromOptions: MocklyConfig
  ): Promise<MocklyConfig> {
    const config = await getConfiguration();
    const mergedConfig = { ...config, ...configFromOptions };
    const errors = await getConfigurationValidationErrors(mergedConfig);

    if (errors.length === 0) {
      return mergedConfig;
    } else {
      this.error('Invalid configuration file!');
      return mergedConfig;
    }
  }

  async getAndValidateResponsesConfiguration(
    glob: string
  ): Promise<ResponseConfig[]> {
    const config = await getResponsesConfiguration(glob);
    const errors = await getResponsesConfigurationErrors(config);

    if (errors.length === 0 || errors.every(arr => arr.length === 0)) {
      return config;
    } else {
      this.error('Invalid responses configuration file!');
      return config;
    }
  }

  async getAndValidateRewritesConfiguration(
    glob: string
  ): Promise<RewriteConfig[]> {
    const rewrites = await await getRewrites(glob);
    const errors = await getRewritesConfigurationErrors(rewrites);

    if (errors.length === 0 || errors.every(arr => arr.length === 0)) {
      return rewrites;
    } else {
      this.error('Invalid rewrites configurations!');
      return rewrites;
    }
  }

  async getDatabasesMap(
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
}
