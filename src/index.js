global.fetch = require("node-fetch");
import server from 'server';
import { getCertificates, getCertificate } from './certificates';
import { getProfile } from './config';


const { get, post } = server.router;
const { download, json } = server.reply;


server({ port: 8080 }, [
    get('/certificate', certificate),
    get('/certificates', certificates)
]);


async function certificate(context){
    try {
        const profile = getProfile(context.query.name);
        return await getCertificate(profile, context.query.reasons.split(','));
    }
    catch (error){
        return {'error': `${error}`};
    }
}

async function certificates(context){
    try {
        return await getCertificates(context.query.reasons.split(','));
    }
    catch (error){
        return "Error";
    }
}