import fetch from "node-fetch";
import server from 'server';
import { getCertificates, getCertificate, certificatePDF, pdfName } from './certificates';
import { getProfile, profile as computeProfile } from './config';
import { reasonFields } from './help';
import blobPolyfill from 'blob-polyfill';
import hbs from 'hbs';

global.fetch = fetch;
const { get, post } = server.router;
const { send, json, type, render } = server.reply;
const { Blob } = blobPolyfill;


hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('ifIn', function(arg1, arg2, options) {
    if (arg2 && arg2.includes(arg1)){
        return options.fn(this)
    }
    return options.inverse(this);
});

server({ port: 8080 }, [
    // Endpoints that use the built-in config file:
    // get('/certificate', certificate),
    get('/get-short', certificateDownload),
    // get('/certificates', certificates),

    // Public endpoints, no config
    get('/get', certificateNoConfig),
    get('/set', buildURL),
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

async function buildURL(context){
    const options = {
        'profile': context.query, 
        'available_reasons': Array.from(reasonFields())
    }
    if (!options.profile.reasons || options.profile.reasons.length < 1){
        options.profile.reasons = ['travail']
    }
    options.profile.birthday = fromFrenchDate(options.profile.birthday);
    return render('../templates/build-url.hbs', options);
}


function fromFrenchDate(dd_mm_yyyy){
    try {
        const [dd, mm, yyyy] = dd_mm_yyyy.split('/');
        return `${yyyy}-${mm}-${dd}`;
    }
    catch (e) {
        console.log("Error", e);
        return dd_mm_yyyy;
    }
}