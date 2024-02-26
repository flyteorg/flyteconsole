const rules = require('./eslint-custom-path');

const plugin = { rules: { 'enforce-path': rules } };
module.exports = plugin;
