-- Create the model
CREATE MODEL mindsdb.sentiment_classifier
PREDICT sentiment
USING engine='huggingface',
  model_name= 'cardiffnlp/twitter-roberta-base-sentiment',
  input_column = 'comment',
  labels=['negative','neutral','positive'];

-- Get the details about the model
SELECT *
FROM mindsdb.models
WHERE name = 'sentiment';
