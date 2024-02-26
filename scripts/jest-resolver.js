// https://github.com/ai/nanoid/issues/363#issuecomment-1159440858

function Resolver(path, options) {
  return options.defaultResolver(path, {
    ...options,
    packageFilter: (pkg) => {
      if (pkg.name === 'nanoid') {
        // eslint-disable-next-line
        delete pkg.exports;
        // eslint-disable-next-line
        delete pkg.module;
      }
      return pkg;
    },
  });
}

module.exports = Resolver;
