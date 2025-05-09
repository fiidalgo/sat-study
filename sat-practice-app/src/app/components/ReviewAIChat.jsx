'use client';
import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import OpenAI from 'openai';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import MarkdownIt from 'markdown-it';
import markdownItKatex from 'markdown-it-katex';

export default function ReviewAIChat({ question, selectedAnswer, options, imageURL }) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');

  // Clear response when question changes
  useEffect(() => {
    setResponse('');
    setUserQuestion('');
  }, [question]);

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPEN_AI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  }).use(markdownItKatex);

  const handleQuestionPreset = (presetQuestion) => {
    setUserQuestion(presetQuestion);
    handleUserQuestionSubmit(null, presetQuestion);
  }

  const handleUserQuestionSubmit = async (event, presetQuestion) => {
    if (event) event.preventDefault();
    const questionToUse = presetQuestion || userQuestion;
    if (!questionToUse) return;

    setLoading(true);
    setResponse('');

    try {
      const messages = [
        {
          role: 'system',
          content: `Your name is Brill, You are a helpful SAT tutoring assistant, your answers should be crafted to be understood by a 10 year old kid. You're reviewing a previously answered question. The question: ${question}. The answer the user selected: ${selectedAnswer}. All answer choices: ${JSON.stringify(options)}. Use markdown for all output. When presenting mathematical equations or formulas, use LaTeX syntax enclosed in double dollar signs for block math (e.g., $$x^2 + y^2 = z^2$$) and single dollar signs for inline math (e.g., $E=mc^2$).`,
        },
        { role: 'user', content: questionToUse },
      ];

      if (imageURL) {
        messages.push({
          role: 'user',
          content: [{
            type: 'image_url',
            image_url: {
              url: `${imageURL}`,
            },
          }],
        });
      }

      const stream = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          setResponse((prev) => prev + content);
        }
      }

    } catch (error) {
      if (error.status === 429) {
        setResponse('You are sending requests too quickly. Please wait a moment and try again.');
      } else {
        console.error('Error fetching AI response:', error);
        setResponse('Error fetching response from AI.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderMath = (mathString) => {
    try {
      return katex.renderToString(mathString, {
        throwOnError: false,
        displayMode: false,
      });
    } catch (error) {
      console.error('Error rendering math:', error);
      return mathString;
    }
  };

  const renderBlockMath = (mathString) => {
    try {
      return katex.renderToString(mathString, {
        throwOnError: false,
        displayMode: true,
      });
    } catch (error) {
      console.error('Error rendering block math:', error);
      return mathString;
    }
  };

  const renderResponse = (response) => {
    const inlineMathRegex = /\$([^$]+)\$/g;
    const blockMathRegex = /\$\$([^$]+)\$\$/g;

    response = response.replace(blockMathRegex, (match, p1) => {
      return renderBlockMath(p1);
    });

    response = response.replace(inlineMathRegex, (match, p1) => {
      return renderMath(p1);
    });

    return md.render(response);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Brill: Your Personalized AI Tutor</h3>
      <form onSubmit={(e) => handleUserQuestionSubmit(e)} style={styles.inputContainer}>
        <MessageCircle style={styles.icon} />
        <input
          type="text"
          placeholder="Ask me anything about this question!"
          style={styles.input}
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
        />
        <button type="submit" style={styles.submitButton}>
          Ask
        </button>
      </form>
      <div style={{ fontSize: '14px', paddingTop: '10px' }}>Suggestions:</div>
      <div style={styles.buttonContainer}>
        <button onClick={() => handleQuestionPreset("Explain the answer")} style={styles.secondaryButton}>
          Explain
        </button>


        <button onClick={() => handleQuestionPreset("Tell me why my answer is incorrect without revealing the correct answer")} style={styles.secondaryButton}>
          Why is my answer incorrect
        </button>
      </div>
      <div style={styles.paddingBox}>
        <div style={styles.responseBox}>
          <div style={styles.innermostBox} dangerouslySetInnerHTML={{ __html: renderResponse(response) }} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  buttonContainer: { 
    paddingTop: '10px'
  },
  container: {
    padding: '20px',
    borderRadius: '20px',
    margin: '10px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  },
  paddingBox: {
    backgroundColor: '#f3f3f3',
    marginTop: '8px',
    padding: '30px',
    borderRadius: '8px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: '16px',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
  },
  icon: {
    width: '20px',
    height: '20px',
    color: '#65a30d',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
  },
  submitButton: {
    padding: '8px 16px',
    backgroundColor: '#65a30d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  responseBox: {
    padding: '10px',
    borderRadius: '8px',
  },
  secondaryButton: {
    padding: '8px 16px',
    backgroundColor: '#e6f0e6',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '10px'
  },
}; 