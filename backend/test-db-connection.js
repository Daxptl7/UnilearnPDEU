
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();

console.log('--- DNS DIAGNOSTICS ---');
const hostname = 'dxdatabase.hcnspmi.mongodb.net';
const srvRecord = `_mongodb._tcp.${hostname}`;

console.log(`Resolving SRV for: ${srvRecord}`);
dns.resolveSrv(srvRecord, (err, addresses) => {
    if (err) {
        console.error('DNS SRV Lookup FAILED:', err);
    } else {
        console.log('DNS SRV Lookup SUCCEEDED:', addresses);
    }
});

console.log('\n--- MONGOOSE CONNECTION TEST ---');
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('ERROR: MONGODB_URI is undefined. Check .env');
    process.exit(1);
}

console.log('Attempting to connect with Mongoose...');
mongoose.connect(uri)
    .then(() => {
        console.log('SUCCESS: Mongoose connected!');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: Mongoose connection failed:', err);
        process.exit(1);
    });
