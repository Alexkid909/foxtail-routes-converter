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


function parseAll() {
    parseModules(apiRoutes).then(success => {
        const result = `
FORMAT: 1A

#Chemistry CMS API

${success}
`;

        // console.log(result);
        writeOutput(result);
    });
};

parseAll();

function writeOutput(string) {

    fs.mkdir('blueprint', () => {
        fs.writeFile('./blueprint/API.apib',string,'utf8');
    });
}


function parseModules(modules) {
    const promises = [];
    for (let moduleName in modules) {
        let module = modules[moduleName];
        promises.push(parseModule(moduleName, module));
    };
    return Promise.all(promises).then(success => {
            return success;
        },error => console.log(error)
    );
};

function parseResponseExamples(examplesObj) {

    if (examplesObj) {
        const array = [];
        for (let exampleProp in examplesObj) {
            let example = examplesObj[exampleProp];
            // console.log('ex', JSON.stringify(examplesObj[example]));
            let exampleString = `
        
        + Response ${exampleProp} ${example.headers ? `
        
            + Headers
            ${parseHeaders(example.headers)}` : ``} ${example.body ? `+ Body ${JSON.stringify(example.body)}` : ``}`;
            array.push(exampleString);
        }
        return array.join('');
    } else {
        return ``;
    }
}

function parseHeaders(headersJSON) {
    const array = [``];
    for (let header in headersJSON) {
        array.push(`
                ${header} : ${headersJSON[header]}`);
    }
    return array.join('');
}


function parseModule(name, module) {
    let promise = new Promise((resolve, reject) => {
        fs.readFile(module.path, 'utf8', (err, data) => {
            if(data) {
                let obj = {};
                data = JSON.parse(data);
                // console.log('*** data ***', data);
                for (let resource in data) {
                    // console.log(resource);
                    let resourceName = data[resource].resource;
                    if (!obj[resourceName]) {
                        obj[resourceName] = {}
                    };
                    obj[resourceName][resource] = data[resource];
                    delete obj[resourceName][resource].resource;
                }
                // console.log('***obj***', obj);

                let module = `# Group ${name}${parseResources(obj)}`;
                resolve(module);
            } else {
                reject(err);
            };
        });
    });
    return promise;
}

function parseResources(resources) {
    if (resources) {
        console.log('resources', resources);
        const array = [];
        for (resource in resources) {
            array.push(parseResource(resource, resources[resource]));
        }
        let result = array.join('');
    } else {
        return ''
    }
}

function parseResource(name, resourceData) {
    if (resourceData.hasOwnProperty('resource') && resourceData.hasOwnProperty('path')) {
        return result =`
        
## ${resourceData.resource} [${resourceData.path.uri}]

### ${name} [${resourceData.method}]${parseResponseExamples(resourceData.sample)}${parsePathParameters(resourceData.path.parameters)}`;
    }
};

function parsePathParameters(pathParams) {
    const array = [];
    if(pathParams) {
        array.push(`
        
        + Parameters`);
        for (let param in pathParams) {
            let pathParam = pathParams[param];
            let paramString = `
            
            + ${param} (${pathParam.type})${pathParam.description ? ` - ${pathParam.description}` : ``}`;
            array.push(paramString);
        }
        return array.join('');
    } else {
        return '';
    }
}
