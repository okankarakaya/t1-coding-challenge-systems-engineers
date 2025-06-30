import { KafkaConsumer } from 'node-rdkafka'

let kafkaConsumer: KafkaConsumer | null = null

export function registerKafkaConsumer(consumer: KafkaConsumer) {
    kafkaConsumer = consumer
}

export function setupShutdownHooks() {
    const shutdown = async () => {
        if (kafkaConsumer) {
            try {
                kafkaConsumer.disconnect()
            } catch (err) {
                console.error('Error disconnecting Kafka:', err)
            }
        }

        process.exit(0)
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
    process.on('SIGQUIT', shutdown)
}