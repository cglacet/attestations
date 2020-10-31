import formData from '../data/form-data.json';

const reasonsData = formData.flat(1).find(field => field.key === 'reason');
for (const r of reasonsData['items']){
    console.log(' - ', r['code'], '\t\t # ', r['label']);
}