const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

const port = '8000';
const apiRoutes = {
    assetmanager: {
        path: './assets/assetmanager.json'
    }/*,
    base: {
        path: './assets/base.json'
    },
    cms: {
        path: './assets/cms.json'
    },
    commerce: {
        path: './assets/commerce.json'
    },
    filemanager: {
        path: './assets/filemanager.json'
    },
    forms: {
        path: './assets/forms.json'
    },
    oauth: {
        path: './assets/oauth.json'
    },
    platform: {
        path: './assets/platform.json'
    },
    search: {
        path: './assets/search.json'
    },
    site: {
        path: './assets/site.json'
    },
    user: {
        path: './assets/user.json'
    }*/
};

// app.listen(port, () => {
//     console.log(`We are live on ${port}`);
// });

function parseAll() {
    parseModules().then(success => {
        const result = `
FORMAT: 1A

#Chemistry CMS API

${success}`;

        console.log(result);
        writeOutput(result);
    });
};

parseAll();

function writeOutput(string) {
    fs.writeFile('./output/file.json',string,'utf8');
}


function parseModules() {
    const promises = [];
    for (let moduleName in apiRoutes) {
        let module = apiRoutes[moduleName];
        promises.push(parseModule(moduleName, module));
        console.log('promises', promises);
    };
    return Promise.all(promises).then(success => {
            console.log();
            return success;
        },error => console.log(error)
    );
};

function parseResponseExamples(examplesObj) {
    const array = [];
    for (let example in examplesObj) {
        let exampleString = `
+ Response ${example} ${examplesObj[example]}
`;
        array.push(exampleString);
    }
    return array.join('');
}

function parseModule(name, module) {
    let promise = new Promise((resolve, reject) => {
        fs.readFile(module.path, 'utf8', (err, data) => {
            if(data) {
                let module = `# Group ${name}
                
${parseResources(JSON.parse(data))}
`;
                resolve(module);
            } else {
                reject(err);
            };
        });
    });
    return promise;
}

function parseResources(resources) {
    const array = [];
    for (resource in resources) {
        array.push(parseResource(resource, resources[resource]));
    }
    return array.join('');
}

function parseResource(name, resourceData) {
    const result =`## ${resourceData.resource} [${resourceData.path.uri}]

### ${name} [${resourceData.method}]
${parseResponseExamples(resourceData.sample)}
${parsePathParameters(resourceData.path.parameters)}
`;
    return result;
};

function parsePathParameters(pathParams) {
    const array = [];
    if(pathParams) {
        array.push(`+ Parameters`);
        for (let param in pathParams) {
            let exampleString = `
        + ${param} (${pathParams[param].type})- ${pathParams[param].description}`;
            array.push(exampleString);
        }
        return array.join('');
    } else {
        return ``;
    }
}
