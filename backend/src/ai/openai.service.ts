import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      console.warn('OpenAI API key not found. Text processing features will not work.');
    }
    
    this.openai = new OpenAI({
      apiKey,
    });
  }

  /**
   * Summarize contract text into a concise summary
   * @param text The contract text to summarize
   * @returns A summary of the contract
   */
  async summarizeContract(text: string): Promise<string> {
    try {
      if (!this.configService.get<string>('OPENAI_API_KEY')) {
        return 'API key not configured. Summary not available.';
      }

      // Truncate text if it's too long
      const maxLength = this.configService.get<number>('OPENAI_MAX_TEXT_LENGTH') || 15000; // OpenAI has token limits
      const truncatedText = text.length > maxLength 
        ? text.substring(0, maxLength) + '... [text truncated due to length]'
        : text;

      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a legal assistant that summarizes contracts. Provide a concise 5-bullet summary of the key points in the contract.'
          },
          {
            role: 'user',
            content: truncatedText
          }
        ],
        max_tokens: this.configService.get<number>('OPENAI_MAX_TOKENS') || 500,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || 'Summary generation failed.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return 'Error generating summary. Please try again later.';
    }
  }

  /**
   * Extract key information from contract text
   * @param text The contract text to analyze
   * @returns Extracted metadata as JSON
   */
  async extractContractMetadata(text: string): Promise<any> {
    try {
      if (!this.configService.get<string>('OPENAI_API_KEY')) {
        return { error: 'API key not configured.' };
      }

      // Truncate text if it's too long
      const maxLength = this.configService.get<number>('OPENAI_MAX_TEXT_LENGTH') || 15000;
      const truncatedText = text.length > maxLength 
        ? text.substring(0, maxLength) + '... [text truncated due to length]'
        : text;

      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Extract the following information from the contract: effective date, expiry date, parties involved, contract type. Return as JSON.'
          },
          {
            role: 'user',
            content: truncatedText
          }
        ],
        max_tokens: this.configService.get<number>('OPENAI_MAX_TOKENS') || 500,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return { error: 'Error extracting metadata.' };
    }
  }
} 