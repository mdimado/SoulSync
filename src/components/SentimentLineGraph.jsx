import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SentimentLineGraph = ({ sentiments }) => {
  console.log('SentimentLineGraph - Initial sentiments:', sentiments);

  const dailyAverageMood = useMemo(() => {
    // Add validation for sentiments array
    if (!sentiments || !Array.isArray(sentiments)) {
      console.log('SentimentLineGraph - Invalid or empty sentiments array');
      return [];
    }

    // Group sentiments by date with proper date validation
    const groupedByDate = sentiments.reduce((acc, sentiment) => {
      // Validate created_at date
      console.log('Processing sentiment:', sentiment);
      
      const dateObj = new Date(sentiment.createdAt);
      console.log('Created date object:', dateObj);
      
      if (isNaN(dateObj.getTime())) {
        console.log('Invalid date found:', sentiment.createdAt);
        return acc; // Skip invalid dates
      }
      
      const date = dateObj.toISOString().split('T')[0];
      console.log('Processed date:', date);

      if (!acc[date]) {
        acc[date] = {
          joy: [],
          sadness: [],
          anger: [],
          fear: [],
          disgust: [],
          surprise: [],
          neutral: []
        };
      }
      
      // Validate emotions object
      console.log('Processing emotions:', sentiment.emotions);
      
      if (sentiment.emotions && typeof sentiment.emotions === 'object') {
        Object.entries(sentiment.emotions).forEach(([emotion, score]) => {
          if (typeof score === 'number' && !isNaN(score)) {
            acc[date][emotion].push(score);
          }
        });
      }
      
      return acc;
    }, {});

    console.log('Grouped by date:', groupedByDate);

    // Calculate daily averages and find dominant emotion
    const dailyMoods = Object.entries(groupedByDate).map(([date, emotions]) => {
      const averages = Object.entries(emotions).reduce((acc, [emotion, scores]) => {
        const avg = scores.length > 0 
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;
        acc[emotion] = avg;
        return acc;
      }, {});

      console.log(`Averages for ${date}:`, averages);

      const dominantEmotion = Object.entries(averages).reduce((max, [emotion, score]) => 
        score > max.score ? { emotion, score } : max
      , { emotion: 'neutral', score: -1 });

      console.log(`Dominant emotion for ${date}:`, dominantEmotion);

      const moodScore = {
        joy: 1,
        surprise: 0.5,
        neutral: 0,
        disgust: -0.3,
        fear: -0.5,
        sadness: -0.7,
        anger: -1
      }[dominantEmotion.emotion] || 0;

      return {
        date,
        mood: moodScore,
        dominantEmotion: dominantEmotion.emotion,
        score: dominantEmotion.score
      };
    });

    console.log('Final daily moods data:', dailyMoods);
    return dailyMoods.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [sentiments]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-600">{new Date(label).toLocaleDateString()}</p>
          <p className="font-medium capitalize">
            Dominant: {data.dominantEmotion}
          </p>
          <p className="text-sm text-gray-600">
            Confidence: {(data.score * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96 bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Mood Trends</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={dailyAverageMood}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="text-gray-200" />
          <XAxis 
            dataKey="date" 
            tickFormatter={str => {
              try {
                return new Date(str).toLocaleDateString();
              } catch (e) {
                return str;
              }
            }}
            className="text-sm"
          />
          <YAxis
            domain={[-1, 1]}
            tickFormatter={value => {
              const labels = {
                1: 'Very Positive',
                0.5: 'Positive',
                0: 'Neutral',
                '-0.5': 'Negative',
                '-1': 'Very Negative'
              };
              return labels[value] || '';
            }}
            className="text-sm"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 4, fill: "#6366f1" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentLineGraph;