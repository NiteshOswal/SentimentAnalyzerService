# SentimentAnalyzerService
The internet is a huge source of unorganized data. Unknowingly, people sharing their daily thoughts and opinions on social media or other content channels, are contributing towards a global change to the perspective of their content consumers. Sentiment analysis (also known as opinion mining) refers to the use of natural language processing, text analysis and computational linguistics to identify and extract subjective information in source materials.

Our objective, although small, but challenging, is to classify popular perspective or sentimental orientation about a topic into either "good" or "bad" using the data mining advancements. Generally, it aims to determine the attitude of a speaker or a writer with respect to some topic or the overall contextual polarity of a document.
The attitude may be his or her judgment or evaluation, affective state, or the intended emotional communication.

With keen focus towards the polarity classification method, we propose easy to use applications over the algorithms that are used for sentimental orientation calculation. Our dataset for popular opinions is limited to a feed of public tweets on Twitter[10] with several limitations. The approach used, claims to provide closely approximated rating score to a topic, whose accuracy can then be compared with already available feedback score on the internet. The rating score is an approach to tell the popularity of the search topic among the huge chunks of data that is collected and tokenised.


## Requirements

1. Node.js >= v5.8.0
2. NPM >= 3.7.3
3. Bower >= 1.7.9

## How to run it?

**Preparations**
```bash
npm install
bower install
```
[Setup a Twitter application](https://apps.twitter.com/ "Twitter Application Dashboard")

In the project's root
```bash
cp config.json.example config.json
```
Add your Twitter application's necessary credentials in `config.json` & you're all set!

**Execution!**

For CLI Mode
```bash
npm run cli
```

For Web Mode
```bash
npm start
```

The core design of the approach developed is divided into the following three phases, Feedback collection, Text pre-processing, Synthesization. The applications built over it use the same core APIs but with different models and result sets. "Feedback Analyser" is built to process feedbacks and return the topic's score calculated during synthesization, whereas, "Popular Status Analyser" is built to return the sentimental score of an entity and compare it with another entity in the same or different cateogory. The presented models successfully compute the sentimental orientation scores for given topics with high accuracy provided large datasets or feedbacks are collected.

[More details about the project, it's motivation & references can be found in this report](https://drive.google.com/file/d/0B7RfjVQpwNDSWFQ4NC1LLTkzVzA/view?usp=sharing "An approach to calculate sentimental orientation of data")