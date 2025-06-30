import { MongoClient, Db } from 'mongodb'
import { PnL } from './types'

const MONGO_URL = process.env.MONGO_URL || 'mongodb://database:27017'
const DB_NAME = process.env.DB_NAME || 't1_coding_challenge'

let client: MongoClient | null = null
let db: Db | null = null


export async function connectToDb(): Promise<Db> {
    if (!client) {
        client = new MongoClient(MONGO_URL)

        try {
            await client.connect()
            db = client.db(DB_NAME)
        } catch (error) {
            console.error('MongoDB connection error:', error)
            throw error
        }
    }

    return db!
}

export async function fetchPnLResults(limit = 20): Promise<PnL[]> {
    const database = await connectToDb()
    const collection = database.collection('pnl_results')

    try {
        const results = await collection
            .find({}, {
                projection: {
                    _id: 0,
                    startTime: 1,
                    endTime: 1,
                    pnl: 1
                }
            })
            .sort({ startTime: -1 })
            .limit(limit)
            .toArray()

        return results.map((r): PnL => ({
            startTime: r.startTime,
            endTime: r.endTime,
            pnl: r.pnl
        }))
    } catch (error) {
        console.error('Error fetching PnL results:', error)
        return []
    }
}


const gracefulShutdown = async () => {
    if (client) {
        try {
            await client.close()
        } catch (err) {
            console.error('Error closing MongoDB connection:', err)
        } finally {
            process.exit(0)
        }
    }
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
process.on('SIGQUIT', gracefulShutdown)