"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const server_1 = require("@mockly/server");
const CFonts = require('cfonts');
class MocklyCli extends command_1.Command {
    async run() {
        this.printTitle('Mockly');
        this.log('Welcome to Mockly! You will have your favourite mock server up soon!\n');
        const config = await this.getAndValidateConfiguration();
        const responsesConfig = await this.getAndValidateResponsesConfiguration(config.responsesConfigBlog);
        const resourcesFiles = await server_1.getResourceFiles(config.resourceFilesGlob);
        const resourcesDefinitions = await server_1.getResourceDefinitions(resourcesFiles);
        const restResourcesDefinitions = resourcesDefinitions.filter(def => def.type === server_1.ResourceType.REST_RESOURCE);
        const jsonResponseDefinitions = resourcesDefinitions.filter(def => def.type === server_1.ResourceType.JSON_RESPONSE);
        const resourcesDbsMap = await server_1.createAndHydrateResourcesDatabases(restResourcesDefinitions);
        const jsonDataDb = await server_1.createAndHydrateJsonDatabase(jsonResponseDefinitions);
        const responsesConfigDb = await server_1.createAndHydrateResponsesConfigDatabase(responsesConfig);
        resourcesDbsMap.set('data', jsonDataDb);
        resourcesDbsMap.set('responses', responsesConfigDb);
        const dataControllers = server_1.getJsonDataControllers(jsonResponseDefinitions);
        server_1.start(dataControllers, resourcesDbsMap, config, {});
    }
    printTitle(title) {
        CFonts.say(title, {
            font: 'block',
            align: 'left',
            colors: ['system'],
            background: 'transparent',
            letterSpacing: 1,
            lineHeight: 1,
            space: true,
            maxLength: '0',
        });
    }
    ;
    async getAndValidateConfiguration() {
        const config = await server_1.getConfiguration();
        const errors = await server_1.getConfigurationValidationErrors(config);
        if (errors.length === 0) {
            return config;
        }
        else {
            this.error('Invalid configuration file!');
            return config;
        }
    }
    async getAndValidateResponsesConfiguration(glob) {
        const config = await server_1.getResponsesConfiguration(glob);
        const errors = await server_1.getResponsesConfigurationErrors(config);
        if (errors.length === 0 || errors.every(arr => arr.length === 0)) {
            return config;
        }
        else {
            this.error('Invalid responses configuration file!');
            return config;
        }
    }
}
MocklyCli.description = 'describe the command here';
exports.MocklyCli = MocklyCli;
