import { fileURLToPath } from 'url';
import { join as pathJoin, dirname } from 'path';
import fetch from "node-fetch";
import server from 'server';
import { getCertificates, getCertificate, certificatePDF, pdfName } from './certificates';
import { ENV, getProfile, profile as computeProfile } from './config';
import { reasonFields } from './help';
import blobPolyfill from 'blob-polyfill';
import hbs from 'hbs';

global.fetch = fetch;
const { get, post } = server.router;
const { send, json, type, render } = server.reply;
const { Blob } = blobPolyfill;

hbs.registerHelper('ifIn', function(arg1, arg2, options) {
    if (arg2 && arg2.includes(arg1)){
        return options.fn(this)
    }
    return options.inverse(this);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const partialsDirectory = pathJoin(__dirname, '..', 'templates/partials');
hbs.registerPartials(partialsDirectory, function (err) {});

server({ port: 8080, log: 'notice' }, [
    // Endpoints that use the built-in config file:
    // get('/certificate', certificate),
    get('/get-short', certificateDownload),
    // get('/certificates', certificates),

    // Public endpoints, no config
    get('/get', certificateNoConfig),
    get('/set', buildURL),
    get('/stats', stats),
    get('/getStats', getStats)
]);


async function certificate(context){
    try {
        const profile = getProfile(context.query.id, context.query.delay);
        return await getCertificate(profile, context.query.reasons.split(','));
    }
    catch (error){
        return {'error': `${error}`};
    }
}

// /get-short?id=carole&reasons=travail
// /get-short?id=christian&reasons=travail
// /get-short?id=carole&reasons=achats
// /get-short?id=christian&reasons=achats
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

async function downloadPDF(profile, reasons){
    context.res.setHeader('Content-Disposition', `filename="${pdfName(profile)}"`);
    const pdf = await certificatePDF(profile, reasons);
    return type('application/pdf').send(new Buffer(pdf));
}

async function certificates(context){
    try {
        return await getCertificates(context.query.reasons.split(','));
    }
    catch (error){
        return {'error': `${error}`};
    }
}

// Example : /get?firstname=christian&lastname=glacet&reasons=travail,achats&birthday=31%2F07%2F1986&placeofbirth=Seine%20St.%20Denis&address=48%20rue%20Camille%20Pelletan%2C%20bat.%20B%2C%20apt.%2045&zipcode=33400&city=Talence
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
    return await downloadPDF(profile, reasons);
}

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
    return render('../templates/build-url.hbs', options);
}

function fromFrenchDate(dd_mm_yyyy){
    try {
        const [dd, mm, yyyy] = dd_mm_yyyy.split('/');
        if (dd == undefined || mm == undefined || yyyy == undefined) {
            return "";
        }
        return `${yyyy}-${mm}-${dd}`;
    }
    catch (e) {
        return "";
    }
}

const COUNTER_START_DATE = new Date(2020, 10, 5, 18, 16, 0);
const COUNTER_HIT = "https://api.countapi.xyz/hit/cglacet-attestation";
const COUNTER_GET = "https://api.countapi.xyz/get/cglacet-attestation";

async function incrementCounter(endpoint, env = ENV){
    return await fetch(`${COUNTER_HIT}/${endpoint}${env}`);
}
async function readCounter(endpoint, env = ENV){
    return await fetch(`${COUNTER_GET}/${endpoint}${env}`);
}


async function stats(context){
    return render('../templates/stats.hbs', {});
}

async function getStats(context){
    const env = (context.query.production != undefined)? "" : ENV;
    const [statsGET, statsSET] = await Promise.all([
        readCounter('get', env),
        readCounter('set', env),
    ]);
    return json({
        certificates: await statsGET.json(),
        visits: await statsSET.json(),
        creationDate: COUNTER_START_DATE.toJSON(),
    });
}