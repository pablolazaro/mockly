import { ResourceType } from './resource-type';

export interface ResourceDefinition {
  name: string;
  resources: any;
  type: ResourceType;
}
