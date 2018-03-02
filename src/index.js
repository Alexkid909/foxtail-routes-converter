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

${success}`;

        console.log('final result', result);
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

function parseModule(name, module) {
    let promise = new Promise((resolve, reject) => {
        fs.readFile(module.path, 'utf8', (err, data) => {
            if(data) {
                let obj = {};
                data = JSON.parse(data);
                for (let resource in data) {
                    let resourceName = data[resource].resource;
                    if (!obj[resourceName]) {
                        obj[resourceName] = {}
                    };
                    obj[resourceName][resource] = data[resource];
                    delete obj[resourceName][resource].resource;
                }

                let module = `# Group ${name}
                ${parseResources(obj)}`;
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
        const array = [];
        for (let resource in resources) {
            array.push(`
## ${resource}
            `);
            array.push(parseResource(resources[resource]));
        }
        let result = array.join('');
        // console.log(result);
        return result;
    } else {
        return ''
    }
}

function parseResource(resourceData) {
    if (Object.keys(resourceData).length > 0) {
        let array = [];
        for (let action in resourceData)
        {
            let resource = resourceData[action];
            array.push(`
### ${action} [${resource.method} ${resource.path.uri}]${parseSamples(resource)}
            `);
        }
        let result = array.join('');
        return result;
    }
    // console.log(result);
    return result;
};

function parseSamples(resource) {

    const array = [];

    if (resource.sample.request) {
        let request = resource.sample.request;

        let requestString = `

        
+ Request ${request.headers ? `
        
    + Headers
        ${parseHeaders(request.headers)}` : ``} ${request.body ? `
                            
    + Body 
    ${JSON.stringify(request.body)}` : ``}`;
        array.push(requestString);
    }

    if (resource.sample.response) {


        let responses = resource.sample.response;


        for (let responseName in responses) {

            let response = responses[responseName];
            let responseString = `

+ Response ${responseName} ${response.headers ? `
        
    + Headers
        ${parseHeaders(response.headers)}` : ``} 
        ${response.body ? `                    
    + Body 
    
            ${JSON.stringify(response.body)}` : ``}`;
            array.push(responseString);
        }
    }

    if (array.length > 0) {
        return array.join('')
    } else {
        return ''
    };
}

function parseHeaders(headersJSON) {
    const array = [];
    for (let header in headersJSON) {
        array.push(parseHeader(header, headersJSON[header]));
    }
    return array.join('');
}

function parseHeader(header, headerJSON) {
    return `
        ${header} : ${headerJSON}`
}

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
