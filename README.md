A closure TrogEditor plugin for image uploading/inserting.
==========================================================

## DESCRIPTION

google-closure-image-plugin is a TrogEditor plugin like the one exists in
Gmail. It uploading file or inserting a url on the web.

Uploading using an iframe(goog.net.iframeio) which is automatically fired when
a using picked a local file.

## INSTALLATION

There are two ways to using this plugin, one was:

### copy to closure library dir

 * copy editor/* to closure/goog/editor/plugins/
 * update closure/goog/deps.js
 * edit closure/goog/editor/command, add image plugin:

    goog.editor.Command = {
                        ....
                        IMAGE: 'ImageDialogPlugin'
    }

 * require and register your plugin just like the others:

    goog.require('goog.editor.plugins.ImageBubble');
    goog.require('goog.editor.plugins.ImageDialogPlugin');
    ...
    var trogField = new goog.editor.Field(editorId);
    ...
    trogField.registerPlugin(new goog.editor.plugins.ImageBubble());
    trogField.registerPlugin(new goog.editor.plugins.ImageDialogPlugin(config));


### Or if you want to make upstream closure clean

Assume your dir placed like:

    .
    |-- closure
    |-- google-closure-image-plugin

In your html:

    <script src="closure/closure/goog/base.js" type="text/javascript"></script> 
    <script src="closure-closure-image-plugin/deps.js type="text/javascript"></script>

Then require and register your plugin just like above, the difference is you
need to set Command.IMAGE to ImageDialogPlugin:

    var buttons = [
      ...
      goog.editor.Command.IMAGE,
      ...
    ];
    goog.editor.Command.IMAGE = 'ImageDialogPlugin';

For a full example please checkout editor.js which is the one we are using, it
replace the textarea with closure trog editor.

## Config

For file upload, the plugin need to know the form action url, you could pass
the config when register the plugin, it also allow you to append extra code to
upload form, eg, you want to append a hidden token value to the form.

    {
      actionUrl : '/upload',
      extraCode: '<input name="token" type="hidden" value="TOKEN_VALUE_FOO" />'
    }
    ...
    trogField.registerPlugin(new goog.editor.plugins.ImageDialogPlugin(config));

## upload returns

    // on succcess
    {"status": 0, "imageUrl": "http://youdomain/foo.png"}

    // on error
    {"status": 1, "errorMsg": "Upload failed!"}


## Thanks

This plugin influenced by the followings:

 * [[http://github.com/shripadk/google-closure-image-plugin/ | shripadk's google-closure-image-plugin]]
 * closure link plugin

