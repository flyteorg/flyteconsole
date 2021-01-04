import { projects } from './data/projects';
import { MockServer } from './server';

/** Inserts default global mock data. This can be extended by inserting additional
 * mock data fixtures.
 */
export function insertDefaultData(server: MockServer): void {
    server.insertProjects([projects.flyteTest]);
}
