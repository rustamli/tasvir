# tasvir

Bulk image manipulation tool

## Installation

```
npm install tasvir -g
```

## Running

Normal mode:

```
tasvir
```

Overwrite mode (will force tinification):

```
tasvir overwrite
```

## Sample configuration file:

**tasvir.config.js**

```

module.exports = {
  prefixSeparator: '--',

  tinify: {
    enabled: true,
    apiKey: '<YOUR-KEY>',
    saveOriginal: true,
    originalPrefix: 'orig',
  },

  paths: [
    'static/images/*'
  ],

  rules: [
    {
      chain: [
        { apply: 'resize', params: [ 600, 'AUTO' ] },
        { apply: 'write', prefix: 'w600' }
      ]
    },
    {
      chain: [
        { apply: 'cover', params: [ 300, 300 ] },
        { apply: 'write', prefix: 'sq' }
      ]
    }
  ]
};

```
