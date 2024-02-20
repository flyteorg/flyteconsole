/* eslint-disable no-debugger */
const packages = [
  'lodash',
  '@mui/material',
  '@mui/icons-material',
  '@mui/lab',
  '@mui/x-date-pickers',
  '@mui/joy',
  '@mui/system',
  '@mui/styles',
  '@mui/x-tree-view',
  '@mui/styled-engine',
];

const importPathOverrides = {
  '@mui/material': {
    DefaultComponentProps: { path: '@mui/material/OverridableComponent', isTypeImport: true },
    OverridableTypeMap: { path: '@mui/material/OverridableComponent', isTypeImport: true },
    Theme: { path: '@mui/material/styles', isTypeImport: true },
    createTheme: { path: '@mui/material/styles' },
    ThemeOptions: { path: '@mui/material/styles', isTypeImport: true },
    ThemeProvider: {
      path: '@mui/material/styles',
      isTypeImport: false,
    },
    SelectChangeEvent: { path: '@mui/material/Select', isTypeImport: true },
    SxProps: { path: '@mui/material/styles', isTypeImport: true },
    styled: { path: '@mui/material/styles' },
    useTheme: { path: '@mui/material/styles' },
    toolbarClasses: {
      path: '@mui/material/Toolbar',
    },
    tooltipClasses: {
      path: '@mui/material/Tooltip',
      isTypeImport: false,
    },
    debounce: { path: '@mui/material/utils' },
    alpha: { path: '@mui/system/colorManipulator' },
    shadows: { path: '@mui/material/styles' },
  },
  '@mui/system': {
    Theme: { path: '@mui/system/createTheme', isTypeImport: true },
  },
  '@mui/styles': {
    CSSProperties: {
      path: '@mui/styles/withStyles',
      isTypeImport: true,
    },
  },
};
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forces MUI and lodash to',
      recommended: true,
    },
    fixable: 'code',
    schema: [], // no options
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const { specifiers, source } = node;
        const { value: sourcePackageName } = source;

        const packageName = packages.find((v) => sourcePackageName.startsWith(v));
        if (packageName) {
          const importMap = specifiers.reduce((acc, specifier) => {
            const { type, importKind, imported, local } = specifier;
            const importedComponentName = imported?.name || local?.name;
            const importAlias = local?.name;

            const override = importPathOverrides[packageName]?.[importedComponentName];
            const overridenPath = override?.path;
            const isTypeImport =
              importKind === 'type' ||
              override?.isTypeImport ||
              importedComponentName.endsWith('Props');

            let key;
            if (overridenPath) {
              key = overridenPath;
            } else {
              const endImportPathSection = isTypeImport
                ? importedComponentName.replace(/Props$/, '')
                : importedComponentName;
              key = `${packageName}/${endImportPathSection}`;
            }

            const isDefaultImport =
              type === 'ImportDefaultSpecifier' || key.endsWith(importedComponentName);

            if (
              key === sourcePackageName ||
              key.split('/').length <= sourcePackageName.split('/').length
            ) {
              // the import doesn/t need processing
              return acc;
            }

            if (!acc[key]) {
              acc[key] = {};
            }

            if (isTypeImport) {
              acc[key].types = [...(acc[key].types || []), importAlias];
            } else if (isDefaultImport) {
              // default import
              acc[key].default = importAlias;
            } else {
              // named import
              acc[key].named = [...(acc[key].named || []), importAlias];
            }

            return acc;
          }, {});

          const importKeys = Object.keys(importMap);
          if (!importKeys.length) {
            return;
          }
          const finalImports = importKeys
            .map((v) => {
              const { default: defaultImport, types = [], named = [] } = importMap[v];
              const sortedNamedImports = named.sort();
              const sortedTypeImports = types.sort().map((t) => `type ${t}`);
              let importArray = [defaultImport];
              if (sortedNamedImports.length || sortedTypeImports.length) {
                const namedImportString = [
                  ...(sortedNamedImports || []),
                  ...(sortedTypeImports || []),
                ].join(', ');
                importArray.push(`{ ${namedImportString} }`);
              }
              importArray = importArray.filter((v) => v);
              const importString = `import ${importArray.join(', ')} from '${v}';`;
              return importString;
            })
            .join('\n');
          context.report({
            node,
            message: `Import specificity for ${packageName}`,
            fix(fixer) {
              return fixer.replaceText(node, finalImports);
            },
          });
        }
      },
    };
  },
};
