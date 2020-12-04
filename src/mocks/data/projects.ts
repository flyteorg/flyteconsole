export function emptyProject(id: string, name?: string) {
    return {
        id,
        name: name ?? id,
        domains: [],
        description: ''
    };
}
