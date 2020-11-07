import { fileURLToPath } from 'url';
import { join as pathJoin, dirname } from 'path';
import fetch from "node-fetch";
import server from 'server';
import blobPolyfill from 'blob-polyfill';
import { getCertificates, getCertificate, certificatePDF, pdfName } from './certificates';
import { ENV, getProfile, profile as computeProfile, COUNTER_START_DATE } from './config';
import { reasonFields, fromFrenchDate, incrementCounter, readCounter } from './help';
import hbs from './hbs';
import App from './app';

global.fetch = fetch;
const { get, post } = server.router;
const { send, json, type, render } = server.reply;
const { Blob } = blobPolyfill;

const serverOptions = { 
    port: 8080, 
    log: 'notice', 
    views: 'templates',
};

const app = App(serverOptions);

app.get('/get-short', 
    async function certificateDownload(context){
        try{
            const profile = getProfile(context.query.id, context.query.delay);
            const reasons = context.query.reasons.split(',');
            return await downloadPDF(profile, reasons);
        }
        catch (error){ 
            return {'error': `${error}`};
        }
    }
);

app.get('/get',
    async function certificateNoConfig(context){
        incrementCounter('get');
        const json = context.query;
        let {reasons, delay, ...person} = json;
        if (!reasons || reasons.length == 0){
            reasons = ['travail']
        }
        else {
            reasons = json.reasons.split(',');
        }
        const profile = computeProfile(json, delay);
        context.res.setHeader('Content-Disposition', `filename="${pdfName(profile)}"`);
        return await downloadPDF(profile, reasons);
    }
);

app.get('/set',
    async function buildURL(context){
        const options = {
            'profile': context.query, 
            'available_reasons': Array.from(reasonFields()),
            'github-url': "https://github.com/cglacet/attestations",
            'ENV': ENV,
        }
        if (!options.profile.reasons || options.profile.reasons.length < 1){
            options.profile.reasons = ['travail']
        }
        options.profile.birthdayEN = fromFrenchDate(options.profile.birthday);
        return render('build-url.hbs', options);
    }
);

app.get('/stats',
    async function readCounters(context){
        const env = (context.query.production != undefined)? "" : ENV;
        const [statsGET, statsSET] = await Promise.all([
            readCounter('get', env),
            readCounter('set', env),
        ]);
        return json({
            'get': await statsGET.json(),
            'set': await statsSET.json(),
            'creationDate': COUNTER_START_DATE.toJSON(),
        });
    }
);

async function downloadPDF(profile, reasons){
    const pdf = await certificatePDF(profile, reasons);
    return type('application/pdf').send(new Buffer(pdf));
}