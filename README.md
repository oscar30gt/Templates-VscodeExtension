# Templates README

Save file templates and load them when creating new files

## Features

-   Customize the initial content of your files you create in your workspace.

## Extension Settings

-   `fileTemplates.initialContentTemplates`: Sets the initial content of the files.
```json
// settings.json
"codeTemplates.initialContentTemplates":
[
    {
        "fileExtensions": [ ".jsx" ], // File types that use this template
        "templateFile": "path/to/template.txt", // Use the extension you want. The file will be read as raw text
    },
    {
        "fileExtensions": [ ".cpp", ".c++" ], // You can use the same template for various file types
        "templateFile": "path/to/other/template.txt",
    }
],
```

## Placeholders

You can use the following placeholders in order to dynamically set the content of the file:
- `[FILENAME]`: Name of the file (with extension)
- `[FILENAMENOEXTENSION]`: Name of the file (with no extension)

**Template example:**
```
/*
 * [FILENAMENOEXTENSION]
 */

#include <iostream>

using namespace std;

int main()
{
    return 0;
}
```

## Issues

This is an initial release. Any report or suggestion means a lot. Send them by [mail](mailto:oscar30dev@gmail.com) or as a [GitHub issue](https://github.com/oscar30gt/Templates-VscodeExtension/issues/new)!