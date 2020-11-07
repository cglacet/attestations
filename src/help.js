import formData from '../data/form-data.json';
import { COUNTER_START_DATE } from './config';

const reasonsData = formData.flat(1).find(field => field.key === 'reason');

export function* reasonFields(){
    yield* reasonsData['items'];
}

export function fromFrenchDate(dd_mm_yyyy){
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

const COUNTER_HIT = "https://api.countapi.xyz/hit/cglacet-attestation";
const COUNTER_GET = "https://api.countapi.xyz/get/cglacet-attestation";

export async function incrementCounter(endpoint, env = ENV){
    return await fetch(`${COUNTER_HIT}/${endpoint}${env}`);
}
export async function readCounter(endpoint, env = ENV){
    return await fetch(`${COUNTER_GET}/${endpoint}${env}`);
}