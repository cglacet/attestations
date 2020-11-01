import formData from '../data/form-data.json';

const reasonsData = formData.flat(1).find(field => field.key === 'reason');

export function* reasonFields(){
    yield* reasonsData['items'];
}

// export function logOptions(){
//     for (const r of reasonFields()){
//         console.log(' - ', r['code'], '\t\t # ', r['label']);
//     }    
// }