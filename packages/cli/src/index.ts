import { Command } from '@oclif/command';
// tslint:disable-next-line:nx-enforce-module-boundaries
import {
  createAndHydrateJsonDatabase,
  createAndHydrateResourcesDatabases,
  createAndHydrateResponsesConfigDatabase,
  getConfiguration,
  getConfigurationValidationErrors,
  getControllers,
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
  start,
  MocklyWatcher
} from '@mockly/server';
import { Logger } from '@nestjs/common';

const CFonts = require('cfonts');

export class MocklyCli extends Command {
  static description = 'describe the command here';

  async run(restarting = false) {
    if (!restarting) {
      this.printTitle('Mockly');

      this.log(
        'Welcome to Mockly! You will have your favourite mock server running soon!\n'
      );
    }

    const config = await this.getAndValidateConfiguration();

    const responsesConfig = await this.getAndValidateResponsesConfiguration(
      config.responsesConfigGlob
    );

    const rewrites = await this.getAndValidateRewritesConfiguration(
      config.rewritesFilesGlob
    );

    const definitions = await getResourcesAndDataDefinitions(
      config.resourceFilesGlob
    );

    const dbsMap = await this.getDatabasesMap(definitions, responsesConfig);

    const controllers = getControllers(definitions, config.prefix);

    const app = await start(controllers, dbsMap, config, rewrites);

    const watcher = new MocklyWatcher(config);

    watcher.changes$.subscribe(async path => {
      this.log('\nChanges detected. Restarting the server...\n');
      await app.close();
      await this.run(true);
    });

    watcher.start(app);
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

  async getAndValidateConfiguration(): Promise<MocklyConfig> {
    const config = await getConfiguration();
    const errors = await getConfigurationValidationErrors(config);

    if (errors.length === 0) {
      return config;
    } else {
      this.error('Invalid configuration file!');
      return config;
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
