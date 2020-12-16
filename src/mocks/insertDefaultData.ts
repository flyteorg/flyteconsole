import { projects } from './data/projects';
import { MockServer } from './server';

export function insertDefaultData(server: MockServer): void {
    server.insertProjects([projects.flyteTest]);
}
