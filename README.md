# Terra One Coding Challenge for System Engineers

## Goal

This challenge is designed to test your ability to handle real-time data processing, implement scalable architectures, and effectively manage distributed microservices.

## Challenge

You can find the challenge [here](https://docs.google.com/document/d/1fhYF3M1IKbiDjCEj_C0Lnv_SIkPPphhG9sWserl_DtI/)

## Setup

1. Fork this repository
2. Clone the forked repository
3. Run `npm start` to start all necessary services
4. Run `npm kafka:setup` to create the necessary Kafka topics
5. Implement the challenge. We marked all relevant places with `// YOUR CODE HERE` comments
   - The frontend service is reachable via `http://localhost:3000`. You can use the provided frontend to test your implementation
6. Push your code to your forked repository
7. Submit the link to your forked repository

Happy Coding 🚀

Changes and Implementation Notes

   •	Updated kafka-setup.sh to ensure both market and trades topics use 3 partitions. Before running the script, confirm both topics exist with

docker exec -it t1-coding-challenge-kafka kafka-topics --bootstrap-server localhost:9092 --describe --topic market
docker exec -it t1-coding-challenge-kafka kafka-topics --bootstrap-server localhost:9092 --describe --topic trades
 
   •	Replaced fetch-based streaming in useStream with the EventSource in the frontend app

   •	calculation-service runs with 2 instances, and uses a Kafka consumer group. This prevents duplicate processing.
      auto.commit flag is false. This ensures that messages are only marked as “processed” after successful handling and DB insert. It prevents losing or double-processing messages if the service crashes mid-processing.
      Two collections are used: 
           trades_buffer: stores all trades with a TTL index
	        pnl_results: stores calculated PnL data, with a unique index on startTime + endTime to prevent duplicate entries

   •  The frontend service only fetches and returns the last 20 PnL results to avoid overwhelming the UI.