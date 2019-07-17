import { Command } from '@oclif/command';
import {
  getConfiguration,
  getConfigurationValidationErrors,
  getResourceDefinitions,
  getResourceFiles,
  MocklyConfig,
  ResourceType,
  createAndHydrateResourcesDatabases,
  createAndHydrateJsonDatabase,
  getResponsesConfiguration,
  ResponseConfig,
  getResponsesConfigurationErrors,
  createAndHydrateResponsesConfigDatabase, getDataControllers, start, getResourcesControllers,
  getRewrites
} from '@mockly/server';

const CFonts = require('cfonts');

export class MocklyCli extends Command {
  static description = 'describe the command here';

  async run() {
    this.printTitle('Mockly');

    this.log('Welcome to Mockly! You will have your favourite mock server running soon!\n');

    const config = await this.getAndValidateConfiguration();

    const responsesConfig = await this.getAndValidateResponsesConfiguration(config.responsesConfigGlob);

    const resourcesFiles = await getResourceFiles(config.resourceFilesGlob);
    const rewrites = await getRewrites(config.rewritesFilesGlob);

    const resourcesDefinitions = await getResourceDefinitions(resourcesFiles);

    const restResourcesDefinitions = resourcesDefinitions.filter(def => def.type === ResourceType.REST_RESOURCE);
    const jsonResponseDefinitions = resourcesDefinitions.filter(def => def.type === ResourceType.JSON_RESPONSE);

    const resourcesDbsMap = await createAndHydrateResourcesDatabases(restResourcesDefinitions);
    const jsonDataDb = await createAndHydrateJsonDatabase(jsonResponseDefinitions);
    const responsesConfigDb = await createAndHydrateResponsesConfigDatabase(responsesConfig);

    resourcesDbsMap.set('data', jsonDataDb);
    resourcesDbsMap.set('responses', responsesConfigDb);

    const dataControllers = getDataControllers(jsonResponseDefinitions, config.prefix);
    const resourcesControllers = getResourcesControllers(restResourcesDefinitions, config.prefix);

    return await start([...resourcesControllers, ...dataControllers ], resourcesDbsMap, config, rewrites);
  }


  printTitle (title: string) {
    CFonts.say(title, {
      font: 'block',              // define the font face
      align: 'left',              // define text alignment
      colors: ['system'],         // define all colors
      background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
      letterSpacing: 1,           // define letter spacing
      lineHeight: 1,              // define the line height
      space: true,                // define if the output text should have empty lines on top and on the bottom
      maxLength: '0',             // define how many character can be on one line
    });
  };

  async getAndValidateConfiguration (): Promise<MocklyConfig> {
    const config = await getConfiguration();
    const errors = await getConfigurationValidationErrors(config);

    if (errors.length === 0) {
      return config;
    } else {
      this.error('Invalid configuration file!');
      return config;
    }
  }

  async getAndValidateResponsesConfiguration (glob: string): Promise<ResponseConfig[]> {
    const config = await getResponsesConfiguration(glob);
    const errors = await getResponsesConfigurationErrors(config);

    if (errors.length === 0 || errors.every(arr => arr.length === 0)) {
      return config;
    } else {
      this.error('Invalid responses configuration file!');
      return config;
    }
  }
}
