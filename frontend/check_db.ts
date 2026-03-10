import { infractionsApi } from './lib/api';

async function test() {
    try {
        const data = await infractionsApi.getAll();
        console.log('Sample data:', data[0]);
    } catch (err) {
        console.error('Error:', err);
    }
}
test();
