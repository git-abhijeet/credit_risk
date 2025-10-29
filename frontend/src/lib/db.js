import { MongoClient } from "mongodb";

let client;
let clientPromise;

export function getClientPromise() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }

    if (clientPromise) return clientPromise;

    client = new MongoClient(uri);

    if (process.env.NODE_ENV === "development") {
        // Maintain a global across module reloads in dev
        if (!global._mongoClientPromise) {
            global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise;
    } else {
        clientPromise = client.connect();
    }

    return clientPromise;
}

export default getClientPromise;
