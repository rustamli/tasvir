# tasvir

Tasvir is a tool for bulk image manipulations (resize, crop, optimize and more). It might be useful in context of static website generation to produce thumbnails and optimized versions of the content images. 

## Installation

```
npm install tasvir -g
```

## Configuration

Create a file named **tasvir.config.js** in root folder of your project:


```javascript

module.exports = {
  prefixSeparator: '--',
  
  paths: [
    'static/images/*',
    'static/users/photos/*'
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

- **prefixSeparator** - All processed images are saved in same folder as original image with additional prefixes. *prefixSeparator* specifies separator between original file name and prefix. For example `123.png` would be saved as `123--small.png` with *prefixSeparator: '--'* and *prefix: small*. Please note that tasvir ignores all files containing *prefixSeparator* in their names on consecutive runs. So in our example rules are not applied to `123--small.png` on second run. 
- **paths** - List of path patterns which specify files that should be processed inside the root folder (folder which contains tasvir.config.js). Matching is dong using [**glob**](https://github.com/isaacs/node-glob) library. 
- **rules** - List of rules to be applied for each file that is matched using the patterns in `paths`:

### Rules 

Each rule represents an object with single parameter `chain`. 
Each `chain` contains number `actions` to be applied to each photo:

```javascript
{
  chain: [
    { apply: 'resize', params: [ 600, 'AUTO' ] },
    { apply: 'write', prefix: 'w600' }
  ]
}
```

#### Actions

Tasvir uses [**jimp**](https://github.com/oliver-moran/jimp) for image manipulations. 
Every action in a `chain` is a call translated to a **jimp** method:

```javascript
{ apply: 'resize', params: [ 600, 'AUTO' ] },
{ apply: 'greyscale', params: [] },
{ apply: 'mirror', params: [] },
{ apply: 'write', prefix: 'small' }
```

Running this for `sample.png` Would be translated into: 

```javascript
image.resize(600, Jimp.AUTO).greyscale().mirror().write('sample--small.png');
```

Here are some of the actions supported: `crop`, `invert`, `flip`, `gaussian`, `blur`, `greyscale`, `sepia`, `opacity`, `resize`, `scale`, `rotate`, `blit`, `composite`, `brightness`, `contrast`, `posterize`, `mask`, `dither565`, `cover`, `contain`, `background`, `color`, `mirror`, `fade`. For their description and params, please refer to [**jimp**](https://github.com/oliver-moran/jimp) documentation.

#### Multiple writes per rule 

Please note that you can call `{ apply: 'write' }` multiple times per each rule:

```javascript
{ apply: 'resize', params: [ 600, 'AUTO' ] },
{ apply: 'write', prefix: 'sm' }
{ apply: 'greyscale', params: [] },
{ apply: 'mirror', params: [] },
{ apply: 'write', prefix: 'sm-gs-mr' }
```
This will produce two files `sample--sm.png` (resized to 600px in width) and `sample-sm-gs-mr.png` (resized to 600px in width, greyscaled and mirrored).

## Usage

### Normal mode

Execute in your project root folder (folder containing `tasvir.config.js`):

```
tasvir
```

All files containing `prefixSeparator` (for example `--`) will be ignored.
In normal mode tasvir will be applied only for files that were not previously processed. 
Before applying each rule to a file, tasvir checks whether files with resulting prefixes already exists in that case rule is ignored for that file.

So a rule for file `sample.png`: 

```
{ apply: 'resize', params: [ 600, 'AUTO' ] }, { apply: 'write', prefix: 'sm' }
```

will be ignored in case if a file named `sample--sm.png` exists

### Overwrite mode

Execute in your project root folder: 

```
tasvir overwrite
```

All files containing `prefixSeparator` (for example `--`) will still be ignored.

Unlike normal mode. All rules will be executed even, if resulting files already exist.

## Tinify integration

**tasvir.config.js**

```javascript

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
